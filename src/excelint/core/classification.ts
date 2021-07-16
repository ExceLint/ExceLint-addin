import * as XLNT from "./ExceLintTypes";
import { Config } from "./config";

declare var console: Console;

/**
 * A polyfill for Array.includes. Uses the `===` operator
 * to test equality.
 * @param arr The array to search.
 * @param t The element to search for.
 * @returns True iff the array contains the given element.
 */
function includes<T>(arr: T[], t: T): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === t) {
      return true;
    }
  }
  return false;
}

export class Classification {
  // Checks for "fat" fixes (that result in more than a single row or single column).
  private static isFatFix(fix: XLNT.ProposedFix): boolean {
    let sameRow = false;
    let sameColumn = false;
    {
      const fixColumn = XLNT.upperleft(fix.rect1).x;
      if (
        XLNT.bottomright(fix.rect1).x === fixColumn &&
        XLNT.upperleft(fix.rect2).x === fixColumn &&
        XLNT.bottomright(fix.rect2).x === fixColumn
      ) {
        sameColumn = true;
      }
      const fixRow = XLNT.upperleft(fix.rect1).y;
      if (
        XLNT.bottomright(fix.rect1).y === fixRow &&
        XLNT.upperleft(fix.rect2).y === fixRow &&
        XLNT.bottomright(fix.rect2).y === fixRow
      ) {
        sameRow = true;
      }
      return !sameColumn && !sameRow;
    }
  }

  // Checks for recurrent formula fixes
  // NOTE: not sure if this is working currently
  private static isRecurrentFormula(rect_info: XLNT.RectInfo[], direction_is_vert: boolean): boolean {
    const rect_dependencies = rect_info.map((ri) => ri.dependencies);
    for (let rect = 0; rect < rect_dependencies.length; rect++) {
      // get the dependencies for this fix rectangle
      const dependencies = rect_dependencies[rect];
      // If any part of any of a rectangle's dependence vectors "points backward," the formula
      // is recurrent.
      for (let i = 0; i < dependencies.length; i++) {
        if (direction_is_vert && dependencies[i].x === 0 && dependencies[i].y === -1) {
          return true;
        }
        if (!direction_is_vert && dependencies[i].x === -1 && dependencies[i].y === 0) {
          return true;
        }
      }
    }
    return false;
  }

  // Checks whether rectangles in fix have different refcounts
  private static hasDifferingRefcounts(rect_info: XLNT.RectInfo[]): boolean {
    const dependence_count = rect_info.map((ri) => ri.dependence_count);
    // Different number of referents (dependencies).
    return dependence_count[0] !== dependence_count[1];
  }

  // Checks whether one formula has one more constant than the other
  private static hasOneExtraConstant(rect_info: XLNT.RectInfo[]): boolean {
    const constants = rect_info.map((ri) => ri.constants);
    return constants[0].length !== constants[1].length && Math.abs(constants[0].length - constants[1].length) === 1;
  }

  // Checks whether one formula has one more constant than the other
  private static numberOfConstantsMismatch(rect_info: XLNT.RectInfo[]): boolean {
    const constants = rect_info.map((ri) => ri.constants);
    return constants[0].length !== constants[1].length && !(Math.abs(constants[0].length - constants[1].length) === 1);
  }

  // Checks whether both rectangles in a fix are constant-only
  private static bothConstantOnly(rect_info: XLNT.RectInfo[]): boolean {
    const rect1 = rect_info[0];
    const rect2 = rect_info[1];

    // both have constants and neither have any other dependencies
    return (
      rect1.constants.length > 0 && rect2.constants.length > 0 && rect1.dependence_count + rect2.dependence_count === 0
    );
  }

  // Checks whether only one rectangle is constant-only
  private static onlyOneIsConstantOnly(rect_info: XLNT.RectInfo[]): boolean {
    const rect1 = rect_info[0];
    const rect2 = rect_info[1];

    // exactly one has constants and no other dependencies
    return (
      (rect1.constants.length > 0 && rect1.dependence_count === 0) ||
      (rect2.constants.length > 0 && rect2.dependence_count === 0)
    );
  }

  // Checks whether formulas have different R1C1 representations but
  // induce the same set of dependencies.
  private static hasR1C1Mismatch(rect_info: XLNT.RectInfo[]): boolean {
    const rect1 = rect_info[0];
    const rect2 = rect_info[1];

    // If the formulas don't match, it could
    // be because of the presence of (possibly
    // different) constants instead of the
    // dependencies being different, so augment
    // with a deep comparison.
    return (
      rect1.r1c1_formula !== rect2.r1c1_formula &&
      !XLNT.ExceLintVector.vectorSetEquals(rect1.dependencies, rect2.dependencies)
    );
  }

  // Checks that the number of absolute references is the same.
  private static absoluteRefMismatch(rect_info: XLNT.RectInfo[]) {
    return rect_info[0].absolute_refcount !== rect_info[1].absolute_refcount;
  }

  // Checks for off-axis reference
  private static offAxisReference(rect_info: XLNT.RectInfo[]) {
    const all_dependencies = rect_info.map((ri) => ri.dependencies);

    for (let rect = 0; rect < all_dependencies.length; rect++) {
      // if both x and y offsets are not zero, their product will not be zero;
      // this is an "off-axis" reference.
      if (all_dependencies[rect].length > 0 && all_dependencies[rect][0].x * all_dependencies[rect][0].y !== 0) {
        return true;
      }
    }
    return false;
  }

  // Apply some labels to fixes based on their structural properties.
  public static classifyFixes(
    fix: XLNT.ProposedFix,
    direction_is_vert: boolean,
    rect_info: XLNT.RectInfo[]
  ): Classification.BinCategory[] {
    // Binning.
    let bin: Classification.BinCategory[] = [];

    // Check for "fat" fix.
    if (Classification.isFatFix(fix)) bin.push(Classification.BinCategory.FatFix);

    // Check for recurrent formulas.
    if (Classification.isRecurrentFormula(rect_info, direction_is_vert))
      bin.push(Classification.BinCategory.RecurrentFormula);

    // Check for differing refcounts.
    if (Classification.hasDifferingRefcounts(rect_info)) bin.push(Classification.BinCategory.DifferentReferentCount);

    // Check for one extra constant.
    if (Classification.hasOneExtraConstant(rect_info)) bin.push(Classification.BinCategory.OneExtraConstant);

    // Check that there isn't a mismatch in constant counts
    // (excluding "one extra constant").
    if (Classification.numberOfConstantsMismatch(rect_info))
      bin.push(Classification.BinCategory.NumberOfConstantsMismatch);

    // Check whether both formulas are constants-only.
    if (Classification.bothConstantOnly(rect_info)) bin.push(Classification.BinCategory.BothConstants);

    // Check whether exactly one formula is constant-only.
    if (Classification.onlyOneIsConstantOnly(rect_info)) bin.push(Classification.BinCategory.OneIsAllConstants);

    // Check for mismatched R1C1 representation.
    if (Classification.hasR1C1Mismatch(rect_info)) bin.push(Classification.BinCategory.R1C1Mismatch);

    // Different number of absolute ($, a.k.a. "anchor") references.
    if (Classification.absoluteRefMismatch(rect_info)) bin.push(Classification.BinCategory.AbsoluteRefMismatch);

    // Dependencies that are neither vertical or horizontal
    // (likely errors if there is also an absolute-ref-mismatch).
    if (Classification.offAxisReference(rect_info)) bin.push(Classification.BinCategory.OffAxisReference);

    // If no predicates were triggered, classify this as "unclassified"
    if (bin.length == 0) bin.push(Classification.BinCategory.Unclassified);

    return bin;
  }

  // In case there's more than one classification, prune some by priority (best explanation).
  public static pruneFixes(bin: Classification.BinCategory[]): Classification.BinCategory[] {
    if (includes(bin, Classification.BinCategory.OneIsAllConstants)) {
      return [Classification.BinCategory.OneIsAllConstants];
    }
    return bin;
  }

  // Should we omit some fixes depending on the user configuration?
  public static omitFixes(bin: Classification.BinCategory[], rect_info: XLNT.RectInfo[], beVerbose: boolean): boolean {
    const print_formulas = rect_info.map((ri) => ri.formula);

    if (
      bin.length > Config.maxCategories || // Too many categories
      (bin.indexOf(Classification.BinCategory.FatFix) !== -1 && Config.suppressFatFix) ||
      (bin.indexOf(Classification.BinCategory.DifferentReferentCount) !== -1 &&
        Config.suppressDifferentReferentCount) ||
      (bin.indexOf(Classification.BinCategory.RecurrentFormula) !== -1 && Config.suppressRecurrentFormula) ||
      (bin.indexOf(Classification.BinCategory.OneExtraConstant) !== -1 && Config.suppressOneExtraConstant) ||
      (bin.indexOf(Classification.BinCategory.NumberOfConstantsMismatch) != -1 &&
        Config.suppressNumberOfConstantsMismatch) ||
      (bin.indexOf(Classification.BinCategory.BothConstants) !== -1 && Config.suppressBothConstants) ||
      (bin.indexOf(Classification.BinCategory.OneIsAllConstants) !== -1 && Config.suppressOneIsAllConstants) ||
      (bin.indexOf(Classification.BinCategory.R1C1Mismatch) !== -1 && Config.suppressR1C1Mismatch) ||
      (bin.indexOf(Classification.BinCategory.AbsoluteRefMismatch) !== -1 && Config.suppressAbsoluteRefMismatch) ||
      (bin.indexOf(Classification.BinCategory.OffAxisReference) !== -1 && Config.suppressOffAxisReference)
    ) {
      if (beVerbose) console.warn("Omitted " + JSON.stringify(print_formulas) + "(" + JSON.stringify(bin) + ")");
      return true;
    } else {
      if (beVerbose) console.warn("NOT omitted " + JSON.stringify(print_formulas) + "(" + JSON.stringify(bin) + ")");
      return false;
    }
  }
}

export namespace Classification {
  export enum BinCategory {
    FatFix = "Inconsistent multiple columns/rows", // fix is not a single column or single row
    RecurrentFormula = "Formula(s) refer to each other", // formulas refer to each other
    OneExtraConstant = "Formula(s) with an extra constant", // one has no constant and the other has one constant
    NumberOfConstantsMismatch = "Formulas have different number of constants", // both have constants but not the same number of constants
    BothConstants = "All constants, but different values", // both have only constants but differ in numeric value
    OneIsAllConstants = "Mix of constants and formulas", // one is entirely constants and other is formula
    AbsoluteRefMismatch = "Mix of absolute ($) and regular references", // relative vs. absolute mismatch
    OffAxisReference = "References refer to different rows/columns", // references refer to different columns or rows
    R1C1Mismatch = "Refers to different ranges", // different R1C1 representations
    DifferentReferentCount = "Formula ranges are of different sizes", // ranges have different number of referents
    // Not yet implemented.
    RefersToEmptyCells = "Formulas refer to empty cells",
    UsesDifferentOperations = "Formulas use different functions", // e.g. SUM vs. AVERAGE
    // Fall-through category
    Unclassified = "unclassified",
  }
}
