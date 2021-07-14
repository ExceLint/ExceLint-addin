import * as React from "react";
import { Analysis } from "../../excelint/core/analysis";
import * as XLNT from "../../excelint/core/ExceLintTypes";
import { Option, None, Some } from "../../excelint/core/option";
import { ExcelUtils } from "../../excelint/core/excelutils";
import { Timer } from "../../excelint/core/timer";
import { Config } from "../../excelint/core/config";
// import { RectangleUtils } from "../../excelint/core/rectangleutils";

/* vvvv This shit right here ain't a comment! vvvv */
/* global console, document, Office, Excel */
/* ^^^^ It's actually an eslint directive!!!! ^^^^ */

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
 * For storing old color values;
 */
class OldColor {
  public color: string = "#FFFFFF";
  public range: XLNT.Range;

  constructor(color: string, range: XLNT.Range) {
    this.color = color;
    this.range = range;
  }
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
 * Returns a Range object representing the used range in the given worksheet.
 * @param ws A worksheet
 * @param context An Excel context
 * @returns XLNT.Range
 */
export async function getCurrentUsedRange(ws: Excel.Worksheet, context: Excel.RequestContext): Promise<XLNT.Range> {
  const usedRange = ws.getUsedRange();
  usedRange.load("address");
  try {
    await context.sync();
  } catch (e) {
    console.log(e);
  }

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
export async function getFormulasFromRange(
  ws: Excel.Worksheet,
  r: XLNT.Range,
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
          d.put(key, val.substr(1));
        } else {
          // it's a "+/-" formula
          d.put(key, val);
        }
      }
    }
  }
  return d;
}

/**
 * Retrieves all data of type number inside the given range.  Must be run
 * inside an active Excel request context.
 * @param ws An Excel.Worksheet object.
 * @param r An XLNT.Range object representing the region of interest.
 * @param context An Excel.RequestContext.
 * @returns A dictionary containing only numeric data, including formula outputs.
 */
export async function getNumericDataFromRange(
  ws: Excel.Worksheet,
  r: XLNT.Range,
  context: Excel.RequestContext
): Promise<XLNT.Dictionary<number>> {
  var range = ws.getRange(r.toA1Ref());
  range.load("values");
  await context.sync();
  const data: number[][] = range.values;

  // find origin
  const origin_x = r.upperLeftColumn;
  const origin_y = r.upperLeftRow;

  // we only care about numeric values
  const d = new XLNT.Dictionary<number>();
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const val = data[row][col];
      if (typeof val === "number") {
        // save as 1-based Excel address
        const key = new XLNT.ExceLintVector(origin_x + col, origin_y + row, 0).asKey();

        d.put(key, val);
      }
    }
  }
  return d;
}

/**
 * Retrieves all data of type bool inside the given range.  Must be run
 * inside an active Excel request context.
 * @param ws An Excel.Worksheet object.
 * @param r An XLNT.Range object representing the region of interest.
 * @param context An Excel.RequestContext.
 * @returns A dictionary containing only string data, excluding formulas.
 */
export async function getBooleanDataFromRange(
  ws: Excel.Worksheet,
  r: XLNT.Range,
  context: Excel.RequestContext
): Promise<XLNT.Dictionary<boolean>> {
  var range = ws.getRange(r.toA1Ref());
  range.load("values");
  await context.sync();
  const data: string[][] = range.values;

  // find origin
  const origin_x = r.upperLeftColumn;
  const origin_y = r.upperLeftRow;

  // we only care about boolean values
  const d = new XLNT.Dictionary<boolean>();
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const val = data[row][col];
      if (typeof val === "boolean" || (typeof val === "string" && (val == "TRUE" || val == "FALSE"))) {
        const key = new XLNT.ExceLintVector(origin_x + col, origin_y + row, 0).asKey();
        d.put(key, val === "TRUE" ? true : false);
      }
    }
  }
  return d;
}

/**
 * Retrieves all data of type string inside the given range.  Must be run
 * inside an active Excel request context.
 * @param ws An Excel.Worksheet object.
 * @param r An XLNT.Range object representing the region of interest.
 * @param context An Excel.RequestContext.
 * @returns A dictionary containing only string data, excluding formulas.
 */
export async function getStringDataFromRange(
  ws: Excel.Worksheet,
  r: XLNT.Range,
  context: Excel.RequestContext
): Promise<XLNT.Dictionary<string>> {
  var range = ws.getRange(r.toA1Ref());
  range.load("values");
  await context.sync();
  const data: string[][] = range.values;

  // find origin
  const origin_x = r.upperLeftColumn;
  const origin_y = r.upperLeftRow;

  // we only care about string values
  const d = new XLNT.Dictionary<string>();
  for (let row = 0; row < data.length; row++) {
    for (let col = 0; col < data[row].length; col++) {
      const val = data[row][col];
      if (typeof val !== "number" && typeof val !== "boolean" && val !== "" && val !== "TRUE" && val !== "FALSE") {
        const key = new XLNT.ExceLintVector(origin_x + col, origin_y + row, 0).asKey();
        d.put(key, val);
      }
    }
  }
  return d;
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
 * Run analysis.  The given address must correspond to a single cell.
 *
 * @param addr An Excel address.
 * @param formulas All the formulas in the region of interest.
 * @returns An array of proposed fixes.
 */
function analyze(addr: XLNT.Address, formulas: XLNT.Dictionary<string>): XLNT.ProposedFix[] {
  // console.log(visualizeGrid(formulas, addr.worksheet));

  // formula groups
  let rects = new XLNT.Dictionary<XLNT.Rectangle[]>();

  // styles
  let styles = new XLNT.Dictionary<string>();

  // output
  let proposed_fixes: XLNT.ProposedFix[] = [];

  // get every reference vector set for every formula, indexed by address vector
  const fRefs = Analysis.relativeFormulaRefs(formulas);

  // compute fingerprints for reference vector sets, indexed by address vector
  const fps = Analysis.fingerprints(fRefs);

  // decompose into rectangles, indexed by fingerprint
  const stepRects = Analysis.identify_groups(fps);

  // merge these new rectangles with the old ones
  rects = Analysis.mergeRectangleDictionaries(stepRects, rects);
  rects = Analysis.mergeRectangles(rects);

  // generate proposed fixes for all the new rectanles
  const pfs = Analysis.generate_proposed_fixes(rects);

  // remove duplicate fixes
  const pfs2 = Analysis.filterDuplicateFixes(pfs);

  // filter fixes by target address
  const pfs3 = pfs2.filter((pf) => pf.includesCellAt(addr));

  // filter fixes by user threshold
  const pfs4 = Analysis.filterFixesByUserThreshold(pfs3, Config.reportingThreshold);

  // adjust proposed fixes by style (mutates input)
  Analysis.adjustProposedFixesByStyleHash(pfs4, styles);

  // filter fixes with heuristics
  for (const fix of pfs4) {
    // function to get rectangle info for a rectangle;
    // closes over sheet data
    const rectf = (rect: XLNT.Rectangle) => {
      const formulaCoord = rect.upperleft;
      const firstFormula = formulas.get(formulaCoord.asKey());
      return new XLNT.RectInfo(rect, firstFormula);
    };

    const ffix = Analysis.filterFix(fix, rectf, false);
    if (ffix.hasValue) proposed_fixes.push(ffix.value);
  }

  return proposed_fixes;
}

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
      rng.formulas = [[f]];
      await context.sync();

      // get formulas
      const formulas = await App.getFormulasFromRange(activeSheet, usedRange, true, context);

      // run analysis
      const fixes: XLNT.ProposedFix[] = analyze(addr, formulas);

      // generate fixes
      const fixstrs = Analysis.synthFixes(addr, fixes, formulas);

      // total time
      const elapsed = Timer.round(t.elapsedTime());

      const td = {
        total_μs: elapsed,
      };

      // update the UI state
      app.setState({
        canRestore: app.DEBUG && document.getElementById("RestoreButton")!.onclick !== null,
        changeat: addr.worksheet + "!R" + addr.row + "C" + addr.column + " (" + rng.address + ")",
        time_data: new Some(td),
        fixes: fixstrs,
      });
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
   * Retrieves all data of type number inside the given range.  Must be run
   * inside an active Excel request context.
   * @param ws An Excel.Worksheet object.
   * @param r An XLNT.Range object representing the region of interest.
   * @param context An Excel.RequestContext.
   * @returns A dictionary containing only numeric data, including formula outputs.
   */
  public static async getNumericaDataFromRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    context: Excel.RequestContext
  ): Promise<XLNT.Dictionary<number>> {
    var range = ws.getRange(r.toA1Ref());
    range.load("values");
    await context.sync();
    const data: number[][] = range.values;

    // find origin
    const origin_x = r.upperLeftColumn;
    const origin_y = r.upperLeftRow;

    // we only care about numeric values
    const d = new XLNT.Dictionary<number>();
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        const val = data[row][col];
        if (typeof val === "number") {
          // save as 1-based Excel address
          const key = new XLNT.ExceLintVector(origin_x + col, origin_y + row, 0).asKey();

          d.put(key, val);
        }
      }
    }
    return d;
  }

  /**
   * Retrieves all data of type string inside the given range.  Must be run
   * inside an active Excel request context.
   * @param ws An Excel.Worksheet object.
   * @param r An XLNT.Range object representing the region of interest.
   * @param context An Excel.RequestContext.
   * @returns A dictionary containing only string data, excluding formulas.
   */
  public static async getStringDataFromRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    context: Excel.RequestContext
  ): Promise<XLNT.Dictionary<string>> {
    var range = ws.getRange(r.toA1Ref());
    range.load("values");
    await context.sync();
    const data: string[][] = range.values;

    // find origin
    const origin_x = r.upperLeftColumn;
    const origin_y = r.upperLeftRow;

    // we only care about string values
    const d = new XLNT.Dictionary<string>();
    for (let row = 0; row < data.length; row++) {
      for (let col = 0; col < data[row].length; col++) {
        const val = data[row][col];
        if (typeof val !== "number" && val !== "") {
          const key = new XLNT.ExceLintVector(origin_x + col, origin_y + row, 0).asKey();
          d.put(key, val);
        }
      }
    }
    return d;
  }

  /**
   * Color all cells in the given range with the given color.
   * @param ws The worksheet containing the given range.
   * @param r The range to color.
   * @param color The hexadecimal #RRGGBB color code to use as a string, e.g., "#C0FFEE".
   * @returns The original color.
   */
  public static async colorRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    color: string,
    context: Excel.RequestContext
  ): Promise<OldColor> {
    const range = ws.getRange(r.toA1Ref());

    // save original color
    let oldColor: string = "";
    try {
      range.load("format/fill/color");
      await context.sync();
      oldColor = range.format.fill.color;

      // set new color
      if (color === oldColor) {
        return new OldColor(color, r); // don't bother
      } else if (color === "#FFFFFF") {
        range.format.fill.clear();
      } else {
        range.format.fill.color = color;
      }
    } catch (e) {
      console.log(e);
    }

    return new OldColor(oldColor, r);
  }

  /**
   * Handler to restore old colors to the given range.
   * Should be registered after the user runs an analysis.
   * @param oldColors An array of old colors.
   */
  public async restoreColors(oldColors: OldColor[]): Promise<void> {
    // can't reuse the Excel request context from when the handler was registered
    // because the user is going to ask to restore at a later time
    await Excel.run(async (context: Excel.RequestContext) => {
      const activeSheet = context.workbook.worksheets.getActiveWorksheet();

      for (const oldColor of oldColors) {
        // ignore return value
        await App.colorRange(activeSheet, oldColor.range, oldColor.color, context);
      }

      // unregister button handler
      const button = document.getElementById("RestoreButton")!;
      button.onclick = null;

      // disable button
      this.setState({
        canRestore: false,
      });
    });
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

  // /**
  //  * onChange event handler for a cell that can modify a react component.
  //  *
  //  * @param args WorksheetChangedEvent information.
  //  * @param appInstance A reference to the `appInstance` instance.
  //  */
  // public async onRangeChange(args: Excel.WorksheetChangedEventArgs): Promise<void> {
  //   if (args.changeType === "RangeEdited") {
  //     const t = new Timer("onUpdate");
  //     await Excel.run(async (context: Excel.RequestContext) => {
  //       const rng = args.getRange(context);
  //       const activeSheet = context.workbook.worksheets.getActiveWorksheet();
  //       const usedRange = await App.getCurrentUsedRange(activeSheet, context);

  //       // we only care about events where the user changes a single cell
  //       rng.load(["cellCount", "formulas", "address"]);
  //       await context.sync();

  //       // now that we have all the data loaded...
  //       if (rng.cellCount === 1) {
  //         // get the range's address
  //         const addr = ExcelUtils.addrA1toR1C1(rng.address);

  //         // const pfs = await App.fullAnalysisOnCellChange(context, rng);
  //         // const pfs = await App.fatCrossAnalysisOnCellChange(context, rng);
  //         const proposed_fixes = await incrementalFatCrossAnalysis(
  //           context,
  //           activeSheet,
  //           usedRange,
  //           addr,
  //           this.DEBUG,
  //           this.STYLE
  //         );
  //         let it: IteratorResult<Maybe<[XLNT.ProposedFix[], OldColor[]]>, Maybe<[XLNT.ProposedFix[], OldColor[]]>>;
  //         let found_fixes: XLNT.ProposedFix[] = [];
  //         for (it = await proposed_fixes.next(); !it.done; it = await proposed_fixes.next()) {
  //           const v = it.value;
  //           switch (v.type) {
  //             case "no":
  //               console.log("No bugs found.");
  //               break;
  //             case "possibly": {
  //               const [pfs, oc] = v.value;
  //               if (this.DEBUG) {
  //                 // get the restore button
  //                 const button = document.getElementById("RestoreButton")!;

  //                 // update handler
  //                 const handler = () => this.restoreColors(oc);
  //                 button.onclick = handler.bind(this);
  //               }
  //               // replace found fixes
  //               found_fixes = pfs;

  //               console.log(pfs);
  //               break;
  //             }
  //             case "definitely": {
  //               const [pfs, oc] = v.value;
  //               if (this.DEBUG) {
  //                 // get the restore button
  //                 const button = document.getElementById("RestoreButton")!;

  //                 // update handler
  //                 const handler = () => this.restoreColors(oc);
  //                 button.onclick = handler.bind(this);
  //               }
  //               // replace found fixes
  //               found_fixes = pfs;

  //               console.log(pfs);
  //               break;
  //             }
  //             default:
  //               console.log("This case should not be possible.");
  //           }
  //         }

  //         // total time
  //         const elapsed = Timer.round(t.elapsedTime());

  //         const td = {
  //           total_μs: elapsed,
  //         };

  //         // update the UI state
  //         this.setState({
  //           canRestore: this.DEBUG && document.getElementById("RestoreButton")!.onclick !== null,
  //           changeat: addr.worksheet + "!R" + addr.row + "C" + addr.column + " (" + rng.address + ")",
  //           time_data: new Some(td),
  //           fixes: found_fixes,
  //         });
  //         console.log("Analysis finished");
  //       }
  //     });
  //   }
  // }

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

    // const fixes = this.state.fixes.map((fix) => (
    //   // eslint-disable-next-line react/jsx-key
    //   <li>
    //     {fix.rect1.upperleft +
    //       ":" +
    //       fix.rect1.bottomright +
    //       " and " +
    //       fix.rect2.upperleft +
    //       ":" +
    //       fix.rect2.bottomright}
    //   </li>
    // ));

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
          <ol>{this.state.fixes}</ol>
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
