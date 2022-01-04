import * as XLNT from "./ExceLintTypes";
import { Analysis } from "./analysis";

export module Filters {
  export const SCORE_THRESH = 0.05;

  /* eslint-disable no-unused-vars */
  export enum FilterReason {
    userThreshold,
    notOnBoundary,
    lowScore,
    bigFix,
  }
  /* eslint-enable no-unused-vars */

  /**
   * Filter the given set of fixes by the given entropy threshold.
   * @param fixes An array of fixes.
   * @param thresh An entropy score threshold.
   */
  export function filterFixesByUserThreshold(
    fixes: XLNT.ProposedFix[],
    thresh: number,
    filterReasons: WeakMap<XLNT.ProposedFix, FilterReason[]>
  ): void {
    for (let ind = 0; ind < fixes.length; ind++) {
      const fix = fixes[ind];
      let adjusted_score = -fix.score;
      if (adjusted_score * 100 < thresh) {
        const reasons = filterReasons.get(fix);
        reasons.push(FilterReason.userThreshold);
      }
    }
  }

  /**
   * Filters out fixes that are not at a fix boundary.
   * @param addr Cell to fix
   * @param fixes An array of proposed fixes.
   */
  export function filterNonBoundaryFixes(
    addr: XLNT.Address,
    fixes: XLNT.ProposedFix[],
    filterReasons: WeakMap<XLNT.ProposedFix, FilterReason[]>
  ): void {
    for (const fix of fixes) {
      // if the address of the fix is not at a fix boundary, skip
      if (!Analysis.atDiscontinuity(addr, fix)) {
        const reasons = filterReasons.get(fix);
        reasons.push(FilterReason.notOnBoundary);
      }
    }
  }

  /**
   * Filters out fixes whose entropy reduction score is 0.
   * @param score_theshold The minimum entropy score to accept a fix.
   * @param fixes An array of proposed fixes.
   */
  export function filterLowScore(
    score_theshold: number,
    fixes: XLNT.ProposedFix[],
    filterReasons: WeakMap<XLNT.ProposedFix, FilterReason[]>
  ): void {
    for (const fix of fixes) {
      if (-fix.score < score_theshold) {
        const reasons = filterReasons.get(fix);
        reasons.push(FilterReason.lowScore);
      }
    }
  }

  /**
   * Filters out fixes from the "big" rectangle.
   * @param addr Cell to fix
   * @param fixes An array of proposed fixes.
   */
  export function filterBigFixes(
    addr: XLNT.Address,
    fixes: XLNT.ProposedFix[],
    filterReasons: WeakMap<XLNT.ProposedFix, FilterReason[]>
  ): void {
    const v = new XLNT.ExceLintVector(addr.column, addr.row, 0);
    for (const fix of fixes) {
      if (
        !(
          (fix.rect1.size < fix.rect2.size && fix.rect1.contains(v)) ||
          (fix.rect2.size < fix.rect1.size && fix.rect2.contains(v))
        )
      ) {
        const reasons = filterReasons.get(fix);
        reasons.push(FilterReason.lowScore);
      }
    }
  }

  /**
   * Applies all filters in sequence, tracking which filters have what effects.
   * Does not actually filter.  Call doFilter with output to do filtering.
   * @param fixes A set of proposed fixes.
   * @param target The cell being modified.
   * @returns A dictionary from ProposedFix reference to filter reason
   */
  export function matchFilters(
    fixes: XLNT.ProposedFix[],
    target: XLNT.Address,
    user_threshold: number
  ): WeakMap<XLNT.ProposedFix, FilterReason[]> {
    // create and initialize filter reason dictionary
    const filterReasons = new WeakMap<XLNT.ProposedFix, FilterReason[]>();
    fixes.forEach((pf) => filterReasons.set(pf, []));

    // filter fixes by user threshold
    filterFixesByUserThreshold(fixes, user_threshold, filterReasons);

    // remove fixes that are not at boundary
    filterNonBoundaryFixes(target, fixes, filterReasons);

    // remove fixes that produce only small changes in entropy
    filterLowScore(SCORE_THRESH, fixes, filterReasons);

    // remove fixes from the "big" part of a proposed fix
    filterBigFixes(target, fixes, filterReasons);

    return filterReasons;
  }

  /**
   * Returns an array of all proposed fixes that pass all filters.  A fix is kept
   * if and only if it has an empty array of FilterReasons.
   * @param pfs An array of unfiltered proposed fixes.
   * @param filtered A WeakMap from a given ProposedFix to an array of filter reasons.
   * @returns An array of filtered proposed fixes.
   */
  export function doFilter(
    pfs: XLNT.ProposedFix[],
    filtered: WeakMap<XLNT.ProposedFix, FilterReason[]>
  ): XLNT.ProposedFix[] {
    return pfs.filter((pf) => filtered.get(pf).length === 0);
  }

  // OLD STUFF: DELETE LATER
  /**
   * Filter the given set of fixes by the given entropy threshold.
   * @param fixes An array of fixes.
   * @param thresh An entropy score threshold.
   * @returns
   */
  export function OLDfilterFixesByUserThreshold(fixes: XLNT.ProposedFix[], thresh: number): XLNT.ProposedFix[] {
    const fixes2: XLNT.ProposedFix[] = [];
    for (let ind = 0; ind < fixes.length; ind++) {
      const pf = fixes[ind];
      let adjusted_score = -pf.score;
      if (adjusted_score * 100 >= thresh) {
        fixes2.push(new XLNT.ProposedFix(adjusted_score, pf.rect1, pf.rect2));
      }
    }
    return fixes2;
  }

  /**
   * Filters out fixes that are not at a fix boundary.
   * @param addr Cell to fix
   * @param fixes An array of proposed fixes.
   * @returns A filtered array of proposed fixes.
   */
  export function OLDfilterNonBoundaryFixes(addr: XLNT.Address, fixes: XLNT.ProposedFix[]) {
    const fixes_to_keep: XLNT.ProposedFix[] = [];
    for (const fix of fixes) {
      // if the address of the fix is not at a fix boundary, skip
      if (Analysis.atDiscontinuity(addr, fix)) {
        fixes_to_keep.push(fix);
      }
    }
    return fixes_to_keep;
  }

  /**
   * Filters out fixes whose entropy reduction score is 0.
   * @param score_theshold The minimum entropy score to accept a fix.
   * @param fixes An array of proposed fixes.
   * @returns A filtered array of proposed fixes.
   */
  export function OLDfilterLowScore(score_theshold: number, fixes: XLNT.ProposedFix[]): XLNT.ProposedFix[] {
    const fixes_to_keep: XLNT.ProposedFix[] = [];
    for (const fix of fixes) {
      if (fix.score >= score_theshold) {
        fixes_to_keep.push(fix);
      }
    }
    return fixes_to_keep;
  }

  /**
   * Filters out fixes from the "big" rectangle.
   * @param addr Cell to fix
   * @param fixes An array of proposed fixes.
   * @returns A filtered array of proposed fixes.
   */
  export function OLDfilterBigFixes(addr: XLNT.Address, fixes: XLNT.ProposedFix[]) {
    const v = new XLNT.ExceLintVector(addr.column, addr.row, 0);
    const fixes_to_keep: XLNT.ProposedFix[] = [];
    for (const fix of fixes) {
      if (
        (fix.rect1.size < fix.rect2.size && fix.rect1.contains(v)) ||
        (fix.rect2.size < fix.rect1.size && fix.rect2.contains(v))
      ) {
        fixes_to_keep.push(fix);
      }
    }
    return fixes_to_keep;
  }

  /**
   * Returns true iff the formula at the given address was filtered because
   * it was below the user threshold.
   * @param addr The address of a cell, as an ExceLintVector
   * @param reasond A dictionary of filter reasons, indexed by ExceLintVector address.
   * @returns True or false.
   */
  export function belowUserThreshold(
    addr: XLNT.ExceLintVector,
    reasond: XLNT.Dictionary<Filters.FilterReason[]>
  ): boolean {
    const key = addr.asKey();
    return reasond.contains(key) && reasond.get(key).includes(FilterReason.userThreshold);
  }

  /**
   * Returns true iff the formula at the given address was filtered because
   * it is not on a fix boundary.
   * @param addr The address of a cell, as an ExceLintVector
   * @param reasond A dictionary of filter reasons, indexed by ExceLintVector address.
   * @returns True or false.
   */
  export function notOnBoundary(addr: XLNT.ExceLintVector, reasond: XLNT.Dictionary<Filters.FilterReason[]>): boolean {
    const key = addr.asKey();
    return reasond.contains(key) && reasond.get(key).includes(FilterReason.notOnBoundary);
  }

  /**
   * Returns true iff the formula at the given address had a small entropy reduction.
   * TODO: I don't remember why this is different from belowUserThreshold!
   * @param addr The address of a cell, as an ExceLintVector
   * @param reasond A dictionary of filter reasons, indexed by ExceLintVector address.
   * @returns True or false.
   */
  export function hasLowScore(addr: XLNT.ExceLintVector, reasond: XLNT.Dictionary<Filters.FilterReason[]>): boolean {
    const key = addr.asKey();
    return reasond.contains(key) && reasond.get(key).includes(FilterReason.lowScore);
  }

  /**
   * Returns true iff the formula at the given address was filtered because
   * it is in the big rectangle of a proposed fix.
   * @param addr The address of a cell, as an ExceLintVector
   * @param reasond A dictionary of filter reasons, indexed by ExceLintVector address.
   * @returns True or false.
   */
  export function isInBigRectangle(
    addr: XLNT.ExceLintVector,
    reasond: XLNT.Dictionary<Filters.FilterReason[]>
  ): boolean {
    const key = addr.asKey();
    return reasond.contains(key) && reasond.get(key).includes(FilterReason.bigFix);
  }
}
