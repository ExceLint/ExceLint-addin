"use strict";

import path = require("path");
import * as XLSX from "xlsx";
import * as sha224 from "crypto-js/sha224";
import * as base64 from "crypto-js/enc-base64";
import {
  Spreadsheet,
  ProposedFix,
  Analysis,
  ExceLintVector,
  Dict,
  Dictionary,
  Rectangle,
  expand,
} from "../excelint/core/ExceLintTypes";
import { Some, None, flatMap } from "../excelint/core/option";
import { Config } from "../excelint/core/config";
import { flatten } from "./polyfill";

export enum Selections {
  // eslint-disable-next-line no-unused-vars
  FORMULAS,
  // eslint-disable-next-line no-unused-vars
  VALUES,
  // eslint-disable-next-line no-unused-vars
  STYLES,
}

export class WorksheetOutput {
  sheetName: string;
  usedRangeAddress: string;
  // Spreadsheet is just a row-major string[][]
  formulas: Spreadsheet;
  values: Spreadsheet;
  styles: Spreadsheet;

  constructor(
    sheetName: string,
    usedRangeAddress: string,
    formulas: Spreadsheet,
    values: Spreadsheet,
    styles: Spreadsheet
  ) {
    this.sheetName = sheetName;
    this.usedRangeAddress = usedRangeAddress;
    this.formulas = formulas;
    this.values = values;
    this.styles = styles;
  }

  /**
   * Convert a worksheet's formulas into a Dictionary of formula strings
   * indexed by ExceLintVector key.
   * @returns A dictionary of formulas
   */
  public exportFormulaDict(): Dictionary<string> {
    const d = new Dictionary<string>();
    for (let row = 0; row < this.formulas.length; row++) {
      for (let col = 0; col < this.formulas[row].length; col++) {
        const addr = new ExceLintVector(col, row, 0);
        const value = this.formulas[row][col];
        d.put(addr.asKey(), value);
      }
    }
    return d;
  }
}

export class WorkbookOutput {
  workbookName: string;
  worksheets: WorksheetOutput[];

  constructor(filename: string) {
    this.workbookName = filename;
    this.worksheets = [];
  }

  // Tracks a worksheet object in this workbook object
  public addWorksheet(ws: WorksheetOutput): void {
    this.worksheets.push(ws);
  }

  // Returns the filename of the workbook, independently of the path
  public workbookBaseName(): string {
    return path.basename(this.workbookName);
  }

  // worksheet getter
  public get sheets(): WorksheetOutput[] {
    return this.worksheets;
  }

  // Makes a copy of a WorkbookOutput object, replacing the name
  public static AdjustWorkbookName(wb: WorkbookOutput) {
    const wbnew = new WorkbookOutput(wb.workbookBaseName());
    wbnew.worksheets = wb.worksheets;
    return wbnew;
  }
}

export class ExcelJSON {
  private static general_re = "\\$?[A-Z][A-Z]?\\$?\\d+"; // column and row number, optionally with $
  private static pair_re = new RegExp("(" + ExcelJSON.general_re + "):(" + ExcelJSON.general_re + ")");

  public static processWorksheet(sheet: XLSX.WorkSheet, selection: Selections) {
    let ref: string = "A1:A1"; // for empty sheets.
    if ("!ref" in sheet) {
      // Not empty.
      ref = sheet["!ref"] as string;
    }
    const decodedRange = XLSX.utils.decode_range(ref);
    const startColumn = 0; // decodedRange['s']['c'];
    const startRow = 0; // decodedRange['s']['r'];
    const endColumn = decodedRange["e"]["c"];
    const endRow = decodedRange["e"]["r"];

    const rows: string[][] = [];
    for (let r = startRow; r <= endRow; r++) {
      const row: string[] = [];
      for (let c = startColumn; c <= endColumn; c++) {
        const cell = XLSX.utils.encode_cell({ c: c, r: r });
        const cellValue = sheet[cell];
        // console.log(cell + ': ' + JSON.stringify(cellValue));
        let cellValueStr = "";
        if (cellValue) {
          switch (selection) {
            case Selections.FORMULAS:
              if (!cellValue["f"]) {
                cellValueStr = "";
              } else {
                cellValueStr = "=" + cellValue["f"];
              }
              break;
            case Selections.VALUES:
              // Numeric values.
              if (cellValue["t"] === "n") {
                if ("z" in cellValue && cellValue["z"] && cellValue["z"].endsWith("yy")) {
                  // ad hoc date matching.
                  // skip dates.
                } else {
                  cellValueStr = JSON.stringify(cellValue["v"]);
                }
              }
              break;
            case Selections.STYLES:
              if (cellValue["s"]) {
                // Encode the style as a hash (and just keep the first 10 characters).
                const styleString = JSON.stringify(cellValue["s"]);
                const str = base64.stringify(sha224(styleString));
                cellValueStr = str.slice(0, 10);
              }
              break;
          }
        }
        row.push(cellValueStr);
      }
      rows.push(row);
    }
    return rows;
  }

  public static processWorkbookFromXLSX(f: XLSX.WorkBook, filename: string): WorkbookOutput {
    const output = new WorkbookOutput(filename);
    const sheetNames = f.SheetNames;
    const sheets = f.Sheets;
    for (const sheetName of sheetNames) {
      const sheet = sheets[sheetName];
      if (!sheet) {
        // Weird edge case here.
        continue;
      }
      // console.warn('  processing ' + filename + '!' + sheetName);
      // Try to parse the ref to see if it's a pair (e.g., A1:B10) or a singleton (e.g., C9).
      // If the latter, make it into a pair (e.g., C9:C9).
      let ref;
      if ("!ref" in sheet) {
        ref = sheet["!ref"] as string;
      } else {
        // Empty sheet.
        ref = "A1:A1";
      }
      const result = ExcelJSON.pair_re.exec(ref); // ExcelJSON.pair_re.exec(ref);
      if (result) {
        // It's a pair; we're fine.
        // ACTUALLY to work around a bug downstream, we start everything at A1.
        // This sucks but it works.
        ref = "A1:" + result[2];
      } else {
        // Singleton. Make it a pair.
        ref = ref + ":" + ref;
      }
      const sheetRange = sheetName + "!" + ref;
      const sheet_formulas = ExcelJSON.processWorksheet(sheet, Selections.FORMULAS);
      const sheet_values = ExcelJSON.processWorksheet(sheet, Selections.VALUES);
      const sheet_styles = ExcelJSON.processWorksheet(sheet, Selections.STYLES);
      const wso = new WorksheetOutput(sheetName, sheetRange, sheet_formulas, sheet_values, sheet_styles);
      output.addWorksheet(wso);
    }
    return output;
  }

  public static processWorkbook(base: string, filename: string): WorkbookOutput {
    const f = XLSX.readFile(base + filename, { cellStyles: true });
    return this.processWorkbookFromXLSX(f, filename);
  }

  /**
   * After converting an Excel.RangeFormat to a JSON string using
   * JSON.stringify, use this method to compute a hash of the style.
   * @param styleString
   * @returns a style hash
   */
  public static styleHash(styleString: string): string {
    const str = base64.stringify(sha224(styleString));
    return str.slice(0, 10);
  }
}

export class WorkbookAnalysis {
  private sheets: Dict<WorksheetAnalysis> = {};
  private wb: WorkbookOutput;

  constructor(wb: WorkbookOutput) {
    this.wb = wb;
  }

  public getSheet(name: string) {
    return this.sheets[name];
  }

  public addSheet(s: WorksheetAnalysis) {
    this.sheets[s.name] = s;
  }

  public get workbook(): WorkbookOutput {
    return this.wb;
  }
}

export class WorksheetAnalysis {
  private readonly sheet: WorksheetOutput;
  private readonly pf: ProposedFix[];
  private readonly foundBugs: ExceLintVector[];
  private readonly analysis: Analysis;

  constructor(sheet: WorksheetOutput, pf: ProposedFix[], a: Analysis) {
    this.sheet = sheet;
    this.pf = pf;
    this.foundBugs = WorksheetAnalysis.createBugList(pf);
    this.analysis = a;
  }

  // Get the grouped data
  get groupedData(): Dictionary<Rectangle[]> {
    return this.analysis.grouped_data;
  }

  // Get the grouped formulas
  get groupedFormulas(): Dictionary<Rectangle[]> {
    return this.analysis.grouped_formulas;
  }

  // Get the sheet name
  get name(): string {
    return this.sheet.sheetName;
  }

  // Get all of the proposed fixes.
  get proposedFixes(): ProposedFix[] {
    return this.pf;
  }

  // Compute number of cells containing formulas.
  get numFormulaCells(): number {
    const fs = flatten(this.sheet.formulas);
    return fs.filter((x) => x.length > 0).length;
  }

  // Count the number of non-empty cells.
  get numValueCells(): number {
    const vs = flatten(this.sheet.values);
    return vs.filter((x) => x.length > 0).length;
  }

  // Compute number of columns
  get columns(): number {
    return this.sheet.values[0].length;
  }

  // Compute number of rows
  get rows(): number {
    return this.sheet.values.length;
  }

  // Compute total number of cells
  get totalCells(): number {
    return this.rows * this.columns;
  }

  // Produce a sum total of all of the entropy scores for use as a weight
  get weightedAnomalousRanges(): number {
    return this.pf.map((x) => x.score).reduce((x, y) => x + y, 0);
  }

  // Get the total number of anomalous cells
  get numAnomalousCells(): number {
    return this.foundBugs.length;
  }

  // Get the underlying sheet object
  get worksheet(): WorksheetOutput {
    return this.sheet;
  }

  // For every proposed fix, if it is above the score threshold, keep it,
  // and return the unique set of all vectors contained in any kept fix.
  private static createBugList(pf: ProposedFix[]): ExceLintVector[] {
    const keep: ExceLintVector[][] = flatMap((pf: ProposedFix) => {
      if (pf.score >= Config.reportingThreshold / 100) {
        const rect1cells = expand(pf.rect1.upperleft, pf.rect1.bottomright);
        const rect2cells = expand(pf.rect2.upperleft, pf.rect2.bottomright);
        return new Some(rect1cells.concat(rect2cells));
      } else {
        return None;
      }
    }, pf);
    const flattened = flatten(keep);
    return ExceLintVector.toSet(flattened);
  }
}

// // Performs an analysis on an entire workbook
// export function process_workbook(inp: WorkbookOutput, sheetName: string, beVerbose: boolean = false): WorkbookAnalysis {
//   const wba = new WorkbookAnalysis(inp);

//   // look for the requested sheet
//   for (let i = 0; i < inp.worksheets.length; i++) {
//     const sheet = inp.worksheets[i];

//     // function to get rectangle info for a rectangle;
//     // closes over sheet data
//     const rectf = (rect: Rectangle) => {
//       const formulaCoord = rect.upperleft;
//       const y = formulaCoord.y - 1; // row
//       const x = formulaCoord.x - 1; // col
//       const firstFormula = sheet.formulas[y][x];
//       return new RectInfo(rect, firstFormula);
//     };

//     // skip sheets that don't match sheetName or are empty
//     if (isNotSameSheet(sheetName, sheet.sheetName) || isEmptySheet(sheet)) {
//       continue;
//     }

//     // get the used range
//     const usedRangeAddress = normalizeAddress(sheet.usedRangeAddress);

//     // Get anomalous cells and proposed fixes, among others.
//     const a = Analysis.process_suspicious(usedRangeAddress, sheet.formulas, sheet.values, beVerbose);

//     // Eliminate fixes below user threshold
//     a.proposed_fixes = Analysis.filterFixesByUserThreshold(a.proposed_fixes, Config.reportingThreshold);

//     // Remove fixes that require fixing both a formula AND formatting.
//     // NB: origin_col and origin_row currently hard-coded at 0,0.
//     Analysis.adjust_proposed_fixes(a.proposed_fixes, sheet.styles, 0, 0);

//     // Process all the fixes, classifying and optionally pruning them.
//     const final_adjusted_fixes: ProposedFix[] = []; // We will eventually trim these.
//     for (let ind = 0; ind < a.proposed_fixes.length; ind++) {
//       // Get this fix
//       const fix = a.proposed_fixes[ind];

//       // check to see whether the fix should be rejected
//       const ffix = this.filterFix(fix, rectf, beVerbose);
//       if (ffix.hasValue) final_adjusted_fixes.push(ffix.value);
//     }

//     // gather all statistics about the sheet
//     wba.addSheet(new WorksheetAnalysis(sheet, final_adjusted_fixes, a));
//   }
//   return wba;
// }

// // return true if this sheet is not the same as the other sheet
// function isNotSameSheet(thisSheetName: string, otherSheetName: string): boolean {
//   return thisSheetName !== "" && otherSheetName !== thisSheetName;
// }

// // returns true if this is an empty sheet
// function isEmptySheet(sheet: any): boolean {
//   return sheet.formulas.length === 0 && sheet.values.length === 0;
// }

// // Get rid of multiple exclamation points in the used range address,
// // as these interfere with later regexp parsing.
// function normalizeAddress(addr: string): string {
//   return addr.replace(/!(!+)/, "!");
// }
