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
          const vec_array: XLNT.ExceLintVector[] = DeadCode.all_dependencies(
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
    const [, startCell] = DeadCode.extract_sheet_cell(usedRangeAddress);
    const origin = DeadCode.cell_dependency(startCell, 0, 0);

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
    const [, startCell] = DeadCode.extract_sheet_cell(usedRangeAddress);
    const origin = DeadCode.cell_dependency(startCell, 0, 0);

    // Filter out non-empty items from whole matrix.
    if (DeadCode.tooManyValues(values)) {
      if (beVerbose) console.warn("Too many values to perform reference analysis.");
      return new XLNT.Dictionary<XLNT.Fingerprint>();
    } else {
      // Compute references (to color referenced data).
      const refs: XLNT.Dictionary<boolean> = DeadCode.generate_all_references(formulas, origin.x - 1, origin.y - 1);

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

  function all_cell_dependencies(
    range: string,
    origin_col: number,
    origin_row: number,
    include_numbers = true
  ): XLNT.ExceLintVector[] {
    const all_vectors: XLNT.ExceLintVector[] = [];

    if (typeof range !== "string") {
      return [];
    }

    // Zap all the formulas with the below characteristics.
    range = range.replace(this.formulas_with_numbers, "_"); // Don't track these.
    range = range.replace(this.formulas_with_quoted_sheetnames_2, "_");
    range = range.replace(this.formulas_with_quoted_sheetnames_1, "_");
    range = range.replace(this.formulas_with_unquoted_sheetnames_2, "_");
    range = range.replace(this.formulas_with_unquoted_sheetnames_1, "_");
    range = range.replace(this.formulas_with_unquoted_sheetnames_1, "_");
    range = range.replace(this.formulas_with_structured_references, "_");

    /// FIX ME - should we count the same range multiple times? Or just once?

    // First, get all the range pairs out.
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      const found_pair = DeadCode.range_pair.exec(range);
      if (found_pair) {
        const first_cell = found_pair[1];
        const first_vec = DeadCode.cell_dependency(first_cell, origin_col, origin_row);
        const last_cell = found_pair[2];
        const last_vec = DeadCode.cell_dependency(last_cell, origin_col, origin_row);

        // First_vec is the upper-left hand side of a rectangle.
        // Last_vec is the lower-right hand side of a rectangle.

        // Generate all vectors.
        const length = last_vec.x - first_vec.x + 1;
        const width = last_vec.y - first_vec.y + 1;
        for (let x = 0; x < length; x++) {
          for (let y = 0; y < width; y++) {
            all_vectors.push(new XLNT.ExceLintVector(x + first_vec.x, y + first_vec.y, 0));
          }
        }

        // Wipe out the matched contents of range.
        range = range.replace(found_pair[0], "_");
      } else {
        break;
      }
    }

    // Now look for singletons.
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      const singleton = DeadCode.single_dep.exec(range);
      if (singleton) {
        const first_cell = singleton[1];
        const vec = DeadCode.cell_dependency(first_cell, origin_col, origin_row);
        all_vectors.push(vec);
        // Wipe out the matched contents of range.
        range = range.replace(singleton[0], "_");
      } else {
        break;
      }
    }

    if (include_numbers) {
      // Optionally roll numbers in formulas into the dependency vectors. Each number counts as "1".
      /* eslint-disable-next-line no-constant-condition */
      while (true) {
        const number = DeadCode.number_dep.exec(range);
        if (number) {
          all_vectors.push(new XLNT.ExceLintVector(0, 0, 1)); // just add 1 for every number
          // Wipe out the matched contents of range.
          range = range.replace(number[0], "_");
        } else {
          break;
        }
      }
    }
    //	console.log("all_vectors " + originalRange + " = " + JSON.stringify(all_vectors));
    return all_vectors;
  }

  // Matchers for all kinds of Excel expressions.
  const general_re = "\\$?[A-Z][A-Z]?\\$?[\\d\\u2000-\\u6000]+"; // column and row number, optionally with $
  const sheet_re = "[^\\!]+";
  const sheet_plus_cell = new RegExp("(" + DeadCode.sheet_re + ")\\!(" + DeadCode.general_re + ")");
  const sheet_plus_range = new RegExp(
    "(" + DeadCode.sheet_re + ")\\!(" + DeadCode.general_re + "):(" + DeadCode.general_re + ")"
  );
  const single_dep = new RegExp("(" + DeadCode.general_re + ")");
  const number_dep = new RegExp("([0-9]+\\.?[0-9]*)");
  const cell_both_relative = new RegExp("[^\\$A-Z]?([A-Z][A-Z]?)([\\d\\u2000-\\u6000]+)");
  const cell_col_absolute = new RegExp("\\$([A-Z][A-Z]?)([\\d\\u2000-\\u6000]+)");
  const cell_row_absolute = new RegExp("[^\\$A-Z]?([A-Z][A-Z]?)\\$([\\d\\u2000-\\u6000]+)");
  const cell_both_absolute = new RegExp("\\$([A-Z][A-Z]?)\\$([\\d\\u2000-\\u6000]+)");

  // We need to filter out all formulas with these characteristics so they don't mess with our dependency regexps.

  const formulas_with_numbers = new RegExp(
    "/ATAN2|BIN2DEC|BIN2HEX|BIN2OCT|DAYS360|DEC2BIN|DEC2HEX|DEC2OCT|HEX2BIN|HEX2DEC|HEX2OCT|IMLOG2|IMLOG10|LOG10|OCT2BIN|OCT2DEC|OCT2HEX|SUNX2MY2|SUMX2PY2|SUMXMY2|T.DIST.2T|T.INV.2T/",
    "g"
  );
  // Same with sheet name references.
  const formulas_with_quoted_sheetnames_1 = new RegExp("'[^']*'!" + "\\$?[A-Z][A-Z]?\\$?\\d+", "g");
  const formulas_with_quoted_sheetnames_2 = new RegExp(
    "'[^']*'!" + "\\$?[A-Z][A-Z]?\\$?\\d+" + ":" + "\\$?[A-Z][A-Z]?\\$?\\d+",
    "g"
  );
  const formulas_with_unquoted_sheetnames_1 = new RegExp("[A-Za-z0-9]+!" + "\\$?[A-Z][A-Z]?\\$?\\d+", "g");
  const formulas_with_unquoted_sheetnames_2 = new RegExp(
    "[A-Za-z0-9]+!" + "\\$?[A-Z][A-Z]?\\$?\\d+" + ":" + "\\$?[A-Z][A-Z]?\\$?\\d+",
    "g"
  );
  const formulas_with_structured_references = new RegExp("\\[([^\\]])*\\]", "g");

  // Take a range string and compute the number of cells.
  function get_number_of_cells(address: string): number {
    // Compute the number of cells in the range "usedRange".
    const usedRangeAddresses = DeadCode.extract_sheet_range(address);
    const upperLeftCorner = DeadCode.cell_dependency(usedRangeAddresses[1], 0, 0);
    const lowerRightCorner = DeadCode.cell_dependency(usedRangeAddresses[2], 0, 0);
    const numberOfCellsUsed = RectangleUtils.area(new Rectangle(upperLeftCorner, lowerRightCorner));
    return numberOfCellsUsed;
  }

  // Convert an Excel column name (a string of alphabetical charcaters) into a number.
  function column_name_to_index(name: string): number {
    if (name.length === 1) {
      // optimizing for the overwhelmingly common case
      return name[0].charCodeAt(0) - "A".charCodeAt(0) + 1;
    }
    let value = 0;
    const split_name = name.split("");
    for (const i of split_name) {
      value *= 26;
      value += i.charCodeAt(0) - "A".charCodeAt(0) + 1;
    }
    return value;
  }

  // Convert a column number to a name (as in, 3 => 'C').
  function column_index_to_name(index: number): string {
    let str = "";
    while (index > 0) {
      str += String.fromCharCode(((index - 1) % 26) + 65); // 65 = 'A'
      index = Math.floor((index - 1) / 26);
    }
    return str.split("").reverse().join("");
  }

  // Returns a vector (x, y) corresponding to the column and row of the computed dependency.
  function cell_dependency(cell: string, origin_col: number, origin_row: number): ExceLintVector {
    const alwaysReturnAdjustedColRow = false;
    {
      const r = DeadCode.cell_both_absolute.exec(cell);
      if (r) {
        const col = DeadCode.column_name_to_index(r[1]);
        let row = Number(r[2]);
        if (r[2][0] >= "\u2000") {
          row = Number(r[2].charCodeAt(0) - 16384);
        }
        if (alwaysReturnAdjustedColRow) {
          return new ExceLintVector(col - origin_col, row - origin_row, 0);
        } else {
          return new ExceLintVector(col, row, 0);
        }
      }
    }

    {
      const r = DeadCode.cell_col_absolute.exec(cell);
      if (r) {
        const col = DeadCode.column_name_to_index(r[1]);
        let row = Number(r[2]);
        if (r[2][0] >= "\u2000") {
          row = Number(r[2].charCodeAt(0) - 16384);
        }
        if (alwaysReturnAdjustedColRow) {
          return new ExceLintVector(col, row, 0);
        } else {
          return new ExceLintVector(col, row - origin_row, 0);
        }
      }
    }

    {
      const r = DeadCode.cell_row_absolute.exec(cell);
      if (r) {
        const col = DeadCode.column_name_to_index(r[1]);
        let row = Number(r[2]);
        if (r[2][0] >= "\u2000") {
          row = Number(r[2].charCodeAt(0) - 16384);
        }
        if (alwaysReturnAdjustedColRow) {
          return new ExceLintVector(col, row, 0);
        } else {
          return new ExceLintVector(col - origin_col, row, 0);
        }
      }
    }

    {
      const r = DeadCode.cell_both_relative.exec(cell);
      if (r) {
        const col = DeadCode.column_name_to_index(r[1]);
        let row = Number(r[2]);
        if (r[2][0] >= "\u2000") {
          row = Number(r[2].charCodeAt(0) - 16384);
        }
        if (alwaysReturnAdjustedColRow) {
          return new ExceLintVector(col, row, 0);
        } else {
          return new ExceLintVector(col - origin_col, row - origin_row, 0);
        }
      }
    }

    console.log("cell is " + cell + ", origin_col = " + origin_col + ", origin_row = " + origin_row);
    throw new Error("We should never get here.");
  }

  function toR1C1(srcCell: string, destCell: string, greek = false): string {
    // Dependencies are column, then row.
    const vec1 = DeadCode.cell_dependency(srcCell, 0, 0);
    const vec2 = DeadCode.cell_dependency(destCell, 0, 0);
    let R = "R";
    let C = "C";
    if (greek) {
      // We use this encoding to avoid confusion with, say, "C1", downstream.
      R = "ρ";
      C = "γ";
    }
    // Compute the difference.
    const resultVec = vec2.subtract(vec1);
    // Now generate the R1C1 notation version, which varies
    // depending whether it's a relative or absolute reference.
    let resultStr = "";
    if (DeadCode.cell_both_absolute.exec(destCell)) {
      resultStr = R + vec2.y + C + vec2.x;
    } else if (DeadCode.cell_col_absolute.exec(destCell)) {
      if (resultVec.y === 0) {
        resultStr += R;
      } else {
        resultStr += R + "[" + resultVec.y + "]";
      }
      resultStr += C + vec2.x;
    } else if (DeadCode.cell_row_absolute.exec(destCell)) {
      if (resultVec.x === 0) {
        resultStr += C;
      } else {
        resultStr += C + "[" + resultVec.x + "]";
      }
      resultStr = R + vec2.y + resultStr;
    } else {
      // Common case, both relative.
      if (resultVec.y === 0) {
        resultStr += R;
      } else {
        resultStr += R + "[" + resultVec.y + "]";
      }
      if (resultVec.x === 0) {
        resultStr += C;
      } else {
        resultStr += C + "[" + resultVec.x + "]";
      }
    }
    return resultStr;
  }

  function extract_sheet_cell(str: string): Array<string> {
    //	console.log("extract_sheet_cell " + str);
    const matched = DeadCode.sheet_plus_cell.exec(str);
    if (matched) {
      //	    console.log("extract_sheet_cell matched " + str);
      // There is only one thing to match for this pattern: we convert it into a range.
      return [matched[1], matched[2], matched[2]];
    }
    //	console.log("extract_sheet_cell failed for "+str);
    return ["", "", ""];
  }

  function extract_sheet_range(str: string): Array<string> {
    const matched = DeadCode.sheet_plus_range.exec(str);
    if (matched) {
      //	    console.log("extract_sheet_range matched " + str);
      return [matched[1], matched[2], matched[3]];
    }
    //	console.log("extract_sheet_range failed to match " + str);
    return DeadCode.extract_sheet_cell(str);
  }

  function make_range_string(theRange: Array<ExceLintVector>): string {
    const r = theRange;
    const col0 = r[0].x;
    const row0 = r[0].y;
    const col1 = r[1].x;
    const row1 = r[1].y;

    if (!r[0].isReference()) {
      // Not a real dependency. Skip.
      console.log("NOT A REAL DEPENDENCY: " + col1 + "," + row1);
      return "";
    } else if (col0 < 0 || row0 < 0 || col1 < 0 || row1 < 0) {
      // Defensive programming.
      console.log("WARNING: FOUND NEGATIVE VALUES.");
      return "";
    } else {
      const colname0 = DeadCode.column_index_to_name(col0);
      const colname1 = DeadCode.column_index_to_name(col1);
      //		    console.log("process: about to get range " + colname0 + row0 + ":" + colname1 + row1);
      const rangeStr = colname0 + row0 + ":" + colname1 + row1;
      return rangeStr;
    }
  }

  function all_dependencies(
    row: number,
    col: number,
    origin_row: number,
    origin_col: number,
    formulas: Spreadsheet
  ): ExceLintVector[] {
    // Discard references to cells outside the formula range.
    if (row >= formulas.length || col >= formulas[0].length || row < 0 || col < 0) {
      return [];
    }

    // Check if this cell is a formula.
    const cell = formulas[row][col];
    if (cell.length > 1 && cell[0] === "=") {
      // It is. Compute the dependencies.
      return ExcelUtils.all_cell_dependencies(cell, origin_col, origin_row);
    } else {
      return [];
    }
  }

  // This function returns a dictionary (Dict<boolean>)) of all of the addresses
  // that are referenced by some formula, where the key is the address and the
  // value is always the boolean true.
  function generate_all_references(formulas: Spreadsheet, origin_col: number, origin_row: number): Dictionary<boolean> {
    // initialize dictionary
    const _d = new Dictionary<boolean>();

    let counter = 0;
    for (let i = 0; i < formulas.length; i++) {
      const row = formulas[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        counter++;
        if (counter % 1000 === 0) {
          //		    console.log(counter + " references down");
        }

        if (cell[0] === "=") {
          // It's a formula.
          const direct_refs = ExcelUtils.all_cell_dependencies(cell, 0, 0); // origin_col, origin_row); // was just 0,0....  origin_col, origin_row);
          for (const dep of direct_refs) {
            if (!dep.isReference()) {
              // Not a real reference. Skip.
            } else {
              // Check to see if this is data or a formula.
              // If it's not a formula, add it.
              const rowIndex = dep.x - origin_col - 1;
              const colIndex = dep.y - origin_row - 1;
              const outsideFormulaRange =
                colIndex >= formulas.length || rowIndex >= formulas[0].length || rowIndex < 0 || colIndex < 0;
              let addReference = false;
              if (outsideFormulaRange) {
                addReference = true;
              } else {
                // Only include non-formulas (if they are in the range).
                const referentCell = formulas[colIndex][rowIndex];
                if (referentCell !== undefined && referentCell[0] !== "=") {
                  addReference = true;
                }
              }
              if (addReference) {
                _d.put(dep.asKey(), true);
              }
            }
          }
        }
      }
    }
    return _d;
  }

  export const range_pair = new RegExp("(" + DeadCode.general_re + "):(" + DeadCode.general_re + ")", "g");

  export function numeric_constants(range: string): number[] {
    const numbers: number[] = [];
    range = range.slice();
    if (typeof range !== "string") {
      return numbers;
    }

    // Zap all the formulas with the below characteristics.
    range = range.replace(this.formulas_with_numbers, "_"); // Don't track these.
    range = range.replace(this.formulas_with_quoted_sheetnames_2, "_");
    range = range.replace(this.formulas_with_quoted_sheetnames_1, "_");
    range = range.replace(this.formulas_with_unquoted_sheetnames_2, "_");
    range = range.replace(this.formulas_with_unquoted_sheetnames_1, "_");
    range = range.replace(this.formulas_with_unquoted_sheetnames_1, "_");
    range = range.replace(this.formulas_with_structured_references, "_");

    // First, get all the range pairs out.
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      const found_pair = ExcelUtils.range_pair.exec(range);
      if (found_pair) {
        // Wipe out the matched contents of range.
        range = range.replace(found_pair[0], "_");
      } else {
        break;
      }
    }

    // Now look for singletons.
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      const singleton = ExcelUtils.single_dep.exec(range);
      if (singleton) {
        // Wipe out the matched contents of range.
        range = range.replace(singleton[0], "_");
      } else {
        break;
      }
    }

    // Now aggregate total numeric constants (sum them).
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      const number = ExcelUtils.number_dep.exec(range);
      if (number) {
        numbers.push(parseFloat(number[0]));
        // Wipe out the matched contents of range.
        range = range.replace(number[0], "_");
      } else {
        break;
      }
    }
    return numbers; // total;
  }

  export function formulaToR1C1(formula: string, origin_col: number, origin_row: number): string {
    let range = formula.slice();
    const origin = ExcelUtils.column_index_to_name(origin_col) + origin_row;
    // First, get all the range pairs out.
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      const found_pair = ExcelUtils.range_pair.exec(range);
      if (found_pair) {
        range = range.replace(
          found_pair[0],
          ExcelUtils.toR1C1(origin, found_pair[1], true) + ":" + ExcelUtils.toR1C1(origin, found_pair[2], true)
        );
      } else {
        break;
      }
    }

    // Now look for singletons.
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      const singleton = ExcelUtils.single_dep.exec(range);
      if (singleton) {
        const first_cell = singleton[1];
        range = range.replace(singleton[0], ExcelUtils.toR1C1(origin, first_cell, true));
      } else {
        break;
      }
    }
    // Now, we de-greek.
    range = range.replace(/ρ/g, "R");
    range = range.replace(/γ/g, "C");

    return range;
  }
}
