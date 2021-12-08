// excel-utils
// Emery Berger, Microsoft Research / UMass Amherst (https://emeryberger.com)
// Daniel W. Barowy, Microsoft Research / Williams College

import { ExceLintVector, Range, Address, Rectangle } from "./ExceLintTypes";
import { Paraformula } from "../paraformula/src/paraformula";
import { AST } from "../paraformula/src/ast";
import { flatMap, None, Some } from "./option";

declare var console: Console;

export module ExcelUtils {
  /**
   * Orders two ExceLintVectors by their column, then row.
   * @param a An ExceLintVector
   * @param b An ExceLintVector
   * @returns
   */
  export const ColumnSort = (a: ExceLintVector, b: ExceLintVector) => {
    if (a.x === b.x) {
      return a.y - b.y;
    } else {
      return a.x - b.x;
    }
  };

  /**
   * Extracts all address subexpressions in a given formula AST.
   * @param ast
   */
  export function cellRefs(ast: AST.Expression): AST.Address[] {
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
  export function rangeRefs(ast: AST.Expression): AST.Range[] {
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
  export function constants(ast: AST.Expression): number[] {
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

  // function addressToVector(origin_x: number, origin_y: number, addr: AST.Address): ExceLintVector {
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
  export function getRefVectorsFromAddress(origin_x: number, origin_y: number, aexpr: AST.Address): ExceLintVector {
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
  export function getRefVectorsFromRange(origin_x: number, origin_y: number, rng: AST.Range): ExceLintVector[] {
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
   * @param sheetOrigin The name of the sheet from which formulas are taken.
   * @param include_numbers
   * @param ignoreOffSheet Do not return references for data on a different sheet.
   * @returns
   */
  export function all_cell_dependencies(
    formula: string,
    origin_x: number,
    origin_y: number,
    sheetOrigin: string,
    include_numbers = true,
    ignoreOffSheet = true
  ): ExceLintVector[] {
    try {
      // parse formula
      const ast = Paraformula.parse(formula);

      // extract various kinds of references
      const cellDeps = ExcelUtils.cellRefs(ast);
      const rngDeps = ExcelUtils.rangeRefs(ast);
      const cnstDeps = include_numbers ? ExcelUtils.constants(ast) : [];

      // convert cell references into vectors
      const cellVects = flatMap((addr) => {
        // don't extract off-sheet references
        // Paraformula may set worksheetName to the empty string if the reference is local
        if (ignoreOffSheet && addr.worksheetName != "" && addr.worksheetName != sheetOrigin) {
          return None;
        } else {
          const refs = ExcelUtils.getRefVectorsFromAddress(origin_x, origin_y, addr);
          return new Some(refs);
        }
      }, cellDeps);

      // convert range references into vectors
      const rngVects = flatMap((rng) => {
        // don't extract off-sheet referencs
        // we assume that rng is entirely contained within one sheet
        // (PRETTY sure the language does not allow discontiguous multi-sheet ranges)
        // ditto note about Paraformula making workbook the empty string for local refs
        if (ignoreOffSheet && rng.regions[0][0].worksheetName != "" && rng.regions[0][0].worksheetName != sheetOrigin) {
          return None;
        } else {
          const refs = ExcelUtils.getRefVectorsFromRange(origin_x, origin_y, rng);
          return new Some(refs);
        }
      }, rngDeps).reduce((acc, arr) => acc.concat(arr), []);

      /* eslint-disable-next-line no-unused-vars */
      const cnstVects = cnstDeps.map((_c) => new ExceLintVector(0, 0, 1));

      // combine all vectors and return
      return cellVects.concat(rngVects, cnstVects);
    } catch (error) {
      console.warn("Cannot parse formula: '" + formula + "': " + error);
      return [];
    }
  }

  /**
   * Converts an A1 range reference string into an R1C1 range object.
   * @param a1rng An A1 range string.
   */
  export function rngA1toR1C1(a1rng: string): Range {
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
  export function addrA1toR1C1(a1addr: string): Address {
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
  export function isACell(addr: string): boolean {
    if (addr.length === 0) throw new Error("Cannot call isACell on an empty string!");
    const parts = addr.split(":");
    return parts.length === 1;
  }

  /*
   * THINGS I WOULD LIKE TO GET RID OF.
   */
}
