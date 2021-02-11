import * as React from "react";
import * as XLSX from "xlsx";
import { Colorize } from "../../core/src/colorize";
import { ExcelJSON } from "../../core/src/exceljson";

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
  placeholder: string;
}

/**
 * Global startup function for the plugin. Excel API and spreadsheet will be
 * initialized.  App class (below) and React state will not be initialized.
 */
(async () => {
  await Office.onReady();
  if (!Office.context.requirements.isSetSupported("ExcelApi", "1.7")) {
    console.log("Sorry, this add-in only works with newer versions of Excel.");
  }
  // Put stuff here, like handlers
})();

/**
 * The class that represents the task pane, including React UI state.
 */
export default class App extends React.Component<AppProps, AppState> {
  constructor(props, context) {
    super(props, context);
    this.state = {
      placeholder: "start"
    };

    // run the initial analysis
  }

  public static async initialize() {
    let workbook = await App.getWorkbook();
    let jsonBook = ExcelJSON.processWorkbookFromXLSX(workbook, "thisbook");
    return Colorize.process_workbook(jsonBook, currentWorksheetName);
  }

  public static async getWorksheet() {
    let currentWorksheet;
    let currentWorksheetName = "";
    (async () => {
      await Excel.run(async context => {
        currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
        currentWorksheet.load(["name"]);
        await context.sync();
        currentWorksheetName = currentWorksheet.name;
      });
    })();
  }

  // Read in the workbook as a file into XLSX form, so it can be processed by our tools
  // developed for excelint-cli.
  public static async getWorkbook(): Promise<any> {
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

  /**
   * onChange event handler for a cell that can modify a react component.
   *
   * @param args WorksheetChangedEvent information.
   * @param appInstance A reference to the `appInstance` instance.
   */
  public async onRangeChangeInReact(args: Excel.WorksheetChangedEventArgs): Promise<any> {
    if (args.changeType === "RangeEdited") {
      /* const address = args.address; */
      await Excel.run(async (context: Excel.RequestContext) => {
        const rng = args.getRange(context);
        await context.sync();

        // we only care about events where the user changes a single cell
        rng.load(["cellCount", "values", "formulas"]);
        await context.sync();

        // now that we have all the data loaded...
        if (rng.cellCount === 1) {
          /*
           * const value: string = rng.values[0][0];
           * const formula: string = rng.formulas[0][0];
           */

          // update the UI state
          this.setState({
            placeholder: Date.now().toString()
          });
        }
      });
    }
  }

  /**
   * Runs after this component is rendered. Used to initialize the UI, including
   * event handlers, etc.
   */
  public componentDidMount(): void {
    this.setState({
      placeholder: Date.now().toString()
    });

    // Registers an event handler "in context" AFTER React is done rendering.
    Excel.run(async (context: Excel.RequestContext) => {
      const worksheets = context.workbook.worksheets;
      // here, we use a closure to capture the `this` param to pass to the handler
      const handler = (args: Excel.WorksheetChangedEventArgs) => this.onRangeChangeInReact.bind(args);
      worksheets.onChanged.add(handler);
    });
  }

  /**
   * Renders the task pane.
   */
  render() {
    return <div className="ms-welcome">{this.state.placeholder}</div>;
  }
}
