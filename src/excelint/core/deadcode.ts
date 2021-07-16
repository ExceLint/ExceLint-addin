import * as XLNT from "./ExceLintTypes";
import { Analysis } from "./analysis";
import { AST } from "../paraformula/src/ast";
import { Some, None, Option } from "./option";
import { ExcelUtils } from "./excelutils";
import { Config } from "./config";
import { RectangleUtils } from "./rectangleutils";

declare var console: Console;

/* eslint no-unused-vars: 0 */
module DeadCode {
  // return true if this sheet is not the same as the other sheet
  function isNotSameSheet(thisSheetName: string, otherSheetName: string): boolean {
    return thisSheetName !== "" && otherSheetName !== thisSheetName;
  }

  // returns true if this is an empty sheet
  function isEmptySheet(sheet: any): boolean {
    return sheet.formulas.length === 0 && sheet.values.length === 0;
  }

  // Get rid of multiple exclamation points in the used range address,
  // as these interfere with later regexp parsing.
  function normalizeAddress(addr: string): string {
    return addr.replace(/!(!+)/, "!");
  }

  // Given a full analysis, map addresses to rectangles
  function rectangleDict(a: XLNT.Analysis): XLNT.Dictionary<XLNT.Rectangle> {
    const _d = new XLNT.Dictionary<XLNT.Rectangle>();

    // for every cell in the analysis, find its bounding rectangle
    // and put it in the dictionary, indexed by address (vector)
    const rects: XLNT.Rectangle[] = [];
    for (const rect of a.grouped_formulas.values) {
      rects.concat(rect);
    }
    for (let i = 0; i < rects.length; i++) {
      const rect = rects[i];
      const cells = rect.expand();
      for (let j = 0; j < cells.length; j++) {
        // index this rectangle by this address (vector)
        _d.put(cells[j].asKey(), rect);
      }
    }

    return _d;
  }

  // Given a set of rectangles indexed by their addresses, produce a set of
  // adjacencies indexed by their addresses
  function adjacencyDict(rd: XLNT.Dictionary<XLNT.Rectangle>, a: XLNT.Analysis): XLNT.Dictionary<XLNT.Adjacency> {
    const _d = new XLNT.Dictionary<XLNT.Adjacency>();

    // for every cell in the given dictionary, find its adjacencies
    // and index in dictionary by address (vector)
    const addrs = rd.keys;
    for (let i = 0; i < addrs.length; i++) {
      // get the address (a string, because it's a JS dictionary key)
      const addr = addrs[i];

      // get the address vector
      const v = XLNT.ExceLintVector.fromKey(addr);

      // compute the addresses (as keys) of the cells above, below, to the left,
      // and to the right of this cell.
      const up_addr = v.up.asKey();
      const down_addr = v.down.asKey();
      const left_addr = v.left.asKey();
      const right_addr = v.right.asKey();

      // get the rectangle and fingerprint for each adjacency
      // if there is no adjacency (i.e., cell lies on the used range border)
      // store 'None'
      const up_tup = rd.contains(up_addr)
        ? new Some(new XLNT.Tuple2(rd.get(up_addr), a.formula_fingerprints.get(up_addr)))
        : None;
      const down_tup = rd.contains(down_addr)
        ? new Some(new XLNT.Tuple2(rd.get(down_addr), a.formula_fingerprints.get(down_addr)))
        : None;
      const left_tup = rd.contains(left_addr)
        ? new Some(new XLNT.Tuple2(rd.get(left_addr), a.formula_fingerprints.get(left_addr)))
        : None;
      const right_tup = rd.contains(right_addr)
        ? new Some(new XLNT.Tuple2(rd.get(right_addr), a.formula_fingerprints.get(right_addr)))
        : None;

      // add adjacency to dict
      _d.put(addr, new XLNT.Adjacency(up_tup, down_tup, left_tup, right_tup));
    }

    return _d;
  }

  /**
   * Returns true iff the two vectors are the same.
   * @param v1
   * @param v2
   * @returns
   */
  function vectorCompare(v1: XLNT.ExceLintVector, v2: XLNT.ExceLintVector): boolean {
    return v1.x === v2.x && v1.y === v2.y && v1.c === v2.c;
  }

  /**
   * Find all the fingerprints for all the formulas in the given used range.
   * This is the actual fingerprint implementation; fingerprintFormulas is a
   * helper method.
   * @param formulas A spreadsheet of formula strings.
   * @param origin_col A column offset from which to start.
   * @param origin_row A row offset from which to start.
   */
  export function fingerprintFormulasImpl(
    formulas: XLNT.Spreadsheet,
    origin_col: number,
    origin_row: number
  ): XLNT.Dictionary<XLNT.Fingerprint> {
    const _d = new XLNT.Dictionary<XLNT.Fingerprint>();

    // Compute the vectors for all of the formulas.
    for (let i = 0; i < formulas.length; i++) {
      const row = formulas[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j].toString();
        // If it's a formula, process it.
        if (cell.length > 0) {
          // FIXME MAYBE  && (row[j][0] === '=')) {
          // Emery's version:
          const vec_array: XLNT.ExceLintVector[] = ExcelUtils.all_dependencies(
            i,
            j,
            origin_row + i,
            origin_col + j,
            formulas
          );
          const adjustedX = j + origin_col + 1;
          const adjustedY = i + origin_row + 1;
          if (vec_array.length === 0) {
            if (cell[0] === "=") {
              // It's a formula but it has no dependencies (i.e., it just has constants). Use a distinguished value.
              const v = new XLNT.ExceLintVector(adjustedX, adjustedY, 0);
              _d.put(v.asKey(), Analysis.noDependenciesHash);
            }
          } else {
            // compute resultant vector
            const vec = vec_array.reduce(XLNT.ExceLintVector.VectorSum);

            // get the address vector
            const v = new XLNT.ExceLintVector(adjustedX, adjustedY, 0);

            // add to dict
            if (vec.equals(XLNT.ExceLintVector.baseVector())) {
              _d.put(v.asKey(), Analysis.noDependenciesHash);
            } else {
              const hash = vec.hash();
              _d.put(v.asKey(), new XLNT.Fingerprint(hash));
            }
          }
        }
      }
    }
    return _d;
  }

  // Returns all referenced data so it can be colored later.
  export function color_all_data(refs: XLNT.Dictionary<boolean>): XLNT.Dictionary<XLNT.Fingerprint> {
    const _d = new XLNT.Dictionary<XLNT.Fingerprint>();

    for (const refvec of refs.keys) {
      _d.put(refvec, Analysis.noDependenciesHash);
    }

    return _d;
  }

  // Take all values and return an array of each row and column.
  // Note that for now, the last value of each tuple is set to 1.
  function process_values(
    values: XLNT.Spreadsheet,
    formulas: XLNT.Spreadsheet,
    origin_col: number,
    origin_row: number
  ): [XLNT.ExceLintVector, XLNT.Fingerprint][] {
    const value_array: [XLNT.ExceLintVector, XLNT.Fingerprint][] = [];
    //	let t = new Timer('process_values');
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j].toString();
        // If the value is not from a formula, include it.
        if (cell.length > 0 && formulas[i][j][0] !== "=") {
          const cellAsNumber = Number(cell).toString();
          if (cellAsNumber === cell) {
            // It's a number. Add it.
            const adjustedX = j + origin_col + 1;
            const adjustedY = i + origin_row + 1;
            // See comment at top of function declaration for DistinguishedZeroHash
            value_array.push([new XLNT.ExceLintVector(adjustedX, adjustedY, 1), Analysis.noDependenciesHash]);
          }
        }
      }
    }
    //	t.split('processed all values');
    return value_array;
  }

  /**
   * Determine whether the number of formulas in the spreadsheet exceeds
   * a hand-tuned threshold (for analysis responsiveness).
   * @param formulas A Spreadsheet of formulas
   */
  export function tooManyFormulas(formulas: XLNT.Spreadsheet) {
    const totalFormulas = (formulas as any).flat().filter(Boolean).length;
    return totalFormulas > Config.formulasThreshold;
  }

  /**
   * Determine whether the number of values in the spreadsheet exceeds
   * a hand-tuned threshold (for analysis responsiveness).
   * @param values A Spreadsheet of values
   */
  export function tooManyValues(values: XLNT.Spreadsheet) {
    const totalValues = (values as any).flat().filter(Boolean).length;
    return totalValues > Config.valuesThreshold;
  }

  /**
   * Find all the fingerprints for all the formulas in the given used range.
   * TODO FIX: I'm not exactly sure how the used range is used here.
   * @param usedRangeAddress A1 string representation of used range reference
   * @param formulas A spreadsheet of formulas.
   * @param beVerbose Print diagnostics to console when true.
   */
  export function fingerprintFormulas(
    usedRangeAddress: string,
    formulas: XLNT.Spreadsheet,
    beVerbose: boolean
  ): XLNT.Dictionary<XLNT.Fingerprint> {
    const [, startCell] = ExcelUtils.extract_sheet_cell(usedRangeAddress);
    const origin = ExcelUtils.cell_dependency(startCell, 0, 0);

    // Filter out non-empty items from whole matrix.
    if (DeadCode.tooManyFormulas(formulas)) {
      if (beVerbose) console.warn("Too many formulas to perform formula analysis.");
      return new XLNT.Dictionary<XLNT.Fingerprint>();
    } else {
      return DeadCode.fingerprintFormulasImpl(formulas, origin.x - 1, origin.y - 1);
    }
  }

  /**
   * Find all the fingerprints for all the data in the given used range.
   * TODO FIX: I'm not exactly sure how the used range is used here.
   * @param usedRangeAddress A1 string representation of used range reference
   * @param formulas A spreadsheet of formula strings.
   * @param values A spreadsheet of values.
   * @param beVerbose Print diagnostics to console when true.
   */
  export function fingerprintData(
    usedRangeAddress: string,
    formulas: XLNT.Spreadsheet,
    values: XLNT.Spreadsheet,
    beVerbose: boolean
  ): XLNT.Dictionary<XLNT.Fingerprint> {
    const [, startCell] = ExcelUtils.extract_sheet_cell(usedRangeAddress);
    const origin = ExcelUtils.cell_dependency(startCell, 0, 0);

    // Filter out non-empty items from whole matrix.
    if (DeadCode.tooManyValues(values)) {
      if (beVerbose) console.warn("Too many values to perform reference analysis.");
      return new XLNT.Dictionary<XLNT.Fingerprint>();
    } else {
      // Compute references (to color referenced data).
      const refs: XLNT.Dictionary<boolean> = ExcelUtils.generate_all_references(formulas, origin.x - 1, origin.y - 1);

      return DeadCode.color_all_data(refs);
    }
  }

  /**
   * Find all the fingerprints for all the data in the given used range. Note that this
   * is not the is-referenced-by analysis that fingerprintData does.  This analysis
   * essentially produces L1 hashes of vectors of <0,0,1> whereever a cell is a numeric constant.
   * @param data Dictionary mapping ExceLint address vectors to numeric values.
   */
  function fingerprintNumericData(data: XLNT.Dictionary<number>): XLNT.Dictionary<XLNT.Fingerprint> {
    const _d = new XLNT.Dictionary<XLNT.Fingerprint>();
    for (const k of data.keys) {
      const v = new XLNT.ExceLintVector(0, 0, 1); // compute this data's reference
      const fp = new XLNT.Fingerprint(v.hash()); // compute this data's L1 hash
      _d.put(k, fp);
    }
    return _d;
  }

  /**
   * This is the core of an ExceLint analysis.  It fingerprints formulas and data,
   * partitions them into rectangular regions, and then returns an Analysis object
   * that contains ProposedFixes.
   * @param usedRangeAddr A1 string representation of used range reference.
   * @param formulas A spreadsheet of formula strings.
   * @param values A spreadsheet of value (data) strings.
   * @param beVerbose Print diagnostics to console when true.
   */
  function process_suspicious(
    usedRangeAddr: string,
    formulas: XLNT.Spreadsheet,
    values: XLNT.Spreadsheet,
    beVerbose: boolean
  ): XLNT.Analysis {
    // fingerprint all the formulas
    const processed_formulas = DeadCode.fingerprintFormulas(usedRangeAddr, formulas, beVerbose);

    // fingerprint all the data
    const referenced_data = DeadCode.fingerprintData(usedRangeAddr, formulas, values, beVerbose);

    // find regions for data
    const grouped_data = Analysis.identify_groups(referenced_data);

    // find regions for formulas
    const grouped_formulas = Analysis.identify_groups(processed_formulas);

    // Identify suspicious cells (disabled)
    let suspicious_cells: XLNT.ExceLintVector[] = [];

    // find proposed fixes
    const proposed_fixes = Analysis.generate_proposed_fixes(grouped_formulas);

    return new XLNT.Analysis(
      suspicious_cells,
      grouped_formulas,
      grouped_data,
      proposed_fixes,
      processed_formulas,
      referenced_data
    );
  }

  // Shannon entropy.
  function entropy(p: number): number {
    return -p * Math.log2(p);
  }

  // Take two counts and compute the normalized entropy difference that would result if these were 'merged'.
  function entropydiff(oldcount1: number, oldcount2: number) {
    const total = oldcount1 + oldcount2;
    const prevEntropy = this.entropy(oldcount1 / total) + this.entropy(oldcount2 / total);
    const normalizedEntropy = prevEntropy / Math.log2(total);
    return -normalizedEntropy;
  }

  // Iterate through the size of proposed fixes.
  function count_proposed_fixes(fixes: Array<[number, XLNT.Rectangle, XLNT.Rectangle]>): number {
    let count = 0;
    // tslint:disable-next-line: forin
    for (const k in fixes) {
      const f11 = fixes[k][1].upperleft;
      const f12 = fixes[k][1].bottomright;
      const f21 = fixes[k][2].upperleft;
      const f22 = fixes[k][2].bottomright;
      count += RectangleUtils.diagonal(
        new XLNT.Rectangle(new XLNT.ExceLintVector(f11.x, f11.y, 0), new XLNT.ExceLintVector(f12.x, f12.y, 0))
      );
      count += RectangleUtils.diagonal(
        new XLNT.Rectangle(new XLNT.ExceLintVector(f21.x, f21.y, 0), new XLNT.ExceLintVector(f22.x, f22.y, 0))
      );
    }
    return count;
  }

  function formulaSpreadsheetToDict(s: XLNT.Spreadsheet, origin_x: number, origin_y: number): XLNT.Dictionary<string> {
    const d = new XLNT.Dictionary<string>();
    // spreadsheets are row-major
    for (let row = 0; row < s.length; row++) {
      for (let col = 0; col < s[row].length; col++) {
        const val = s[row][col];
        /*
         * 'If the returned value starts with a plus ("+"), minus ("-"),
         * or equal sign ("="), Excel interprets this value as a formula.'
         * https://docs.microsoft.com/en-us/javascript/api/excel/excel.range?view=excel-js-preview#values
         */
        if (val[0] === "=" || val[0] === "+" || val[0] === "-") {
          // save as 1-based Excel vector
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

  // Mark proposed fixes that do not have the same format.
  // Modifies ProposedFix objects, including their scores.
  function adjust_proposed_fixes(
    fixes: XLNT.ProposedFix[],
    propertiesToGet: XLNT.Spreadsheet,
    origin_col: number,
    origin_row: number
  ): void {
    for (const k in fixes) {
      const fix = fixes[k];
      const rect1 = fix.rect1;
      const rect2 = fix.rect2;

      // Find out which range is "first," i.e., sort by x and then by y.
      const [first, second] = XLNT.rectangleComparator(rect1, rect2) <= 0 ? [rect1, rect2] : [rect2, rect1];

      // get the upper-left and bottom-right vectors for the two XLNT.rectangles
      const ul = first.upperleft;
      const br = second.bottomright;

      // get the column and row for the upper-left and bottom-right vectors
      const ul_col = ul.x - origin_col - 1;
      const ul_row = ul.y - origin_row - 1;
      const br_col = br.x - origin_col - 1;
      const br_row = br.y - origin_row - 1;

      // Now check whether the formats are all the same or not.
      // Get the first format and then check that all other cells in the
      // range have the same format.
      // We can iterate over the combination of both ranges at the same
      // time because all proposed fixes must be "merge compatible," i.e.,
      // adjacent XLNT.rectangles that, when merged, form a new rectangle.
      const prop = propertiesToGet[ul_row][ul_col];
      const firstFormat = JSON.stringify(prop);
      for (let i = ul_row; i <= br_row; i++) {
        // if we've already determined that the formats are different
        // stop looking for differences
        if (!fix.sameFormat) {
          break;
        }
        for (let j = ul_col; j <= br_col; j++) {
          const secondFormat = JSON.stringify(propertiesToGet[i][j]);
          if (secondFormat !== firstFormat) {
            // stop looking for differences and modify fix
            fix.sameFormat = false;
            fix.score *= (100 - Config.getFormattingDiscount()) / 100;
            break;
          }
        }
      }
    }
  }

  /**
   * Expands a region defined by two AST.Address expressions into an array of
   * addresses.
   * @param tl Top left address.
   * @param br Bottom right address.
   */
  function expandAddressRegion(tl: AST.Address, br: AST.Address): AST.Address[] {
    // we ignore relative/absolute modes in regions for now.
    const addrs: AST.Address[] = [];
    for (let x = tl.column; x <= br.column; x++) {
      for (let y = tl.row; y <= br.row; y++) {
        const addr = new AST.Address(y, x, AST.RelativeAddress, AST.RelativeAddress, tl.env);
        addrs.push(addr);
      }
    }
    return addrs;
  }
}
