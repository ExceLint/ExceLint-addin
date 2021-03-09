import * as React from "react";
import * as XLSX from "xlsx";
import { Colorize } from "../../core/src/colorize";
import * as XLNT from "../../core/src/ExceLintTypes";
import { ExcelJSON, WorkbookOutput } from "../../core/src/exceljson";
import { Option, Some, None } from "../../core/src/option";
import { suffixUpdate } from "../../core/src/lcs";
import { ExcelUtils } from "../../core/src/excelutils";
import { Timer } from "../../core/src/timer";

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
  changeat: string;
  oldformula: string;
  newformula: string;
  change: string;
  verdict: string;
  time_data: Option<ExceLintTime>;
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
 * The class that represents the task pane, including React UI state.
 */
export default class App extends React.Component<AppProps, AppState> {
  analysis: Option<XLNT.WorkbookAnalysis> = None;

  constructor(props: AppProps, context: Office.Context) {
    super(props, context);
    this.state = {
      changeat: "",
      oldformula: "",
      newformula: "",
      change: "",
      verdict: "No bugs found.",
      time_data: None
    };
  }

  /*
   * Runs the initial analysis and returns an App instance.  Call this at startup.
   */
  public static async initialize(): Promise<Option<XLNT.WorkbookAnalysis>> {
    const [wb, sheetName] = await App.getWorkbookOutputAndCurrentSheet();
    return new Some(Colorize.process_workbook(wb, sheetName));
  }

  /*
   * Gets the worksheet name from the current worksheet.
   */
  public static async getWorksheetName(): Promise<string> {
    let name: string = "";
    await Excel.run(async context => {
      const currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
      currentWorksheet.load(["name"]);
      await context.sync();
      name = currentWorksheet.name;
    });
    return name;
  }

  // Read in the workbook as a file into XLSX form, so it can be processed by our tools
  // developed for excelint-cli.
  public static async getWorkbook(): Promise<XLSX.WorkBook> {
    return new Promise((resolve, _reject) => {
      Office.context.document.getFileAsync(Office.FileType.Compressed, result => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          // For now, assume there's just one slice - FIXME.
          result.value.getSliceAsync(0, (res: Office.AsyncResult<Office.Slice>) => {
            if (res.status === Office.AsyncResultStatus.Succeeded) {
              // File loaded. Grab the data and read it into xlsx.
              let slice = res.value.data;
              let workbook = XLSX.read(slice, { type: "array" });
              // Close the file (this is mandatory).
              (async () => {
                await result.value.closeAsync();
              })();
              resolve(workbook);
            } else {
              throw new Error("slice async failed.");
            }
          });
        } else {
          throw new Error("getFileAsync somehow is now not working, fail.");
        }
      });
    });
  }

  public static async getCurrentUsedRange(ws: Excel.Worksheet, context: Excel.RequestContext): Promise<XLNT.Range> {
    const usedRange = ws.getUsedRange();
    usedRange.load("address");
    await context.sync();
    const addr = usedRange.address;
    return ExcelUtils.rngA1toR1C1(addr);
  }

  public static async getFormulasFromRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    context: Excel.RequestContext
  ): Promise<Option<string>[][]> {
    var range = ws.getRange(r.toA1Ref());
    range.load("formulas");
    await context.sync();
    let formulas: string[][] = range.formulas;

    // we don't care about values, only formulas
    const output: Option<string>[][] = [];
    for (let row = 0; row < formulas.length; row++) {
      output[row] = []; // initialize row
      for (let col = 0; col < formulas[row].length; col++) {
        const val = formulas[row][col];
        /*
         * 'If the returned value starts with a plus ("+"), minus ("-"),
         * or equal sign ("="), Excel interprets this value as a formula.'
         * https://docs.microsoft.com/en-us/javascript/api/excel/excel.range?view=excel-js-preview#values
         */
        if (val[0] !== "=" && val[0] !== "+" && val[0] !== "-") {
          // it's not a formula; we don't care
          output[row][col] = None;
        } else if (val[0] === "=") {
          // remove "=" from start of string
          output[row][col] = new Some(val.substr(1));
        } else {
          // it's a "+/-" formula
          output[row][col] = new Some(val);
        }
      }
    }
    return output;
  }

  public static async getNumericDataFromRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    context: Excel.RequestContext
  ): Promise<Option<number>[][]> {
    var range = ws.getRange(r.toA1Ref());
    range.load("values");
    await context.sync();
    const data: number[][] = range.values;

    // we only care about numeric values
    const output: Option<number>[][] = [];
    for (let row = 0; row < data.length; row++) {
      output[row] = []; // initialize row
      for (let col = 0; col < data[row].length; col++) {
        const val = data[row][col];
        if (typeof val === "number") {
          output[row][col] = new Some(val);
        } else {
          output[row][col] = None;
        }
      }
    }
    return output;
  }

  public static async getStringDataFromRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    context: Excel.RequestContext
  ): Promise<Option<string>[][]> {
    var range = ws.getRange(r.toA1Ref());
    range.load("values");
    await context.sync();
    const data: string[][] = range.values;

    // we only care about string values
    const output: Option<string>[][] = [];
    for (let row = 0; row < data.length; row++) {
      output[row] = []; // initialize row
      for (let col = 0; col < data[row].length; col++) {
        const val = data[row][col];
        if (typeof val !== "number" && val !== "") {
          output[row][col] = new Some(val);
        } else {
          output[row][col] = None;
        }
      }
    }
    return output;
  }

  public static async getWorkbookOutputAndCurrentSheet(): Promise<[WorkbookOutput, string]> {
    const wb = await this.getWorkbook();
    const currentWorksheetName = await App.getWorksheetName();
    const jsonBook = ExcelJSON.processWorkbookFromXLSX(wb, "thisbook");
    return [jsonBook, currentWorksheetName];
  }

  /**
   * onChange event handler for a cell that can modify a react component.
   *
   * @param args WorksheetChangedEvent information.
   * @param appInstance A reference to the `appInstance` instance.
   */
  public async onRangeChangeInReact(args: Excel.WorksheetChangedEventArgs): Promise<any> {
    if (args.changeType === "RangeEdited") {
      const t = new Timer("onUpdate");
      await Excel.run(async (context: Excel.RequestContext) => {
        const rng = args.getRange(context);
        await context.sync();

        // we only care about events where the user changes a single cell
        rng.load(["cellCount", "formulas", "address"]);
        await context.sync();

        // now that we have all the data loaded...
        if (rng.cellCount === 1) {
          // get the range's address
          const addr = ExcelUtils.addrA1toR1C1(rng.address);

          // get the formula
          const formula: string = rng.formulas[0][0];

          // DEBUG FULL ANALYSIS
          // THIS IS HERE BECAUSE WE CANNOT SET BREAKPOINTS AT PLUGIN STARTUP
          // TODO START REMOVE
          // const [wb, sn] = await App.getWorkbookOutputAndCurrentSheet();
          // const debuganalysis = Colorize.process_workbook(wb, sn, true);
          // console.log(debuganalysis);
          const activeSheet = context.workbook.worksheets.getActiveWorksheet();
          activeSheet.load("name");
          await context.sync();
          const r = await App.getCurrentUsedRange(activeSheet, context);
          const r1c1_str = r.toR1C1Ref();
          const a1_str = r.toA1Ref();
          console.log("R1C1: " + r1c1_str);
          console.log("A1: " + a1_str);
          const ur_data = await App.getNumericDataFromRange(activeSheet, r, context);
          const ur_formulas = await App.getFormulasFromRange(activeSheet, r, context);
          const ur_strings = await App.getStringDataFromRange(activeSheet, r, context);
          console.log(ur_data);
          console.log(ur_formulas);
          console.log(ur_strings);
          // END REMOVE

          if (this.analysis.hasValue) {
            // We've run an analysis before

            const wsObj = this.analysis.value.getSheet(addr.worksheet).worksheet;
            // note that formulas are stored with zero-based row and column indices as opposed
            // to Excel's 1-based indices, so we have to adjust.
            // Also, it is stored in row-major format!
            const old_formula = wsObj.formulas[addr.row - 1][addr.column - 1];
            const update = suffixUpdate(old_formula, formula);

            // read the workbook again: TODO, actually just reuse old data
            const [wb] = await App.getWorkbookOutputAndCurrentSheet();
            this.analysis = new Some(Colorize.update_analysis(wb, this.analysis.value, update, addr));

            // is this cell one of the proposed fixes?
            let buggy = false;
            if (this.analysis.hasValue) {
              const pfs = this.analysis.value.getSheet(addr.worksheet).proposedFixes;
              for (let i = 0; i < pfs.length; i++) {
                const pf = pfs[i];
                if (pf.includesCellAt(addr)) {
                  buggy = true;
                }
              }
            }

            // total time
            const elapsed = t.elapsedTime();

            const td = {
              total_μs: elapsed
            };

            // update the UI state
            this.setState({
              changeat: addr.worksheet + "!R" + addr.row + "C" + addr.column + " (" + rng.address + ")",
              oldformula: old_formula,
              newformula: formula,
              change: "'" + update[1] + "' at index " + update[0] + ".",
              verdict: buggy ? "Cell " + addr.toString() + " is buggy." : "No bugs found.",
              time_data: new Some(td)
            });
          } else {
            // We are still waiting for the first analysis to finish.  Do nothing for now.
          }
          console.log("Analysis finished");
        }
      });
    }
  }

  /**
   * Runs after this component is rendered. Used to initialize the UI, including
   * event handlers, etc.
   */
  public componentDidMount(): void {
    // Registers an event handler "in context" AFTER React is done rendering.
    Excel.run(async (context: Excel.RequestContext) => {
      const worksheets = context.workbook.worksheets;
      const handler = (args: Excel.WorksheetChangedEventArgs) => this.onRangeChangeInReact(args);

      worksheets.onChanged.add(handler);
    });

    // Run the initial analysis
    run(async () => {
      this.analysis = await App.initialize();
    });

    this.setState({
      changeat: "",
      oldformula: "",
      newformula: "",
      change: "loaded",
      verdict: "No bugs found.",
      time_data: None
    });
  }

  /**
   * Renders the task pane.
   */
  render() {
    return (
      <div>
        <div className="ms-welcome">
          At: <em>{this.state.changeat}</em>
        </div>
        <div className="ms-welcome">
          Old formula: <em>{this.state.oldformula}</em>
        </div>
        <div className="ms-welcome">
          New formula: <em>{this.state.newformula}</em>
        </div>
        <div className="ms-welcome">
          Changed: <em>{this.state.change}</em>
        </div>
        <div className="ms-welcome">
          <em>
            <span style={{ color: "red" }}>{this.state.verdict}</span>
          </em>
        </div>
        <div className="ms-welcome">
          Total time: {this.state.time_data.hasValue ? this.state.time_data.value.total_μs : ""} μs
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
