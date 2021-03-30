import * as React from "react";
import { Colorize } from "../../core/src/colorize";
import * as XLNT from "../../core/src/ExceLintTypes";
import { ExcelJSON } from "../../core/src/exceljson";
import { Option, None, Some, Maybe, Possibly, Definitely, No } from "../../core/src/option";
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
 * Run a fat cross analysis.  The caller of this function must have previously
 * loaded the "cellCount", "formulas", and "address" properties of the given
 * xlrng.  The given address must correspond to a single cell.
 *
 * This method is a generator and will yield four times before finally
 * returning for good.  Each time the function resumes, it will continue the
 * analysis where it left off.  When the method yields, it will either return a
 * No object, meaning that the cell is not an error, or Possibly, meaning that
 * further analysis is needed to be conclusive.  On the function's final return,
 * it will return either No with the same meaning above, or Definitely, meaning
 * that the cell is definitely a bug.
 * @param context Excel request context.
 * @param ws An Excel worksheet.
 * @param rng The region of interest.
 * @param addr An Excel address.
 * @returns A tuple containing array of proposed fixes and an array of old colors.
 */
export async function* incrementalFatCrossAnalysis(
  context: Excel.RequestContext,
  ws: Excel.Worksheet,
  rng: XLNT.Range,
  addr: XLNT.Address,
  use_colors_for_debugging: boolean,
  use_styles: boolean
): AsyncGenerator<
  Maybe<[XLNT.ProposedFix[], OldColor[]]>,
  Maybe<[XLNT.ProposedFix[], OldColor[]]>,
  Maybe<[XLNT.ProposedFix[], OldColor[]]>
> {
  // get fat cross
  const fc = RectangleUtils.findFatCross(rng, addr);

  // read formulas/styles from active sheet
  const steps = [fc.up, fc.left, fc.down, fc.right];

  // this is for debugging
  const debug_colors = ["#CBAACB", "#FFCCB6", "#ABDEE6", "#F3B0C3"];
  const old_colors: OldColor[] = [];

  // get all the formula data in the range once, at the beginning
  const all_formulas = await App.getFormulasFromRange(ws, rng, context);

  // storage for formula groups
  let rects = new XLNT.Dictionary<XLNT.Rectangle[]>();

  // output
  let proposed_fixes: XLNT.ProposedFix[] = [];
  for (let i = 0; i < steps.length; i++) {
    proposed_fixes = []; // clear outputs
    if (use_colors_for_debugging) {
      old_colors.push(await App.colorRange(ws, steps[i], debug_colors[i], context));
    }

    // get the formulas we care about
    const fAddrs = steps[i].rectangle().expand();
    const fAddrDict = new XLNT.Dictionary<XLNT.ExceLintVector>();
    for (const f of fAddrs) {
      fAddrDict.put(f.asKey(), f);
    }
    const fs = all_formulas.keyFilter(k => fAddrDict.contains(k));

    // get formatting
    const ss = use_styles ? await App.getFormattingFromRange(ws, steps[i], context) : new XLNT.Dictionary<string>();

    // get every reference vector set for every formula, indexed by address vector
    const fRefs = Colorize.relativeFormulaRefs(fs);

    // compute fingerprints for reference vector sets, indexed by address vector
    const fps = Colorize.fingerprints(fRefs);

    // decompose into rectangles, indexed by fingerprint
    const stepRects = Colorize.identify_groups(fps);

    // merge these new rectangles with the old ones
    rects = Colorize.mergeRectangleDictionaries(stepRects, rects);
    rects = Colorize.mergeRectangles(rects);

    // generate proposed fixes for all the new rectanles
    const pfs = Colorize.generate_proposed_fixes(rects);

    // filter fixes by user threshold
    const pfs2 = Colorize.filterFixesByUserThreshold(pfs, Config.reportingThreshold);

    // adjust proposed fixes by style (mutates input)
    Colorize.adjustProposedFixesByStyleHash(pfs2, ss);

    // filter fixes with heuristics
    for (const fix of pfs2) {
      // function to get rectangle info for a rectangle;
      // closes over sheet data
      const rectf = (rect: XLNT.Rectangle) => {
        const formulaCoord = rect.upperleft;
        const firstFormula = all_formulas.get(formulaCoord.asKey());
        return new XLNT.RectInfo(rect, firstFormula);
      };

      const ffix = Colorize.filterFix(fix, rectf, true);
      if (ffix.hasValue) proposed_fixes.push(ffix.value);
    }

    if (i === steps.length - 1) {
      // if this is the last step, the answer is conclusive
      if (proposed_fixes.length === 0) {
        yield No;
      } else {
        const tup: [XLNT.ProposedFix[], OldColor[]] = [proposed_fixes, old_colors];
        yield new Definitely(tup);
      }
    } else {
      // return what we know so far
      const tup: [XLNT.ProposedFix[], OldColor[]] = [proposed_fixes, old_colors];
      yield new Possibly(tup);
    }
  }
  // the answer is always conclusive from this point forward
  if (proposed_fixes.length === 0) {
    return No;
  } else {
    const tup: [XLNT.ProposedFix[], OldColor[]] = [proposed_fixes, old_colors];
    return new Definitely(tup);
  }
}

/**
 * The class that represents the task pane, including React UI state.
 */
export default class App extends React.Component<AppProps, AppState> {
  // public static readonly DEBUG = false; // true: shows colors, false: hides colors

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
      canRestore: this.state.canRestore,
      changeat: this.state.changeat,
      time_data: this.state.time_data,
      debug: value,
      use_styles: this.state.use_styles
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
      canRestore: this.state.canRestore,
      changeat: this.state.changeat,
      time_data: this.state.time_data,
      debug: this.state.debug,
      use_styles: value
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
      use_styles: false
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
        changeat: this.state.changeat,
        time_data: this.state.time_data,
        debug: this.state.debug,
        use_styles: this.state.use_styles
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
      const t = new Timer("onUpdate");
      await Excel.run(async (context: Excel.RequestContext) => {
        const rng = args.getRange(context);
        const activeSheet = context.workbook.worksheets.getActiveWorksheet();
        const usedRange = await App.getCurrentUsedRange(activeSheet, context);

        // we only care about events where the user changes a single cell
        rng.load(["cellCount", "formulas", "address"]);
        await context.sync();

        // now that we have all the data loaded...
        if (rng.cellCount === 1) {
          // get the range's address
          const addr = ExcelUtils.addrA1toR1C1(rng.address);

          // const pfs = await App.fullAnalysisOnCellChange(context, rng);
          // const pfs = await App.fatCrossAnalysisOnCellChange(context, rng);
          const proposed_fixes = await incrementalFatCrossAnalysis(
            context,
            activeSheet,
            usedRange,
            addr,
            this.DEBUG,
            this.STYLE
          );
          let it: IteratorResult<Maybe<[XLNT.ProposedFix[], OldColor[]]>, Maybe<[XLNT.ProposedFix[], OldColor[]]>>;
          for (it = await proposed_fixes.next(); !it.done; it = await proposed_fixes.next()) {
            const v = it.value;
            switch (v.type) {
              case "no":
                console.log("No bugs found.");
                break;
              case "possibly": {
                const [pfs, oc] = v.value;
                if (this.DEBUG) {
                  // get the restore button
                  const button = document.getElementById("RestoreButton")!;

                  // update handler
                  const handler = () => this.restoreColors(oc);
                  button.onclick = handler.bind(this);
                }

                console.log(pfs);
                break;
              }
              case "definitely": {
                const [pfs, oc] = v.value;
                if (this.DEBUG) {
                  // get the restore button
                  const button = document.getElementById("RestoreButton")!;

                  // update handler
                  const handler = () => this.restoreColors(oc);
                  button.onclick = handler.bind(this);
                }
                console.log(pfs);
                break;
              }
              default:
                console.log("This case should not be possible.");
            }
          }

          // total time
          const elapsed = Timer.round(t.elapsedTime());

          const td = {
            total_μs: elapsed
          };

          // update the UI state
          this.setState({
            canRestore: this.DEBUG && document.getElementById("RestoreButton")!.onclick !== null,
            changeat: addr.worksheet + "!R" + addr.row + "C" + addr.column + " (" + rng.address + ")",
            time_data: new Some(td),
            debug: this.state.debug,
            use_styles: this.state.use_styles
          });
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
    // Any event handlers to be run "in context" AFTER React is done rendering
    // can be inserted below.
    Excel.run(async (context: Excel.RequestContext) => {
      const worksheets = context.workbook.worksheets;

      // register change event with onRangeChange In React
      const handler = (args: Excel.WorksheetChangedEventArgs) => this.onRangeChangeInReact(args);
      worksheets.onChanged.add(handler);
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

    return (
      <div>
        <div className="ms-welcome">
          At: <em>{this.state.changeat}</em>
        </div>
        <div className="ms-welcome">
          Total time: {this.state.time_data.hasValue ? this.state.time_data.value.total_μs : ""} μs
        </div>
        <div>
          <input type="checkbox" id="doDEBUG" checked={this.DEBUG} onChange={() => this.toggleDebugState()} />
          <label htmlFor="doDEBUG">Show debug output</label>
        </div>
        <div>
          <input type="checkbox" id="doSTYLES" checked={this.STYLE} onChange={() => this.toggleStyleState()} />
          <label htmlFor="doSTYLES">Discount with styles</label>
        </div>
        {button}
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
