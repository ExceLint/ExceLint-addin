import * as React from "react";
import * as XLSX from "xlsx";
import { Colorize } from "../../core/src/colorize";
import * as XLNT from "../../core/src/ExceLintTypes";
import { ExcelJSON, WorkbookOutput } from "../../core/src/exceljson";
import { Option, Some, None } from "../../core/src/option";
import { suffixUpdate } from "../../core/src/lcs";
import { ExcelUtils } from "../../core/src/excelutils";
import { Timer } from "../../core/src/timer";
import { Config } from "../../core/src/config";

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
   * Retrieves all formatting information inside the given range.  Must be run
   * inside an active Excel request context.
   * @param ws An Excel.Worksheet object.
   * @param r An XLNT.Range object representing the region of interest.
   * @param context An Excel.RequestContext.
   * @returns A dictionary containing only string data, excluding formulas.
   */
  public static async getFormattingFromRange(
    ws: Excel.Worksheet,
    r: XLNT.Range,
    context: Excel.RequestContext
  ): Promise<XLNT.Dictionary<string>> {
    // find extents
    const ul_x = r.upperLeftColumn;
    const ul_y = r.upperLeftRow;
    const br_x = r.bottomRightColumn;
    const br_y = r.bottomRightRow;

    // we only care about string values
    const d = new XLNT.Dictionary<string>();
    for (let row = ul_y; row <= br_y; row++) {
      for (let col = ul_x; col <= br_x; col++) {
        // get the cell; getCell is zero-indexed!
        var range = ws.getCell(row - 1, col - 1);

        // load all of the properties we care about;
        // this is necessarily a mess :(
        range.load(["format", "style", "valueTypes"]);
        await context.sync();
        const key = new XLNT.ExceLintVector(col, row, 0).asKey();
        const xl_fmt = range.format.load(["fill", "font"]);
        await context.sync();
        range.format.fill.load({ $all: true });
        range.format.font.load({ $all: true });
        await context.sync();
        const xl_stl = range.style;
        const xl_vtp = range.valueTypes;
        const fmt = JSON.stringify(xl_fmt);
        const stl = JSON.stringify(xl_stl);
        const vtp = JSON.stringify(xl_vtp);
        const fmtHash = ExcelJSON.styleHash(fmt + stl + vtp);
        d.put(key, fmtHash);
      }
    }
    return d;
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
          const ur = await App.getCurrentUsedRange(activeSheet, context);
          const r1c1_str = ur.toFullyQualifiedR1C1Ref();
          const a1_str = ur.toFullyQualifiedA1Ref();
          console.log("R1C1: " + r1c1_str);
          console.log("A1: " + a1_str);

          // read usedrange from active sheet
          const ur_data = await App.getNumericaDataFromRange(activeSheet, ur, context);
          const ur_formulas = await App.getFormulasFromRange(activeSheet, ur, context);
          const ur_strings = await App.getStringDataFromRange(activeSheet, ur, context);
          const ur_styles = await App.getFormattingFromRange(activeSheet, ur, context);

          console.log(ur_data);
          console.log(ur_formulas);
          console.log(ur_strings);
          console.log(ur_styles);

          // get every reference vector set for every formula, indexed by address vector
          const fRefs = Colorize.relativeFormulaRefs(ur_formulas);
          console.log(fRefs);

          // compute fingerprints for reference vector sets, indexed by address vector
          const fps = Colorize.fingerprints(fRefs);
          console.log(fps);

          // decompose into rectangles, indexed by fingerprint
          const rects = Colorize.identify_groups(fps);
          console.log(rects);

          // to what rectangle does the updated cell belong?
          const updated_rect = rects.get(fps.get(addr.asVector().asKey()).asKey());
          console.log(updated_rect);

          // generate proposed fixes
          const pfs = Colorize.generate_proposed_fixes(rects);
          console.log(pfs);

          // filter fixes by user threshold
          const pfs2 = Colorize.filterFixesByUserThreshold(pfs, Config.reportingThreshold);
          console.log(pfs2);

          // adjust proposed fixes by style (mutates input)
          Colorize.adjustProposedFixesByStyleHash(pfs2, ur_styles);

          // // REMOVE THIS:
          // const output = App.initialize();
          // console.log(output);

          // are those rectangles "close"?

          // END REMOVE

          // if we've done an analysis before, and the changed thing is a formula
          if (this.analysis.hasValue && ur_formulas.contains(addr.asVector().asKey())) {
            const wsObj = this.analysis.value.getSheet(addr.worksheet).worksheet;
            // note that formulas are stored with zero-based row and column indices as opposed
            // to Excel's 1-based indices, so we have to adjust.
            // Also, it is stored in row-major format!
            const old_formulas = Colorize.formulaSpreadsheetToDict(wsObj.formulas, 0, 0);
            const old_formula = old_formulas.contains(addr.asKey()) ? old_formulas.get(addr.asKey()) : "something else";
            // const old_formula = wsObj.formulas[addr.row - 1][addr.column - 1];
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

    // // Run the initial analysis
    // run(async () => {
    //   this.analysis = await App.initialize();
    // });

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
