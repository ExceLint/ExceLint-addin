import * as React from "react";
import * as XLSX from "xlsx";
import { Colorize } from "../../core/src/colorize";
import { WorkbookAnalysis } from "../../core/src/ExceLintTypes";
import { ExcelJSON, WorkbookOutput } from "../../core/src/exceljson";
import { Option, Some, None } from "../../core/src/option";
import { suffixUpdate } from "../../core/src/lcs";
import { ExcelUtils } from "../../core/src/excelutils";

/**
 * Represents the underlying data model.
 */
export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
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
  analysis: Option<WorkbookAnalysis> = None;

  constructor(props, context) {
    super(props, context);
    this.state = {
      changeat: "",
      oldformula: "",
      newformula: "",
      change: "",
      verdict: "No bugs found."
    };
  }

  /*
   * Runs the initial analysis and returns an App instance.  Call this at startup.
   */
  public static async initialize(): Promise<Option<WorkbookAnalysis>> {
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
              console.log("slice async failed.");
              resolve(null);
            }
          });
        } else {
          console.log("getFileAsync somehow is now not working, fail.");
          resolve(null);
        }
      });
    });
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

            // update the UI state
            this.setState({
              changeat: addr.worksheet + "!R" + addr.row + "C" + addr.column + " (" + rng.address + ")",
              oldformula: old_formula,
              newformula: formula,
              change: "'" + update[1] + "' at index " + update[0] + ".",
              verdict: buggy ? "Cell " + addr.toString() + " is buggy." : "No bugs found."
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
      verdict: "No bugs found."
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
