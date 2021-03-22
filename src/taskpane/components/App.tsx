import * as React from "react";
import { Colorize } from "../../core/src/colorize";
import * as XLNT from "../../core/src/ExceLintTypes";
import { ExcelJSON } from "../../core/src/exceljson";
import { Option, None, Maybe, Possibly, Definitely, No } from "../../core/src/option";
import { ExcelUtils } from "../../core/src/excelutils";
import { Timer } from "../../core/src/timer";
import { Config } from "../../core/src/config";
import { RectangleUtils } from "../../core/src/rectangleutils";

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
 * Run a fat cross analysis.  This method is a generator and will yield
 * four times before finally returning for good.  Each time the function
 * resumes, it will continue the analysis where it left off.  When the
 * method yields, it will either return a No object, meaning that the
 * cell is not an error, or Possibly, meaning that further analysis is needed
 * to be conclusive.  On the function's final return, it will return either
 * No with the same meaning above, or Definitely, meaning that the cell
 * is definitely a bug.  The payload for
 * @param context Excel request context.
 * @param xlrng An Excel range.
 * @returns An array of proposed fixes.
 */
export async function* incrementalFatCrossAnalysis(
  context: Excel.RequestContext,
  xlrng: Excel.Range,
  use_colors_for_debugging: boolean
): AsyncGenerator<Maybe<XLNT.ProposedFix[]>, Maybe<XLNT.ProposedFix[]>, Maybe<XLNT.ProposedFix[]>> {
  // we only care about events where the user changes a single cell
  xlrng.load(["cellCount", "formulas", "address"]);
  await context.sync();

  // now that we have all the data loaded...
  if (xlrng.cellCount === 1) {
    // get the range's address
    const addr = ExcelUtils.addrA1toR1C1(xlrng.address);
    const activeSheet = context.workbook.worksheets.getActiveWorksheet();
    const usedRange = await App.getCurrentUsedRange(activeSheet, context);

    // get fat cross
    const fc = RectangleUtils.findFatCross(usedRange, addr);

    // read formulas/styles from active sheet
    const steps = [fc.center, fc.up, fc.left, fc.down, fc.right];
    let formulas = new XLNT.Dictionary<string>();
    let styles = new XLNT.Dictionary<string>();

    // this is for debugging
    const debug_colors = ["#FFFFB5", "#CBAACB", "#FFCCB6", "#ABDEE6", "#F3B0C3"];

    // output
    let pfs3: XLNT.ProposedFix[] = [];
    for (let i = 0; i < steps.length; i++) {
      if (use_colors_for_debugging) {
        await App.colorRange(activeSheet, steps[i], debug_colors[i]);
        // context.sync();
      }

      const fs = await App.getFormulasFromRange(activeSheet, steps[i], context);
      const ss = await App.getFormattingFromRange(activeSheet, steps[i], context);
      formulas = formulas.merge(fs);
      styles = styles.merge(ss);

      // get every reference vector set for every formula, indexed by address vector
      const fRefs = Colorize.relativeFormulaRefs(formulas);

      // compute fingerprints for reference vector sets, indexed by address vector
      const fps = Colorize.fingerprints(fRefs);

      // decompose into rectangles, indexed by fingerprint
      const rects = Colorize.identify_groups(fps);

      // generate proposed fixes
      const pfs = Colorize.generate_proposed_fixes(rects);

      // filter fixes by user threshold
      const pfs2 = Colorize.filterFixesByUserThreshold(pfs, Config.reportingThreshold);

      // adjust proposed fixes by style (mutates input)
      Colorize.adjustProposedFixesByStyleHash(pfs2, styles);

      // clear pfs3
      pfs3 = [];

      // filter fixes with heuristics
      for (const fix of pfs2) {
        // function to get rectangle info for a rectangle;
        // closes over sheet data
        const rectf = (rect: XLNT.Rectangle) => {
          const formulaCoord = rect.upperleft;
          const firstFormula = formulas.get(formulaCoord.asKey());
          return new XLNT.RectInfo(rect, firstFormula);
        };

        const ffix = Colorize.filterFix(fix, rectf, true);
        if (ffix.hasValue) pfs3.push(ffix.value);
      }

      if (i === steps.length - 1) {
        // if this is the last step, the answer is conclusive
        if (pfs3.length === 0) {
          yield No;
        } else {
          yield new Definitely(pfs3);
        }
      } else {
        // return what we know so far
        yield new Possibly(pfs3);
      }
    }
    // the answer is always conclusive from this point forward
    if (pfs3.length === 0) {
      return No;
    } else {
      return new Definitely(pfs3);
    }
  }
  // if the user did not update a cell, return No (for now)
  return No;
}

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

  /**
   * Color all cells in the given range with the given color.
   * @param ws The worksheet containing the given range.
   * @param r The range to color.
   * @param color The hexadecimal #RRGGBB color code to use as a string, e.g., "#C0FFEE".
   */
  public static async colorRange(ws: Excel.Worksheet, r: XLNT.Range, color: string): Promise<void> {
    var range = ws.getRange(r.toA1Ref());
    if (color === "#FFFFFF") {
      range.format.fill.clear();
    } else {
      range.format.fill.color = color;
    }
  }

  public static async fullAnalysisOnCellChange(
    context: Excel.RequestContext,
    xlrng: Excel.Range
  ): Promise<XLNT.ProposedFix[]> {
    // we only care about events where the user changes a single cell
    xlrng.load(["cellCount", "formulas", "address"]);
    await context.sync();

    // now that we have all the data loaded...
    if (xlrng.cellCount === 1) {
      // get the range's address
      const activeSheet = context.workbook.worksheets.getActiveWorksheet();
      const ur = await App.getCurrentUsedRange(activeSheet, context);

      // read usedrange from active sheet
      // const ur_data = await App.getNumericaDataFromRange(activeSheet, ur, context);
      const ur_formulas = await App.getFormulasFromRange(activeSheet, ur, context);
      // const ur_strings = await App.getStringDataFromRange(activeSheet, ur, context);
      const ur_styles = await App.getFormattingFromRange(activeSheet, ur, context);

      // get every reference vector set for every formula, indexed by address vector
      const fRefs = Colorize.relativeFormulaRefs(ur_formulas);

      // compute fingerprints for reference vector sets, indexed by address vector
      const fps = Colorize.fingerprints(fRefs);

      // decompose into rectangles, indexed by fingerprint
      const rects = Colorize.identify_groups(fps);

      // to what rectangle does the updated cell belong?
      // const updated_rect = rects.get(fps.get(addr.asVector().asKey()).asKey());

      // generate proposed fixes
      const pfs = Colorize.generate_proposed_fixes(rects);

      // filter fixes by user threshold
      const pfs2 = Colorize.filterFixesByUserThreshold(pfs, Config.reportingThreshold);

      // adjust proposed fixes by style (mutates input)
      Colorize.adjustProposedFixesByStyleHash(pfs2, ur_styles);

      // filter fixes with heuristics
      const pfs3: XLNT.ProposedFix[] = [];
      for (const fix of pfs2) {
        // function to get rectangle info for a rectangle;
        // closes over sheet data
        const rectf = (rect: XLNT.Rectangle) => {
          const formulaCoord = rect.upperleft;
          const firstFormula = ur_formulas.get(formulaCoord.asKey());
          return new XLNT.RectInfo(rect, firstFormula);
        };

        const ffix = Colorize.filterFix(fix, rectf, true);
        if (ffix.hasValue) pfs3.push(ffix.value);
      }

      return pfs3;
    }
    return [];
  }

  /**
   * Run a fat cross analysis.
   * @param context Excel request context.
   * @param xlrng An Excel range.
   * @returns An array of proposed fixes.
   */
  public static async fatCrossAnalysisOnCellChange(
    context: Excel.RequestContext,
    xlrng: Excel.Range
  ): Promise<XLNT.ProposedFix[]> {
    // we only care about events where the user changes a single cell
    xlrng.load(["cellCount", "formulas", "address"]);
    await context.sync();

    // now that we have all the data loaded...
    if (xlrng.cellCount === 1) {
      // get the range's address
      const addr = ExcelUtils.addrA1toR1C1(xlrng.address);
      const activeSheet = context.workbook.worksheets.getActiveWorksheet();
      const usedRange = await App.getCurrentUsedRange(activeSheet, context);

      // get fat cross
      const fc = RectangleUtils.findFatCross(usedRange, addr);

      // DEBUG: color the fat cross
      // await App.colorRange(activeSheet, fc.center, "#FFFFB5");
      // await App.colorRange(activeSheet, fc.up, "#CBAACB");
      // await App.colorRange(activeSheet, fc.down, "#FFCCB6");
      // await App.colorRange(activeSheet, fc.left, "#ABDEE6");
      // await App.colorRange(activeSheet, fc.right, "#F3B0C3");
      // context.sync();

      // read formulas/styles from active sheet
      const center_formulas = await App.getFormulasFromRange(activeSheet, fc.center, context);
      const center_styles = await App.getFormattingFromRange(activeSheet, fc.center, context);
      const up_formulas = await App.getFormulasFromRange(activeSheet, fc.up, context);
      const up_styles = await App.getFormattingFromRange(activeSheet, fc.up, context);
      const down_formulas = await App.getFormulasFromRange(activeSheet, fc.down, context);
      const down_styles = await App.getFormattingFromRange(activeSheet, fc.down, context);
      const left_formulas = await App.getFormulasFromRange(activeSheet, fc.left, context);
      const left_styles = await App.getFormattingFromRange(activeSheet, fc.left, context);
      const right_formulas = await App.getFormulasFromRange(activeSheet, fc.right, context);
      const right_styles = await App.getFormattingFromRange(activeSheet, fc.right, context);

      const formulas = center_formulas
        .merge(up_formulas)
        .merge(down_formulas)
        .merge(left_formulas)
        .merge(right_formulas);
      const styles = center_styles
        .merge(up_styles)
        .merge(down_styles)
        .merge(left_styles)
        .merge(right_styles);

      // get every reference vector set for every formula, indexed by address vector
      const fRefs = Colorize.relativeFormulaRefs(formulas);

      // compute fingerprints for reference vector sets, indexed by address vector
      const fps = Colorize.fingerprints(fRefs);

      // decompose into rectangles, indexed by fingerprint
      const rects = Colorize.identify_groups(fps);

      // to what rectangle does the updated cell belong?
      // const updated_rect = rects.get(fps.get(addr.asVector().asKey()).asKey());

      // generate proposed fixes
      const pfs = Colorize.generate_proposed_fixes(rects);

      // filter fixes by user threshold
      const pfs2 = Colorize.filterFixesByUserThreshold(pfs, Config.reportingThreshold);

      // adjust proposed fixes by style (mutates input)
      Colorize.adjustProposedFixesByStyleHash(pfs2, styles);

      // filter fixes with heuristics
      const pfs3: XLNT.ProposedFix[] = [];
      for (const fix of pfs2) {
        // function to get rectangle info for a rectangle;
        // closes over sheet data
        const rectf = (rect: XLNT.Rectangle) => {
          const formulaCoord = rect.upperleft;
          const firstFormula = formulas.get(formulaCoord.asKey());
          return new XLNT.RectInfo(rect, firstFormula);
        };

        const ffix = Colorize.filterFix(fix, rectf, true);
        if (ffix.hasValue) pfs3.push(ffix.value);
      }
      console.log(pfs3);

      return pfs3;
    }
    return [];
  }

  /**
   * onChange event handler for a cell that can modify a react component.
   *
   * @param args WorksheetChangedEvent information.
   * @param appInstance A reference to the `appInstance` instance.
   */
  public async onRangeChangeInReact(args: Excel.WorksheetChangedEventArgs): Promise<any> {
    const DEBUG = true; // true: shows colors, false: hides colors

    if (args.changeType === "RangeEdited") {
      const t = new Timer("onUpdate");
      await Excel.run(async (context: Excel.RequestContext) => {
        const rng = args.getRange(context);
        await context.sync();

        // const pfs = await App.fullAnalysisOnCellChange(context, rng);
        // const pfs = await App.fatCrossAnalysisOnCellChange(context, rng);
        const proposed_fixes = await incrementalFatCrossAnalysis(context, rng, DEBUG);
        let it: IteratorResult<Maybe<XLNT.ProposedFix[]>, Maybe<XLNT.ProposedFix[]>>;
        for (it = await proposed_fixes.next(); !it.done; it = await proposed_fixes.next()) {
          const v = it.value;
          switch (v.type) {
            case "no":
              console.log("No bugs found.");
              break;
            case "possibly":
              console.log(v.value);
              break;
            case "definitely":
              console.log(v.value);
              break;
            default:
              console.log("This case should not be possible.");
          }
        }

        // total time
        const elapsed = t.elapsedTime();
        console.log(elapsed);

        // const td = {
        //   total_μs: elapsed
        // };

        // TODO: at some point, update this:
        // update the UI state
        // this.setState({
        //   changeat: addr.worksheet + "!R" + addr.row + "C" + addr.column + " (" + rng.address + ")",
        //   oldformula: old_formula,
        //   newformula: formula,
        //   change: "'" + update[1] + "' at index " + update[0] + ".",
        //   verdict: buggy ? "Cell " + addr.toString() + " is buggy." : "No bugs found.",
        //   time_data: new Some(td)
        // });
        console.log("Analysis finished");
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
