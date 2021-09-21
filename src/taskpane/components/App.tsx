import * as React from "react";
import { Analysis } from "../../excelint/core/analysis";
import * as XLNT from "../../excelint/core/ExceLintTypes";
import { Option, None, Some } from "../../excelint/core/option";
import { ExcelUtils } from "../../excelint/core/excelutils";
import { Timer } from "../../excelint/core/timer";

/* vvvv This is an eslint directive vvvv */
/* global console, document, Office, Excel */
/* ^^^^ Do not delete!!! ^^^^ */

/**
 * Represents the underlying data model.
 */
export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

interface ExceLintTime {
  total_μs: number;
}

/**
 * An interface representing React App UI state.
 * Currently just a stub.
 */
export interface AppState {
  canRestore: boolean;
  changeat: string;
  time_data: Option<ExceLintTime>;
  debug: boolean;
  use_styles: boolean;
  fixes: string[];
  formula: string;
}

/**
 * Global startup routine for the plugin. Excel API and spreadsheet will be
 * initialized.  App class (below) and React state will not be initialized.
 */
run(async () => {
  await Office.onReady();

  // Check the version of Office
  if (!Office.context.requirements.isSetSupported("ExcelApi", "1.7")) {
    console.log("Sorry, this add-in only works with newer versions of Excel.");
  }
  // Register handlers here.
});

/**
 * When the user presses a key in the taskpane formula input,
 * update the selected cell and run an incremental analysis.
 */
async function onInput(_e: HTMLElement, addr: XLNT.Address, app: App): Promise<void> {
  const t = new Timer("onUpdate");

  if (ExcelUtils.isACell(addr.toA1Ref())) {
    // set contents of cell
    await Excel.run(async (context: Excel.RequestContext) => {
      // get active sheet
      const activeSheet = context.workbook.worksheets.getActiveWorksheet();

      // get used range
      const usedRange = await App.getCurrentUsedRange(activeSheet, context);

      // get range contents
      const rng = activeSheet.getCell(addr.row - 1, addr.column - 1);

      // get formula text from taskpane input
      const f = (document.getElementById("formulaInput") as HTMLInputElement).value;

      // set cell contents from taskpane input
      // also proactively load address for later use
      rng.formulas = [[f]];
      rng.load(["address"]);
      await context.sync();

      // get formulas
      const formulas = await App.getFormulasFromRange(activeSheet, usedRange, true, context);

      // run analysis
      const fixes: XLNT.ProposedFix[] = Analysis.analyze(addr, formulas);

      // generate fixes
      const fixstrs = Analysis.synthFixes(addr, fixes, formulas);

      // total time
      const elapsed = Timer.round(t.elapsedTime());

      const td = {
        total_μs: elapsed,
      };

      console.log("Found fixes:\n" + fixstrs.map((s) => "\t" + s).join("\n"));

      // update the UI state
      const canRestore = app.DEBUG && document.getElementById("RestoreButton")!.onclick !== null;
      const changeAt = addr.worksheet + "!R" + addr.row + "C" + addr.column + " (" + rng.address + ")";
      const time_data = new Some(td);

      app.setState({
        canRestore: canRestore,
        changeat: changeAt,
        time_data: time_data,
        // debug: boolean,
        // use_styles: boolean,
        fixes: fixstrs,
        // formula: string
      });

      console.log("updated react state");
    });
  }
}

/**
 * The class that represents the task pane, including React UI state.
 */
export default class App extends React.Component<AppProps, AppState> {
  // eslint-disable-next-line no-unused-vars
  private inputListener: (this: HTMLElement) => Promise<void> = async function () {};

  /**
   * Gets debug state.
   */
  public get DEBUG(): boolean {
    return this.state.debug;
  }

  /**
   * Sets debug state.
   */
  public set DEBUG(value: boolean) {
    this.setState({
      debug: value,
    });
  }

  /**
   * Gets style state.
   */
  public get STYLE(): boolean {
    return this.state.use_styles;
  }

  public set STYLE(value: boolean) {
    this.setState({
      use_styles: value,
    });
  }

  /**
   * Toggles the debug state.
   * @returns The state after toggle is complete.
   */
  public toggleDebugState(): boolean {
    const oldState = this.DEBUG;
    this.DEBUG = !oldState;
    return this.DEBUG;
  }

  /**
   * Toggles the style state.
   * @returns The state after toggle is complete.
   */
  public toggleStyleState(): boolean {
    const oldState = this.STYLE;
    this.STYLE = !oldState;
    return this.STYLE;
  }

  constructor(props: AppProps, context: Office.Context) {
    super(props, context);
    this.state = {
      canRestore: false,
      changeat: "",
      time_data: None,
      debug: false,
      use_styles: false,
      fixes: [],
      formula: "",
    };
  }

  /*
   * Gets the worksheet name from the current worksheet.
   */
  public static async getWorksheetName(): Promise<string> {
    let name: string = "";
    await Excel.run(async (context) => {
      const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
      currentWorksheet.load(["name"]);
      await context.sync();
      name = currentWorksheet.name;
    });
    return name;
  }

  public static async getCurrentUsedRange(ws: Excel.Worksheet, context: Excel.RequestContext): Promise<XLNT.Range> {
    const usedRange = ws.getUsedRange();
    usedRange.load("address");
    await context.sync();
    const addr = usedRange.address;
    return ExcelUtils.rngA1toR1C1(addr);
  }

  /**
   * Retrieves all formulas inside the given range.  Must be run
   * inside an active Excel request context.
   * @param ws An Excel.Worksheet object.
   * @param r An XLNT.Range object representing the region of interest.
   * @param context An Excel.RequestContext.
   * @returns A dictionary containing only formulas.
   */
  public static async getFormulasFromRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    include_equals: boolean,
    context: Excel.RequestContext
  ): Promise<XLNT.Dictionary<string>> {
    var range = ws.getRange(r.toA1Ref());
    range.load("formulas");
    await context.sync();
    let formulas: string[][] = range.formulas;

    // find origin
    const origin_x = r.upperLeftColumn;
    const origin_y = r.upperLeftRow;

    // we don't care about values, only formulas
    const d = new XLNT.Dictionary<string>();
    for (let row = 0; row < formulas.length; row++) {
      for (let col = 0; col < formulas[row].length; col++) {
        const val = formulas[row][col];
        /*
         * 'If the returned value starts with a plus ("+"), minus ("-"),
         * or equal sign ("="), Excel interprets this value as a formula.'
         * https://docs.microsoft.com/en-us/javascript/api/excel/excel.range?view=excel-js-preview#values
         */
        if (val[0] === "=" || val[0] === "+" || val[0] === "-") {
          // save as 1-based Excel address
          const key = new XLNT.ExceLintVector(origin_x + col, origin_y + row, 0).asKey();

          if (val[0] === "=") {
            // remove "=" from start of string and
            d.put(key, include_equals ? val : val.substr(1));
          } else {
            // it's a "+/-" formula
            d.put(key, include_equals ? "=" + val : val);
          }
        }
      }
    }
    return d;
  }

  /**
   * When the user selects a cell, populate the taskpane formula input.
   * @param args
   */
  public async onSelectionChange(args: Excel.WorksheetSelectionChangedEventArgs): Promise<void> {
    if (ExcelUtils.isACell(args.address)) {
      await Excel.run(async (context: Excel.RequestContext) => {
        /*
         * The following replaces the keypress handler on the taskpane input
         * with a keypress handler for the current selection.
         */

        // convert address in selection change event to XLNT object
        const addr = ExcelUtils.addrA1toR1C1(args.address);

        // read properties since listener this shadow App's this
        const app = this;

        // update the event handler that responds to typing with the new address
        const inputField = document.getElementById("formulaInput");
        inputField!.removeEventListener("input", this.inputListener);

        // eslint-disable-next-line no-unused-vars
        this.inputListener = async function (this: HTMLElement) {
          // this is just the default handler
          // we remove and replace it anytime the selection changes, to
          // hardcode the address since a appears to be copied by value
          await onInput(this, addr, app);
        };
        inputField!.addEventListener("input", this.inputListener);

        /*
         * The following updates taskpane diagnostic information; mainly
         * it updates the input field with data from the selected cell in
         * the grid.
         */

        // get the active sheet
        const activeSheet = context.workbook.worksheets.getActiveWorksheet();

        // query grid for formulas
        activeSheet.load("name");
        const rng = activeSheet.getCell(addr.row - 1, addr.column - 1);
        rng.load("formulas");
        await context.sync();

        // rng.formulas returns a 1x1 2D array
        const formula = rng.formulas[0][0];

        // populate the text input with the formula from the selected cell
        (inputField as HTMLInputElement)!.value = formula;

        // let React know about the change
        this.setState({
          changeat: activeSheet.name + "!" + args.address,
          formula: formula,
        });
      });
    } else {
      this.setState({
        changeat: args.address,
        formula: "",
      });
    }
  }

  /**
   * Runs after this component is rendered. Used to initialize the UI, including
   * event handlers, etc.
   */
  public componentDidMount(): void {
    // Any event handlers to be run "in context" AFTER React is done rendering
    // can be inserted below.
    Excel.run(async (context: Excel.RequestContext) => {
      const worksheets = context.workbook.worksheets;

      // register change event with onRangeChange
      // const chgHandler = (args: Excel.WorksheetChangedEventArgs) => this.onRangeChange(args);
      // worksheets.onChanged.add(chgHandler);

      // register click event with onSelectionChanged
      const clkHandler = (args: Excel.WorksheetSelectionChangedEventArgs) => this.onSelectionChange(args);
      worksheets.onSelectionChanged.add(clkHandler);
    });
  }

  /**
   * Renders the task pane.
   */
  render() {
    const button = this.DEBUG ? (
      <button type="button" disabled={!this.state.canRestore} id="RestoreButton">
        Restore
      </button>
    ) : null;

    const fixes = this.state.fixes.map((fix) => (
      // eslint-disable-next-line react/jsx-key
      <li>{fix}</li>
    ));

    console.log("In render, have fixes HTML (" + this.state.fixes.length.toString() + "): \n" + fixes);

    return (
      <div style={{ padding: "1em", backgroundColor: "#cc99ff" }}>
        <div className="ms-welcome">
          At: <em>{this.state.changeat}</em>
        </div>
        <div className="ms-welcome">
          Total time: {this.state.time_data.hasValue ? this.state.time_data.value.total_μs : ""} μs
        </div>
        {/*
        <div>
          <input type="checkbox" id="doDEBUG" checked={this.DEBUG} onChange={() => this.toggleDebugState()} />
          <label htmlFor="doDEBUG">Show debug output</label>
        </div>
        */}

        <div>
          <input type="checkbox" id="doSTYLES" checked={this.STYLE} onChange={() => this.toggleStyleState()} />
          <label htmlFor="doSTYLES">Use style discounts</label>
        </div>
        {button}
        <div>
          <input type="text" id="formulaInput" style={{ width: "90%" }} />
        </div>
        <div>
          <ol>{fixes}</ol>
        </div>
      </div>
    );
  }
}

/**
 * I made this solely because I hate how IIFE looks. It's just a
 * thing that runs an async lambda.
 * @param f An async lambda.
 */
async function run<T>(f: () => Promise<T>): Promise<T> {
  return f();
}
