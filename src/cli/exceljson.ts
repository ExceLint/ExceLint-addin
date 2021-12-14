"use strict";

import path = require("path");
import * as XLSX from "xlsx";
import * as sha224 from "crypto-js/sha224";
import * as base64 from "crypto-js/enc-base64";
import { Address, Range, Spreadsheet, ProposedFix, ExceLintVector, Dictionary } from "../excelint/core/ExceLintTypes";
import { flatten } from "./polyfill";
import { Analysis } from "../excelint/core/analysis";
import { AnnotationData } from "./bugs";
import { Paraformula } from "../excelint/paraformula/src/paraformula";
import { appendFileSync, writeFileSync } from "fs";
import { Option } from "../excelint/core/option";

export enum Selections {
  // eslint-disable-next-line no-unused-vars
  FORMULAS,
  // eslint-disable-next-line no-unused-vars
  VALUES,
  // eslint-disable-next-line no-unused-vars
  STYLES,
}

export class WorksheetOutput {
  public readonly formulaDict: Dictionary<string>; // indexed by excelintvector
  public readonly usedRange: Range;

  constructor(
    // Spreadsheet is just a row-major string[][]
    /* eslint-disable no-unused-vars */
    public readonly sheetName: string,
    public readonly usedRangeAddress: string,
    public readonly formulas: Spreadsheet,
    public readonly values: Spreadsheet,
    public readonly styles: Spreadsheet
  ) {
    this.formulaDict = this.exportFormulaDict();

    // get the used range
    const ura = this.usedRangeAddress;

    // paraformula has trouble with spaces in worksheet names, apparently;
    // just remove the worksheet name since we don't use it anyway
    const bits = ura.split("!");
    const expr = Paraformula.parse("=" + bits[1]);
    switch (expr.type) {
      case "ReferenceRange": {
        const ast_range = expr.rng;
        const regions = ast_range.regions;
        if (regions.length > 1) {
          throw new Error("Discontiguous ranges are not supported.");
        }
        const start = regions[0][0];
        const end = regions[0][1];
        const a_start = new Address(start.worksheetName, start.row, start.column);
        const a_end = new Address(end.worksheetName, end.row, end.column);
        const rng = new Range(a_start, a_end);
        this.usedRange = rng;
        break;
      }
      default:
        throw new Error("Unable to parse range: " + ura);
    }
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
        const formula = this.formulas[row][col];
        // we don't care about non-formulas
        if (formula.charAt(0) != "=") continue;
        const addr = new ExceLintVector(col + 1, row + 1, 0);
        d.put(addr.asKey(), formula);
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

  public static CSV(workbookName: string, wsa: WorksheetAnalysis, annotations: AnnotationData): CSVRow[] {
    const rows: CSVRow[] = [];

    // for each flagged
    for (const flag of wsa.flags) {
      // fold suggested fixes into a single string
      const suggs = wsa.suggestionsFor(flag).join("; ");

      // fold scores into a single string
      const scores = wsa
        .fixesFor(flag)
        .map((fix) => fix.score.toFixed(3).toString())
        .join("; ");

      rows.push(
        new CSVRow(
          workbookName,
          wsa.worksheet.sheetName,
          flag,
          wsa.formulaForSheet(flag),
          annotations.isBug(workbookName, wsa.worksheet.sheetName, flag).toString(),
          suggs,
          scores
        )
      );
    }

    return rows;
  }

  /**
   * Appends data to the specified file.  If a header is given, the header is
   * written first, overwriting anything at the given path, and then data is
   * appended.
   * @param file A path to a file.
   * @param data A line of data (e.g., a CSV row)
   * @param header_opt An optional header
   */
  public static writeFile(file: string, data: string, header_opt: Option<string>): void {
    if (!header_opt.hasValue) {
      appendFileSync(file, data);
    } else {
      writeFileSync(file, header_opt.value);
      appendFileSync(file, data);
    }
  }

  public static CSVtoString(rows: CSVRow[]): string {
    // convert to string
    const s = rows.map((row) => row.toString()).join("\n");
    if (s != "") {
      return s + "\n";
    } else {
      return s;
    }
  }
}

export class CSVRow {
  constructor(
    /* eslint-disable no-unused-vars */
    public readonly wb: string,
    public readonly ws: string,
    public readonly flag_vector: ExceLintVector,
    public readonly formula: string,
    public readonly is_true_positive: string,
    public readonly suggestions: string,
    public readonly scores: string
  ) {}

  public static get header(): string {
    const hdr = ["workbook", "worksheet", "address", "formula", "true_positive", "suggested_fixes", "scores"];
    const hdresc = hdr.map((elem) => CSVRow.q(elem)).join(",");
    return hdresc + "\n";
  }

  public static q(s: string): string {
    return '"' + s + '"';
  }

  public static a(ss: string[]): string {
    return ss.reduce((acc, s) => acc + "," + s);
  }

  public toString(): string {
    // remove the leading = if present and add '
    const short = this.formula.slice(1);
    const cond = this.formula.charAt(0) === "=";
    const fmod = cond ? "'" + short : this.formula;

    // add ' to nonempty suggestions
    const smod = this.suggestions.length > 0 ? "'" + this.suggestions : this.suggestions;

    // convert ExceLintVector to A1 address
    const addr = new Address(this.ws, this.flag_vector.y, this.flag_vector.x).toA1Ref();

    return CSVRow.a([
      CSVRow.q(this.wb),
      CSVRow.q(this.ws),
      CSVRow.q(addr),
      CSVRow.q(fmod),
      CSVRow.q(this.is_true_positive.toString()),
      CSVRow.q(smod),
      CSVRow.q(this.scores),
    ]);
  }
}

export class SummaryCSVRow {
  constructor(
    public readonly wb: string,
    public readonly ws: string,
    public readonly true_positives: number,
    public readonly false_positives: number,
    public readonly false_negatives: number,
    public readonly num_bugs: number,
    public readonly precision: number,
    public readonly recall: number
  ) {}

  public static get header(): string {
    return (
      CSVRow.a([
        "workbook",
        "worksheet",
        "true_positives",
        "false_positives",
        "false_negatives",
        "num_bugs",
        "precision",
        "recall",
      ]) + "\n"
    );
  }

  public toString(): string {
    return (
      CSVRow.a([
        CSVRow.q(this.wb),
        CSVRow.q(this.ws),
        CSVRow.q(this.true_positives.toFixed(0)),
        CSVRow.q(this.false_positives.toFixed(0)),
        CSVRow.q(this.false_negatives.toFixed(0)),
        CSVRow.q(this.num_bugs.toFixed(0)),
        CSVRow.q(this.precision.toFixed(2)),
        CSVRow.q(this.recall.toFixed(2)),
      ]) + "\n"
    );
  }
}

export class WorkbookAnalysis {
  private _sheets = new Dictionary<WorksheetAnalysis>();
  private wb: WorkbookOutput;

  constructor(wb: WorkbookOutput) {
    this.wb = wb;
  }

  public getSheet(name: string) {
    return this._sheets[name];
  }

  public addSheet(s: WorksheetAnalysis) {
    this._sheets.put(s.name, s);
  }

  public get workbook(): WorkbookOutput {
    return this.wb;
  }

  public get sheets(): WorksheetAnalysis[] {
    return this._sheets.values;
  }
}

export class WorksheetAnalysis {
  private readonly data: WorksheetOutput;
  private readonly pfs: Dictionary<ProposedFix[]>; // all the proposed fixes for a given cell
  // private readonly foundBugs: ExceLintVector[];

  constructor(sheet: WorksheetOutput, pfs: Dictionary<ProposedFix[]>) {
    this.data = sheet;
    this.pfs = pfs;
    // this.foundBugs = WorksheetAnalysis.createBugList(pfs.values.flat());
  }

  // Get the sheet name
  get name(): string {
    return this.data.sheetName;
  }

  // return the formula for a given cell
  public formulaForSheet(addrv: ExceLintVector): string {
    if (this.data.formulaDict.contains(addrv.asKey())) {
      return this.data.formulaDict.get(addrv.asKey());
    }
    return "";
  }

  // return the entire formula dictionary
  public get formulas(): Dictionary<string> {
    return this.data.formulaDict;
  }

  // Compute number of cells containing formulas.
  get numFormulaCells(): number {
    const fs = flatten(this.data.formulas);
    return fs.filter((x) => x.length > 0).length;
  }

  // Count the number of non-empty cells.
  get numValueCells(): number {
    const vs = flatten(this.data.values);
    return vs.filter((x) => x.length > 0).length;
  }

  // Compute number of columns
  get columns(): number {
    return this.data.values[0].length;
  }

  // Compute number of rows
  get rows(): number {
    return this.data.values.length;
  }

  // Compute total number of cells
  get totalCells(): number {
    return this.rows * this.columns;
  }

  // Produce a sum total of all of the entropy scores for use as a weight
  // get weightedAnomalousRanges(): number {
  //   return this.pf.map((x) => x.score).reduce((x, y) => x + y, 0);
  // }

  // Get the total number of anomalous cells
  get numAnomalousCells(): number {
    return this.pfs.size;
  }

  // Return the complete set of bug flags
  get flags(): ExceLintVector[] {
    return this.pfs.keys.map((k) => ExceLintVector.fromKey(k));
  }

  // Get the underlying sheet object
  get worksheet(): WorksheetOutput {
    return this.data;
  }

  // get the proposed fixes for a given cell, if there are any
  public fixesFor(addrv: ExceLintVector): ProposedFix[] {
    if (this.pfs.contains(addrv.asKey())) {
      return this.pfs.get(addrv.asKey());
    }
    return [];
  }

  // get the fix suggestions for a given cell, if there are any
  public suggestionsFor(addrv: ExceLintVector): string[] {
    // gin up an address
    const addr = new Address(this.data.sheetName, addrv.y, addrv.x);
    // and call the synthesis module from ExceLint
    return Analysis.synthFixes(addr, this.fixesFor(addrv), this.formulas);
  }

  // // For every proposed fix, if it is above the score threshold, keep it,
  // // and return the unique set of all vectors contained in any kept fix.
  // private static createBugList(pf: ProposedFix[]): ExceLintVector[] {
  //   const keep: ExceLintVector[][] = flatMap((pf: ProposedFix) => {
  //     if (pf.score >= Config.reportingThreshold / 100) {
  //       const rect1cells = expand(pf.rect1.upperleft, pf.rect1.bottomright);
  //       const rect2cells = expand(pf.rect2.upperleft, pf.rect2.bottomright);
  //       return new Some(rect1cells.concat(rect2cells));
  //     } else {
  //       return None;
  //     }
  //   }, pf);
  //   const flattened = flatten(keep);
  //   return ExceLintVector.toSet(flattened);
  // }
}
