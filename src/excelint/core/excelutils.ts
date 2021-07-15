// excel-utils
// Emery Berger, Microsoft Research / UMass Amherst (https://emeryberger.com)
// Daniel W. Barowy, Microsoft Research / Williams College

import { RectangleUtils } from "./rectangleutils";
import { ExceLintVector, Dictionary, Spreadsheet, Range, Address, Rectangle } from "./ExceLintTypes";
import { Paraformula } from "../paraformula/src/paraformula";
import { AST } from "../paraformula/src/ast";

declare var console: Console;

export class ExcelUtils {
  // sort routine
  static readonly ColumnSort = (a: ExceLintVector, b: ExceLintVector) => {
    if (a.x === b.x) {
      return a.y - b.y;
    } else {
      return a.x - b.x;
    }
  };

  // Matchers for all kinds of Excel expressions.
  private static general_re = "\\$?[A-Z][A-Z]?\\$?[\\d\\u2000-\\u6000]+"; // column and row number, optionally with $
  private static sheet_re = "[^\\!]+";
  private static sheet_plus_cell = new RegExp("(" + ExcelUtils.sheet_re + ")\\!(" + ExcelUtils.general_re + ")");
  private static sheet_plus_range = new RegExp(
    "(" + ExcelUtils.sheet_re + ")\\!(" + ExcelUtils.general_re + "):(" + ExcelUtils.general_re + ")"
  );
  public static single_dep = new RegExp("(" + ExcelUtils.general_re + ")");
  public static range_pair = new RegExp("(" + ExcelUtils.general_re + "):(" + ExcelUtils.general_re + ")", "g");
  private static number_dep = new RegExp("([0-9]+\\.?[0-9]*)");
  public static cell_both_relative = new RegExp("[^\\$A-Z]?([A-Z][A-Z]?)([\\d\\u2000-\\u6000]+)");
  public static cell_col_absolute = new RegExp("\\$([A-Z][A-Z]?)([\\d\\u2000-\\u6000]+)");
  public static cell_row_absolute = new RegExp("[^\\$A-Z]?([A-Z][A-Z]?)\\$([\\d\\u2000-\\u6000]+)");
  public static cell_both_absolute = new RegExp("\\$([A-Z][A-Z]?)\\$([\\d\\u2000-\\u6000]+)");

  // We need to filter out all formulas with these characteristics so they don't mess with our dependency regexps.

  private static formulas_with_numbers = new RegExp(
    "/ATAN2|BIN2DEC|BIN2HEX|BIN2OCT|DAYS360|DEC2BIN|DEC2HEX|DEC2OCT|HEX2BIN|HEX2DEC|HEX2OCT|IMLOG2|IMLOG10|LOG10|OCT2BIN|OCT2DEC|OCT2HEX|SUNX2MY2|SUMX2PY2|SUMXMY2|T.DIST.2T|T.INV.2T/",
    "g"
  );
  // Same with sheet name references.
  private static formulas_with_quoted_sheetnames_1 = new RegExp("'[^']*'!" + "\\$?[A-Z][A-Z]?\\$?\\d+", "g");
  private static formulas_with_quoted_sheetnames_2 = new RegExp(
    "'[^']*'!" + "\\$?[A-Z][A-Z]?\\$?\\d+" + ":" + "\\$?[A-Z][A-Z]?\\$?\\d+",
    "g"
  );
  private static formulas_with_unquoted_sheetnames_1 = new RegExp("[A-Za-z0-9]+!" + "\\$?[A-Z][A-Z]?\\$?\\d+", "g");
  private static formulas_with_unquoted_sheetnames_2 = new RegExp(
    "[A-Za-z0-9]+!" + "\\$?[A-Z][A-Z]?\\$?\\d+" + ":" + "\\$?[A-Z][A-Z]?\\$?\\d+",
    "g"
  );
  private static formulas_with_structured_references = new RegExp("\\[([^\\]])*\\]", "g");

  // Take a range string and compute the number of cells.
  public static get_number_of_cells(address: string): number {
    // Compute the number of cells in the range "usedRange".
    const usedRangeAddresses = ExcelUtils.extract_sheet_range(address);
    const upperLeftCorner = ExcelUtils.cell_dependency(usedRangeAddresses[1], 0, 0);
    const lowerRightCorner = ExcelUtils.cell_dependency(usedRangeAddresses[2], 0, 0);
    const numberOfCellsUsed = RectangleUtils.area(new Rectangle(upperLeftCorner, lowerRightCorner));
    return numberOfCellsUsed;
  }

  // Convert an Excel column name (a string of alphabetical charcaters) into a number.
  public static column_name_to_index(name: string): number {
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
  public static column_index_to_name(index: number): string {
    let str = "";
    while (index > 0) {
      str += String.fromCharCode(((index - 1) % 26) + 65); // 65 = 'A'
      index = Math.floor((index - 1) / 26);
    }
    return str.split("").reverse().join("");
  }

  // Returns a vector (x, y) corresponding to the column and row of the computed dependency.
  public static cell_dependency(cell: string, origin_col: number, origin_row: number): ExceLintVector {
    const alwaysReturnAdjustedColRow = false;
    {
      const r = ExcelUtils.cell_both_absolute.exec(cell);
      if (r) {
        const col = ExcelUtils.column_name_to_index(r[1]);
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
      const r = ExcelUtils.cell_col_absolute.exec(cell);
      if (r) {
        const col = ExcelUtils.column_name_to_index(r[1]);
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
      const r = ExcelUtils.cell_row_absolute.exec(cell);
      if (r) {
        const col = ExcelUtils.column_name_to_index(r[1]);
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
      const r = ExcelUtils.cell_both_relative.exec(cell);
      if (r) {
        const col = ExcelUtils.column_name_to_index(r[1]);
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

  public static toR1C1(srcCell: string, destCell: string, greek = false): string {
    // Dependencies are column, then row.
    const vec1 = ExcelUtils.cell_dependency(srcCell, 0, 0);
    const vec2 = ExcelUtils.cell_dependency(destCell, 0, 0);
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
    if (ExcelUtils.cell_both_absolute.exec(destCell)) {
      resultStr = R + vec2.y + C + vec2.x;
    } else if (ExcelUtils.cell_col_absolute.exec(destCell)) {
      if (resultVec.y === 0) {
        resultStr += R;
      } else {
        resultStr += R + "[" + resultVec.y + "]";
      }
      resultStr += C + vec2.x;
    } else if (ExcelUtils.cell_row_absolute.exec(destCell)) {
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

  public static formulaToR1C1(formula: string, origin_col: number, origin_row: number): string {
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

  public static extract_sheet_cell(str: string): Array<string> {
    //	console.log("extract_sheet_cell " + str);
    const matched = ExcelUtils.sheet_plus_cell.exec(str);
    if (matched) {
      //	    console.log("extract_sheet_cell matched " + str);
      // There is only one thing to match for this pattern: we convert it into a range.
      return [matched[1], matched[2], matched[2]];
    }
    //	console.log("extract_sheet_cell failed for "+str);
    return ["", "", ""];
  }

  public static extract_sheet_range(str: string): Array<string> {
    const matched = ExcelUtils.sheet_plus_range.exec(str);
    if (matched) {
      //	    console.log("extract_sheet_range matched " + str);
      return [matched[1], matched[2], matched[3]];
    }
    //	console.log("extract_sheet_range failed to match " + str);
    return ExcelUtils.extract_sheet_cell(str);
  }

  public static make_range_string(theRange: Array<ExceLintVector>): string {
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
      const colname0 = ExcelUtils.column_index_to_name(col0);
      const colname1 = ExcelUtils.column_index_to_name(col1);
      //		    console.log("process: about to get range " + colname0 + row0 + ":" + colname1 + row1);
      const rangeStr = colname0 + row0 + ":" + colname1 + row1;
      return rangeStr;
    }
  }

  /**
   * Extracts all address subexpressions in a given formula AST.
   * @param ast
   */
  public static cellRefs(ast: AST.Expression): AST.Address[] {
    switch (ast.type) {
      case AST.ReferenceRange.type:
        return [];
      case AST.ReferenceAddress.type:
        return [ast.address];
      case AST.ReferenceNamed.type:
        return [];
      case AST.FunctionApplication.type:
        return ast.args.map((a) => ExcelUtils.cellRefs(a)).reduce((acc, addrs) => acc.concat(addrs));
      case AST.Number.type:
        return [];
      case AST.StringLiteral.type:
        return [];
      case AST.Boolean.type:
        return [];
      case AST.BinOpExpr.type:
        return ExcelUtils.cellRefs(ast.exprL).concat(ExcelUtils.cellRefs(ast.exprR));
      case AST.UnaryOpExpr.type:
        return ExcelUtils.cellRefs(ast.expr);
      case AST.ParensExpr.type:
        return ExcelUtils.cellRefs(ast.expr);
    }
  }

  /**
   * Extracts all range subexpressions in a given formula AST.
   * @param ast
   */
  public static rangeRefs(ast: AST.Expression): AST.Range[] {
    switch (ast.type) {
      case AST.ReferenceRange.type:
        return [ast.rng];
      case AST.ReferenceAddress.type:
        return [];
      case AST.ReferenceNamed.type:
        return [];
      case AST.FunctionApplication.type:
        return ast.args.map((a) => ExcelUtils.rangeRefs(a)).reduce((acc, addrs) => acc.concat(addrs));
      case AST.Number.type:
        return [];
      case AST.StringLiteral.type:
        return [];
      case AST.Boolean.type:
        return [];
      case AST.BinOpExpr.type:
        return ExcelUtils.rangeRefs(ast.exprL).concat(ExcelUtils.rangeRefs(ast.exprR));
      case AST.UnaryOpExpr.type:
        return ExcelUtils.rangeRefs(ast.expr);
      case AST.ParensExpr.type:
        return ExcelUtils.rangeRefs(ast.expr);
    }
  }

  /**
   * Extracts all constant literals in a given formula AST.
   * @param ast
   */
  public static constants(ast: AST.Expression): number[] {
    switch (ast.type) {
      case AST.ReferenceRange.type:
        return [];
      case AST.ReferenceAddress.type:
        return [];
      case AST.ReferenceNamed.type:
        return [];
      case AST.FunctionApplication.type:
        return ast.args.map((a) => ExcelUtils.constants(a)).reduce((acc, addrs) => acc.concat(addrs));
      case AST.Number.type:
        return [ast.value];
      case AST.StringLiteral.type:
        return [];
      case AST.Boolean.type:
        return [];
      case AST.BinOpExpr.type:
        return ExcelUtils.constants(ast.exprL).concat(ExcelUtils.constants(ast.exprR));
      case AST.UnaryOpExpr.type:
        return ExcelUtils.constants(ast.expr);
      case AST.ParensExpr.type:
        return ExcelUtils.constants(ast.expr);
    }
  }

  // public static addressToVector(origin_x: number, origin_y: number, addr: AST.Address): ExceLintVector {
  //   const dx = addr.column - origin_x;
  //   const dy = addr.row - origin_y;
  //   return new ExceLintVector(dx, dy, 0);
  // }

  /**
   * Get the vector from the given address.
   * @param origin_x 1-based column of the formula making the reference.
   * @param origin_y 1-based row of the formula making the reference.
   * @param aexpr A parsed address reference.
   */
  public static getRefVectorsFromAddress(origin_x: number, origin_y: number, aexpr: AST.Address): ExceLintVector {
    const dx = aexpr.colMode === AST.RelativeAddress ? aexpr.column - origin_x : origin_x;
    const dy = aexpr.colMode === AST.RelativeAddress ? aexpr.row - origin_y : origin_y;
    return new ExceLintVector(dx, dy, 0);
  }

  /**
   * Get a set of vectors from the given range.
   * @param origin_x 1-based column of the formula making the reference.
   * @param origin_y 1-based row of the formula making the reference.
   * @param rng The range.
   * @returns An array of ExceLintVectors.
   */
  public static getRefVectorsFromRange(origin_x: number, origin_y: number, rng: AST.Range): ExceLintVector[] {
    return rng.regions
      .map(([tl, br]) => {
        const tlv = new ExceLintVector(tl.column, tl.row, 0);
        const brv = new ExceLintVector(br.column, br.row, 0);
        const r = new Rectangle(tlv, brv);
        const vs = r.expand();
        return vs.map((v) => new ExceLintVector(v.x - origin_x, v.y - origin_y, 0));
      })
      .reduce((acc, arr) => acc.concat(arr));
  }

  /**
   * Returns all dependencies for the given formula string, one
   * ExceLintVector per cell reference.  If `include_numbers` is
   * `true`, includes constant vectors in output.
   * @param formula
   * @param origin_x
   * @param origin_y
   * @param include_numbers
   * @returns
   */
  public static all_dependencies2(
    formula: string,
    origin_x: number,
    origin_y: number,
    include_numbers = true
  ): ExceLintVector[] {
    try {
      // parse formula
      const ast = Paraformula.parse(formula);

      // extract various kinds of references
      const cellDeps = ExcelUtils.cellRefs(ast);
      const rngDeps = ExcelUtils.rangeRefs(ast);
      const cnstDeps = include_numbers ? ExcelUtils.constants(ast) : [];

      // convert references into vectors
      const cellVects = cellDeps.map((addr) => ExcelUtils.getRefVectorsFromAddress(origin_x, origin_y, addr));
      const rngVects = rngDeps
        .map((rng) => ExcelUtils.getRefVectorsFromRange(origin_x, origin_y, rng))
        .reduce((acc, arr) => acc.concat(arr));
      /* eslint-disable-next-line no-unused-vars */
      const cnstVects = cnstDeps.map((_c) => new ExceLintVector(0, 0, 1));

      // combine all vectors and return
      return cellVects.concat(rngVects, cnstVects);
    } catch (error) {
      console.warn("Cannot parse formula: '" + formula + "'");
      return [];
    }
  }

  public static all_cell_dependencies(
    range: string,
    origin_col: number,
    origin_row: number,
    include_numbers = true
  ): ExceLintVector[] {
    const all_vectors: ExceLintVector[] = [];

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
      const found_pair = ExcelUtils.range_pair.exec(range);
      if (found_pair) {
        const first_cell = found_pair[1];
        const first_vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
        const last_cell = found_pair[2];
        const last_vec = ExcelUtils.cell_dependency(last_cell, origin_col, origin_row);

        // First_vec is the upper-left hand side of a rectangle.
        // Last_vec is the lower-right hand side of a rectangle.

        // Generate all vectors.
        const length = last_vec.x - first_vec.x + 1;
        const width = last_vec.y - first_vec.y + 1;
        for (let x = 0; x < length; x++) {
          for (let y = 0; y < width; y++) {
            all_vectors.push(new ExceLintVector(x + first_vec.x, y + first_vec.y, 0));
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
      const singleton = ExcelUtils.single_dep.exec(range);
      if (singleton) {
        const first_cell = singleton[1];
        const vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
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
        const number = ExcelUtils.number_dep.exec(range);
        if (number) {
          all_vectors.push(new ExceLintVector(0, 0, 1)); // just add 1 for every number
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

  public static numeric_constants(range: string): number[] {
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

  public static all_dependencies(
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
  public static generate_all_references(
    formulas: Spreadsheet,
    origin_col: number,
    origin_row: number
  ): Dictionary<boolean> {
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

  /**
   * Converts an A1 range reference string into an R1C1 range object.
   * @param a1rng An A1 range string.
   */
  public static rngA1toR1C1(a1rng: string): Range {
    // split by sheet name, then split by colon
    const parts = a1rng.split("!");
    const sheet = parts[0];
    const addrs = parts[1];
    const addrSpl = addrs.split(":");
    const addr1 = sheet + "!" + addrSpl[0];
    // if, after splitting on the colon, we only have one element,
    // then we were given a singleton range, so duplicate aadr1
    const addr2 = addrSpl.length == 1 ? addr1 : sheet + "!" + addrSpl[1];
    const r1c1_1 = ExcelUtils.addrA1toR1C1(addr1);
    const r1c1_2 = ExcelUtils.addrA1toR1C1(addr2);
    return new Range(r1c1_1, r1c1_2);
  }

  /**
   * Converts an A1 address string into an R1C1 address object.
   * @param a1addr An address string in A1 format
   */
  public static addrA1toR1C1(a1addr: string): Address {
    // split sheet name, remove absolute reference symbols, and
    // ensure address is uppercase
    const a1normed = a1addr.replace("$", "");
    // the cell address may or may not include a worksheet
    const aa = a1normed.split("!");
    const [sheet, addr] = aa.length === 1 ? ["", aa[0].toUpperCase()] : [aa[0], aa[1].toUpperCase()];
    let processCol = true;

    // accumulated characters go here
    const x_list: number[] = [];
    const y_list: number[] = [];

    for (let i = 0; i < addr.length; i++) {
      const c = addr.charAt(i);

      // process the column
      if (processCol) {
        const n = Number(c);
        if (!isNaN(n)) {
          // switch to processing y once we see numeric chars
          processCol = false;
        } else {
          // e.g., A = ASCII decimal 65, so A will equal 1, Z will equal 26.
          const code = c.charCodeAt(0);
          x_list.push(code - 64);
        }
      }

      // process the row
      if (!processCol) {
        // the magnitude of _y depends on how many y chars there are,
        // which we don't yet know.  Keep a count and do the math later.
        y_list.push(Number(c));
      }
    }

    // so that we can process from the least significant digit
    x_list.reverse();
    y_list.reverse();
    const col = x_list.map((t, i) => t * Math.pow(26, i)).reduce((acc, e) => acc + e, 0);
    const row = y_list.map((t, i) => t * Math.pow(10, i)).reduce((acc, e) => acc + e, 0);
    return new Address(sheet, row, col);
  }

  /**
   * Returns true if the address references a cell; otherwise false.
   * @param addr An Excel reference
   */
  public static isACell(addr: string): boolean {
    if (addr.length === 0) throw new Error("Cannot call isACell on an empty string!");
    const parts = addr.split(":");
    return parts.length === 1;
  }
}
