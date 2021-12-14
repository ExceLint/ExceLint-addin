import { ExcelUtils } from "./excelutils";
import { RectangleUtils } from "./rectangleutils";
import { find_all_proposed_fixes } from "./groupme";
import * as XLNT from "./ExceLintTypes";
import { Config } from "./config";
import { Classification } from "./classification";
import { Some, None, Option } from "./option";
import { Paraformula } from "../paraformula/src/paraformula";
import { AST } from "../paraformula/src/ast";

declare var console: Console;

export module Analysis {
  // A hash string indicating no dependencies; in other words,
  // either a formula that makes no references (like `=RAND()`) or a data cell (like `1`)
  export const noDependenciesHash = new XLNT.Fingerprint(12345);

  /**
   * Run analysis.  The given address must correspond to a single cell.
   *
   * @param addr An Excel address.
   * @param formulas All the formulas in the region of interest.
   * @returns An array of proposed fixes.
   */
  export function analyze(addr: XLNT.Address, formulas: XLNT.Dictionary<string>): XLNT.ProposedFix[] {
    // console.log(visualizeGrid(formulas, addr.worksheet));

    // formula groups
    let rects = new XLNT.Dictionary<XLNT.Rectangle[]>();

    // styles
    // let styles = new XLNT.Dictionary<string>();

    // // output
    // let proposed_fixes: XLNT.ProposedFix[] = [];

    // get every reference vector set for every formula, indexed by address vector
    const fRefs = relativeFormulaRefs(formulas, addr.worksheet);

    // compute fingerprints for reference vector sets, indexed by address vector
    const fps = fingerprints(fRefs);

    // decompose into rectangles, indexed by fingerprint
    const stepRects = identify_groups(fps);

    // merge these new rectangles with the old ones
    rects = mergeRectangleDictionaries(stepRects, rects);
    rects = mergeRectangles(rects);

    // generate proposed fixes for all the new rectanles
    const pfs = generate_proposed_fixes(rects);

    // remove duplicate fixes
    // const pfs2 = filterDuplicateFixes(pfs);

    // filter fixes by target address
    const pfs3 = pfs.filter((pf) => pf.includesCellAt(addr));

    // filter fixes by user threshold
    const pfs4 = filterFixesByUserThreshold(pfs3, Config.reportingThreshold);

    // adjust proposed fixes by style (mutates input)
    // adjustProposedFixesByStyleHash(pfs4, styles);

    // // filter fixes with heuristics
    // for (const fix of pfs4) {
    //   // function to get rectangle info for a rectangle;
    //   // closes over sheet data
    //   const rectf = (rect: XLNT.Rectangle) => {
    //     const formulaCoord = rect.upperleft;
    //     const firstFormula = formulas.get(formulaCoord.asKey());
    //     return new XLNT.RectInfo(rect, firstFormula);
    //   };

    //   const ffix = filterFix(fix, rectf, false);
    //   if (ffix.hasValue) proposed_fixes.push(ffix.value);
    // }

    return pfs4;
  }

  /**
   * Greedily produces contiguous rectangular decomposition of a
   * spreadsheet into regions sharing a fingerprint.
   * @param fps A map from ExceLint address vectors to fingerprints.
   * @returns A dictionary indexed by fingerprint value.
   */
  export function findGroups(fps: XLNT.Dictionary<XLNT.Fingerprint>): XLNT.Dictionary<XLNT.Rectangle[]> {
    // formula groups
    let rects = new XLNT.Dictionary<XLNT.Rectangle[]>();

    // decompose into rectangles, indexed by fingerprint
    const stepRects = identify_groups(fps);

    // merge these new rectangles with the old ones
    rects = mergeRectangleDictionaries(stepRects, rects);
    rects = mergeRectangles(rects);

    return rects;
  }

  /**
   * Run analysis.  The given address must correspond to a single cell.
   *
   * @param addr An Excel address.
   * @param formulas All the formulas in the region of interest.
   * @returns An array of proposed fixes.
   */
  export function analyzeLess(addr: XLNT.Address, fps: XLNT.Dictionary<XLNT.Fingerprint>): XLNT.ProposedFix[] {
    const rects = findGroups(fps);

    // generate proposed fixes for all the new rectanles
    const pfs = generate_proposed_fixes(rects);

    // filter fixes by target address
    const pfs2 = pfs.filter((pf) => pf.includesCellAt(addr));

    // filter fixes by user threshold
    const pfs3 = filterFixesByUserThreshold(pfs2, Config.reportingThreshold);

    return pfs3;
  }

  /**
   * Filter the given set of fixes by the given entropy threshold.
   * @param fixes An array of fixes.
   * @param thresh An entropy score threshold.
   * @returns
   */
  export function filterFixesByUserThreshold(fixes: XLNT.ProposedFix[], thresh: number): XLNT.ProposedFix[] {
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
   * Returns true if the "direction" of a fix is vertical
   * @param fix A fix.
   * @returns
   */
  export function fixIsVertical(fix: XLNT.ProposedFix): boolean {
    const rect1_ul_x = XLNT.upperleft(fix.rect1).x;
    const rect2_ul_x = XLNT.upperleft(fix.rect2).x;
    return rect1_ul_x === rect2_ul_x;
  }

  /**
   * Returns the number of cells in a given fix.
   * @param fix
   * @returns
   */
  export function fixCellCount(fix: XLNT.ProposedFix): number {
    return fix.rect1.size + fix.rect2.size;
  }

  export function fixEntropy(fix: XLNT.ProposedFix): number {
    const leftFixSize = fix.rect1.size;
    const rightFixSize = fix.rect2.size;
    const totalSize = leftFixSize + rightFixSize;
    const fixEntropy = -(
      (leftFixSize / totalSize) * Math.log2(leftFixSize / totalSize) +
      (rightFixSize / totalSize) * Math.log2(rightFixSize / totalSize)
    );
    return fixEntropy;
  }

  /**
   * Keep or reject a fix based on some heuristics.
   * @param fix The ProposedFix in question.
   * @param rectf A function that gets RectInfo for a Rectangle.
   * @param beVerbose If true, write rejections to JS console.
   * @returns An optional fix.
   */
  export function filterFix(
    fix: XLNT.ProposedFix,
    /* eslint-disable-next-line no-unused-vars */
    rectf: (r: XLNT.Rectangle) => XLNT.RectInfo,
    beVerbose: boolean
  ): Option<XLNT.ProposedFix> {
    // Determine the direction of the range (vertical or horizontal) by looking at the axes.
    const is_vert: boolean = Analysis.fixIsVertical(fix);

    // Formula info for each rectangle
    const rect_info = fix.rectangles.map(rectf);

    // Omit fixes that are too small (too few cells).
    if (Analysis.fixCellCount(fix) < Config.minFixSize) {
      const print_formulas = JSON.stringify(rect_info.map((fi) => fi.formula));
      if (beVerbose) console.warn("Omitted " + print_formulas + "(too small)");
      return None;
    }

    // Omit fixes with entropy change over threshold
    if (Analysis.fixEntropy(fix) > Config.maxEntropy) {
      const print_formulas = JSON.stringify(rect_info.map((fi) => fi.formula));
      if (beVerbose) console.warn("Omitted " + JSON.stringify(print_formulas) + "(too high entropy)");
      return None;
    }

    // Classify fixes & prune based on the best explanation
    const bin = Classification.pruneFixes(Classification.classifyFixes(fix, is_vert, rect_info));

    // IMPORTANT:
    // Exclude reported bugs subject to certain conditions.
    if (Classification.omitFixes(bin, rect_info, beVerbose)) return None;

    // If we're still here, accept this fix
    // Package everything up with the fix
    fix.analysis = new XLNT.FixAnalysis(bin, rect_info, is_vert);
    return new Some(fix);
  }

  /**
   * Returns true iff vs1 and vs2 are the same.
   * @param vs1
   * @param vs2
   * @returns
   */
  export function vectorArrayCompare(f: string, vs1: XLNT.ExceLintVector[], vs2: XLNT.ExceLintVector[]): boolean {
    let same = true;

    // check for things in vs2 not in vs1
    const d1 = new XLNT.Dictionary<XLNT.ExceLintVector>();
    const vs2_missing = new Set<XLNT.ExceLintVector>();
    for (const v of vs1) {
      d1.put(v.asKey(), v);
    }
    for (const v of vs2) {
      if (!d1.contains(v.asKey())) {
        vs2_missing.add(v);
        same = false;
      }
    }

    // check for things in vs1 not in vs2
    const d2 = new XLNT.Dictionary<XLNT.ExceLintVector>();
    const vs1_missing = new Set<XLNT.ExceLintVector>();
    for (const v of vs2) {
      d2.put(v.asKey(), v);
    }
    for (const v of vs1) {
      if (!d2.contains(v.asKey())) {
        vs1_missing.add(v);
        same = false;
      }
    }

    // debug
    if (!same) {
      let s = "";
      s += "For formula '" + f + "'\n";
      s += "Missing from vs1: \n";
      for (const v of vs1_missing) {
        s += v.toString() + "\n";
      }
      s += "Missing from vs2: \n";
      for (const v of vs2_missing) {
        s += v.toString() + "\n";
      }
      console.warn(s);
    }
    return same;
  }

  /**
   * Given a dictionary of formulas indexed by ExceLintVector addresses, return
   * a mapping from ExceLintVector addresses to a formula's relative reference set.
   * @param formulas Dictionary mapping ExceLint address vectors to formula strings.
   * @param sheetOrigin The name of the sheet from which formulas are taken.
   * @returns A dictionary of reference vector sets, indexed by address vector.
   */
  export function relativeFormulaRefs(
    formulas: XLNT.Dictionary<string>,
    sheetOrigin: string
  ): XLNT.Dictionary<XLNT.ExceLintVector[]> {
    const _d = new XLNT.Dictionary<XLNT.ExceLintVector[]>();
    for (const addrKey of formulas.keys) {
      // get formula itself
      const f = formulas.get(addrKey);

      // get address vector for formula
      const addr = XLNT.ExceLintVector.fromKey(addrKey);

      // compute dependencies for formula
      const vec_array = ExcelUtils.all_cell_dependencies(f, addr.x, addr.y, sheetOrigin);

      // add to set
      _d.put(addrKey, vec_array);
    }
    return _d;
  }

  /**
   * Given a dictionary of formula refs indexed by ExceLintVector addresses, return
   * a mapping from ExceLintVector addresses to that formulas's fingerprints (resultant).
   * @param refDict Reference set dictionary.
   * @returns Fingerprint dictionary, indexed by address vector.
   */
  export function fingerprints(refDict: XLNT.Dictionary<XLNT.ExceLintVector[]>) {
    const _d = new XLNT.Dictionary<XLNT.Fingerprint>();
    for (const addrKey of refDict.keys) {
      // get refs
      const refs = refDict.get(addrKey);

      // no refs
      if (refs.length === 0) {
        _d.put(addrKey, Analysis.noDependenciesHash);
      } else {
        // compute resultant vector
        const vec = refs.reduce(XLNT.ExceLintVector.VectorSum);

        // add to dict
        if (vec.equals(XLNT.ExceLintVector.baseVector())) {
          // refs are internal?
          _d.put(addrKey, Analysis.noDependenciesHash);
        } else {
          // normal resultant
          const hash = vec.hash();
          _d.put(addrKey, new XLNT.Fingerprint(hash));
        }
      }
    }
    return _d;
  }

  // Take in a list of [[row, col], color] pairs and group them,
  // sorting them (e.g., by columns).
  export function identify_ranges(
    data_fingerprints: XLNT.Dictionary<XLNT.Fingerprint>,
    /* eslint-disable-next-line no-unused-vars */
    sortfn: (n1: XLNT.ExceLintVector, n2: XLNT.ExceLintVector) => number
  ): XLNT.Dictionary<XLNT.ExceLintVector[]> {
    // Separate into groups based on their XLNT.Fingerprint value.
    const groups = new XLNT.Dictionary<XLNT.ExceLintVector[]>();
    for (const key of data_fingerprints.keys) {
      const vec = XLNT.ExceLintVector.fromKey(key);
      const fp = data_fingerprints.get(key).asKey();
      if (!groups.contains(fp)) {
        groups.put(fp, []); // initialize array if necessary
      }
      groups.get(fp).push(vec);
    }
    // Now sort them all.
    for (const z of groups.keys) {
      groups.get(z).sort(sortfn);
    }
    return groups;
  }

  // Collect all ranges of cells that share a XLNT.Fingerprint
  export function find_contiguous_regions(
    groups: XLNT.Dictionary<XLNT.ExceLintVector[]>
  ): XLNT.Dictionary<XLNT.Rectangle[]> {
    const output = new XLNT.Dictionary<XLNT.Rectangle[]>();

    for (const key of groups.keys) {
      // Here, we scan all of the vectors in this group, accumulating
      // all adjacent vectors by tracking the start and end. Whevener
      // we encounter a non-adjacent vector, push the region to the output
      // list and then start tracking a new region.
      output.put(key, []); // initialize
      let start = groups.get(key).shift() as XLNT.ExceLintVector; // remove the first vector from the list
      let end = start;
      for (const v of groups.get(key)) {
        // Check if v is in the same column as last, adjacent row
        if (v.x === end.x && v.y === end.y + 1) {
          end = v;
        } else {
          output.get(key).push(new XLNT.Rectangle(start, end));
          start = v;
          end = v;
        }
      }
      output.get(key).push(new XLNT.Rectangle(start, end));
    }
    return output;
  }

  /**
   * Partition spreadsheet into rectangular regions.
   * @param fingerprints A dictionary of fingerprints, indexed by ExceLint address vectors.
   * @returns A dictionary of rectangle groups, indexed by ExceLint fingerprint vectors.
   */
  export function identify_groups(fingerprints: XLNT.Dictionary<XLNT.Fingerprint>): XLNT.Dictionary<XLNT.Rectangle[]> {
    const id = Analysis.identify_ranges(fingerprints, ExcelUtils.ColumnSort);
    const gr = Analysis.find_contiguous_regions(id);
    // Now try to merge stuff with the same hash.
    const newGr1 = gr.clone();
    const mg = Analysis.merge_groups(newGr1);
    return mg;
  }

  // Compute the normalized distance from merging two ranges.
  export function compute_fix_metric(
    target_norm: number,
    target: XLNT.Rectangle,
    merge_with_norm: number,
    merge_with: XLNT.Rectangle
  ): XLNT.Metric {
    const t1 = target.upperleft;
    const t2 = target.bottomright;
    const m1 = merge_with.upperleft;
    const m2 = merge_with.bottomright;
    const n_target = RectangleUtils.area(
      new XLNT.Rectangle(new XLNT.ExceLintVector(t1.x, t1.y, 0), new XLNT.ExceLintVector(t2.x, t2.y, 0))
    );
    const n_merge_with = RectangleUtils.area(
      new XLNT.Rectangle(new XLNT.ExceLintVector(m1.x, m1.y, 0), new XLNT.ExceLintVector(m2.x, m2.y, 0))
    );
    const n_min = Math.min(n_target, n_merge_with);
    const n_max = Math.max(n_target, n_merge_with);
    const norm_min = Math.min(merge_with_norm, target_norm);
    const norm_max = Math.max(merge_with_norm, target_norm);
    let fix_distance = Math.abs(norm_max - norm_min) / XLNT.ExceLintVector.Multiplier;

    // Ensure that the minimum fix is at least one (we need this if we don't use the L1 norm).
    if (fix_distance < 1.0) {
      fix_distance = 1.0;
    }
    const entropy_drop = Analysis.entropydiff(n_min, n_max); // negative
    const ranking = (1.0 + entropy_drop) / (fix_distance * n_min); // ENTROPY WEIGHTED BY FIX DISTANCE
    return -ranking; // negating to sort in reverse order.
  }

  // Take two counts and compute the normalized entropy difference that would result if these were 'merged'.
  export function entropydiff(oldcount1: number, oldcount2: number) {
    const total = oldcount1 + oldcount2;
    const prevEntropy = Analysis.entropy(oldcount1 / total) + Analysis.entropy(oldcount2 / total);
    const normalizedEntropy = prevEntropy / Math.log2(total);
    return -normalizedEntropy;
  }

  // Shannon entropy.
  export function entropy(p: number): number {
    return -p * Math.log2(p);
  }

  export function generate_proposed_fixes(groups: XLNT.Dictionary<XLNT.Rectangle[]>): XLNT.ProposedFix[] {
    const proposed_fixes_new = find_all_proposed_fixes(groups);
    // sort by fix metric
    proposed_fixes_new.sort((a, b) => {
      return a.score - b.score;
    });
    return proposed_fixes_new;
  }

  export function merge_groups(groups: XLNT.Dictionary<XLNT.Rectangle[]>): XLNT.Dictionary<XLNT.Rectangle[]> {
    for (const k of groups.keys) {
      const g = groups.get(k).slice(); // slice with no args makes a shallow copy
      groups.put(k, Analysis.merge_individual_groups(g));
    }
    return groups;
  }

  /**
   * TODO: This method is problematic.
   * @param group
   * @returns
   */
  export function merge_individual_groups(group: XLNT.Rectangle[]): XLNT.Rectangle[] {
    let numIterations = 0;
    group = group.sort();
    /* eslint-disable-next-line no-constant-condition */
    while (true) {
      let merged_one = false;
      const deleted_rectangles = new XLNT.Dictionary<boolean>();
      const updated_rectangles = [];
      const working_group = group.slice();
      while (working_group.length > 0) {
        const head = working_group.shift() as XLNT.Rectangle;
        for (let i = 0; i < working_group.length; i++) {
          if (RectangleUtils.is_mergeable(head, working_group[i])) {
            const head_str = JSON.stringify(head);
            const working_group_i_str = JSON.stringify(working_group[i]);
            // NB: 12/7/19 New check below, used to be unconditional.
            if (!deleted_rectangles.contains(head_str) && !deleted_rectangles.contains(working_group_i_str)) {
              updated_rectangles.push(RectangleUtils.bounding_box(head, working_group[i]));
              deleted_rectangles.put(head_str, true);
              deleted_rectangles.put(working_group_i_str, true);
              merged_one = true;
              break; // was disabled
            }
          }
        }
      }
      for (let i = 0; i < group.length; i++) {
        if (!deleted_rectangles.contains(JSON.stringify(group[i]))) {
          updated_rectangles.push(group[i]);
        }
      }
      updated_rectangles.sort();
      if (!merged_one) {
        return updated_rectangles;
      }
      group = updated_rectangles.slice();
      numIterations++;
      if (numIterations > 2000) {
        // This is a hack to guarantee convergence.
        const tl = new XLNT.ExceLintVector(-1, -1, 0);
        const br = new XLNT.ExceLintVector(-1, -1, 0);
        return [new XLNT.Rectangle(tl, br)];
      }
    }
  }

  // Mark proposed fixes that do not have the same format.
  // Modifies ProposedFix objects, including their scores.
  export function adjustProposedFixesByStyleHash(
    fixes: XLNT.ProposedFix[],
    stylehashes: XLNT.Dictionary<string>
  ): void {
    // short circuit if we don't have style information
    if (stylehashes.size === 0) {
      return;
    }

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
      const ul_col = ul.x;
      const ul_row = ul.y;
      const br_col = br.x;
      const br_row = br.y;

      // Now check whether the formats are all the same or not.
      // Get the first format and then check that all other cells in the
      // range have the same format.
      // We can iterate over the combination of both ranges at the same
      // time because all proposed fixes must be "merge compatible," i.e.,
      // adjacent XLNT.rectangles that, when merged, form a new rectangle.
      const firstAddr = new XLNT.ExceLintVector(ul_col, ul_row, 0);
      const firstFormat = stylehashes.get(firstAddr.asKey());
      for (let i = ul_row; i <= br_row; i++) {
        // if we've already determined that the formats are different
        // stop looking for differences
        if (!fix.sameFormat) {
          break;
        }
        for (let j = ul_col; j <= br_col; j++) {
          const secondAddr = new XLNT.ExceLintVector(j, i, 0);
          const secondFormat = stylehashes.get(secondAddr.asKey());
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
   * Deep copies a dictionary of rectangles indexed by excelint fingerprint. Does
   * not deep copy rectangles themselves.
   * @param rects
   * @returns
   */
  export function rectDictDeepCopy(rects: XLNT.Dictionary<XLNT.Rectangle[]>): XLNT.Dictionary<XLNT.Rectangle[]> {
    const outer = new XLNT.Dictionary<XLNT.Rectangle[]>();
    for (const key of rects.keys) {
      const inner: XLNT.Rectangle[] = [];
      outer.put(key, inner);
      for (const r of rects.get(key)) {
        inner.push(r);
      }
    }
    return outer;
  }

  /**
   * Generates all pairs of the elements of an array where order
   * does not matter.
   * @param xs An array of elements.
   */
  export function allPairsOrderIndependent<X>(xs: X[]): [X, X][] {
    const _d = new XLNT.Dictionary<[X, X]>();
    for (let i = 0; i < xs.length; i++) {
      for (let j = 0; j < xs.length; j++) {
        if (i === j) continue; // no self-pairing
        /* a key is formed by putting the smaller of the two
         * values first; this way, e.g., i = 2, j = 3 and
         * i = 3, j = 2 have the same key
         */
        const key = i < j ? i + "," + j : j + "," + i;
        if (_d.contains(key)) continue;
        _d.put(key, [xs[i], xs[j]]);
      }
    }
    return _d.values;
  }

  /**
   * Merges all merge-compatible rectangles that share a fingerprint.
   * This algorithm is greedy, and may produce suboptimal merges.
   * @param rects A dictionary of rectangles, indexed by fingerprint.
   */
  export function mergeRectangles(rects: XLNT.Dictionary<XLNT.Rectangle[]>): XLNT.Dictionary<XLNT.Rectangle[]> {
    let working = Analysis.rectDictDeepCopy(rects);
    let mergeHappened = true;
    while (mergeHappened) {
      mergeHappened = false; // reset
      let merged = new XLNT.Dictionary<XLNT.Rectangle[]>(); // temporary storage for merges
      // for each fingerprint
      for (const fpKey of working.keys) {
        // for each pair of rects not already merged
        const rects = working.get(fpKey);
        const pairs = Analysis.allPairsOrderIndependent(rects);
        const processed = new XLNT.Dictionary<XLNT.Rectangle>(); // indexed by rectangle hash

        // initialize merge storage
        merged.put(fpKey, []);

        for (const [a, b] of pairs) {
          // if we haven't already processed these two and they're merge-compatible,
          // merge them
          if (!processed.contains(a.hash()) && !processed.contains(b.hash())) {
            const m = a.merge(b);
            if (m.hasValue) {
              // did the merge succeed?
              mergeHappened = true;
              processed.put(a.hash(), a);
              processed.put(b.hash(), b);
              merged.get(fpKey).push(m.value); // store the merge
            }
          }
        }
        // just add all unprocessed rects
        for (const r of rects) {
          if (!processed.contains(r.hash())) {
            merged.get(fpKey).push(r);
          }
        }
      }

      working = merged;
    }
    return working;
  }

  /**
   * Produces a single dictionary, indexed by fingerprint, that contains
   * all of the rectangles from both given dictionaries. Does not check
   * for duplicate rectangles.
   * @param a One dictionary.
   * @param b Another dictionary.
   * @returns A merged dictionary.
   */
  export function mergeRectangleDictionaries(
    a: XLNT.Dictionary<XLNT.Rectangle[]>,
    b: XLNT.Dictionary<XLNT.Rectangle[]>
  ): XLNT.Dictionary<XLNT.Rectangle[]> {
    const both = Analysis.rectDictDeepCopy(a);
    for (const k of b.keys) {
      let tgt: XLNT.Rectangle[];
      if (both.contains(k)) {
        tgt = both.get(k);
      } else {
        tgt = [];
        both.put(k, tgt);
      }
      for (const r of b.get(k)) {
        tgt.push(r);
      }
    }
    return both;
  }

  // /**
  //  * Remove all duplicate fixes.
  //  * @param proposed_fixes An array of proposed fixes.
  //  * @returns An array of proposed fixes with all dupes removed.
  //  */
  // export function filterDuplicateFixes(proposed_fixes: XLNT.ProposedFix[]): XLNT.ProposedFix[] {
  //   const keep = new XLNT.Dictionary<XLNT.ProposedFix>();
  //   for (const pf of proposed_fixes) {
  //     const hash = pf.rect1.hash() + pf.rect2.hash();
  //     if (!keep.contains(hash)) {
  //       keep.put(hash, pf);
  //     }
  //   }
  //   return keep.values;
  // }

  /**
   * Returns true if the cell flagged for fixing is at a fix
   * boundary.
   * @param addr Cell to fix.
   * @param fix A proposed fix.
   * @returns True iff addr is at a boundary.
   */
  export function atDiscontinuity(addr: XLNT.Address, fix: XLNT.ProposedFix) {
    // convert addr to ExceLintVector address
    const v = new XLNT.ExceLintVector(addr.column, addr.row, 0);

    // fix \in rect1, adjacent cell \in rect2 or
    // fix \in rect2, adjacent cell \in rect1
    return (
      (fix.rect1.contains(v) && fix.rect2.contains(v.up)) ||
      (fix.rect1.contains(v) && fix.rect2.contains(v.left)) ||
      (fix.rect1.contains(v) && fix.rect2.contains(v.down)) ||
      (fix.rect1.contains(v) && fix.rect2.contains(v.right)) ||
      (fix.rect2.contains(v) && fix.rect1.contains(v.up)) ||
      (fix.rect2.contains(v) && fix.rect1.contains(v.left)) ||
      (fix.rect2.contains(v) && fix.rect1.contains(v.down)) ||
      (fix.rect2.contains(v) && fix.rect1.contains(v.right))
    );
  }

  /**
   * Filters out fixes that are not at a fix boundary (i.e., non-discontiguous).
   * @param addr Cell to fix
   * @param fixes An array of proposed fixes.
   * @returns A filtered array of proposed fixes.
   */
  export function filterContiguousFixes(addr: XLNT.Address, fixes: XLNT.ProposedFix[]) {
    const fixes_to_keep: XLNT.ProposedFix[] = [];
    for (const fix of fixes) {
      // if the address of the fix is not at a fix boundary, skip
      if (atDiscontinuity(addr, fix)) {
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
  export function filterScoreThreshold(score_theshold: number, fixes: XLNT.ProposedFix[]): XLNT.ProposedFix[] {
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
  export function filterBigFixes(addr: XLNT.Address, fixes: XLNT.ProposedFix[]) {
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
   * Given a formula address, synthesize a fix for each of the given proposed fixes.
   * Fixes are ranked by the amount of duplicate evidence given, and duplicates are
   * removed.  Also, if the synthesized formula is the same as the formula itself,
   * the fix is ignored.
   *
   * @param addr The address to apply the fix.
   * @param fixes An array of proposed fixes.
   * @param formulas A dictionary of formulas, indexed by ExceLintVector address.
   */
  export function synthFixes(
    addr: XLNT.Address,
    fixes: XLNT.ProposedFix[],
    formulas: XLNT.Dictionary<string>
  ): string[] {
    // store a map from fix string to count of times
    // the same string has been generated
    const fix_strings_ranks = new XLNT.Dictionary<number>();

    // convert addr to ExceLintVector address
    const v = new XLNT.ExceLintVector(addr.column, addr.row, 0);

    // do this for every proposed fix
    for (const fix of fixes) {
      // whatever rectangle does not contain the given formula
      // is our fix template.
      const r = fix.getRectOf(addr);
      if (!r.hasValue) {
        throw new Error(`Invalid fix for address ${addr.toA1Ref()}`);
      }
      const fixr = fix.rect1 == r.value ? fix.rect2 : fix.rect1;

      // get the first formula in the fix rectangle
      const faddr = fixr.upperleft;
      const f = formulas.get(faddr.asKey());

      // parse the formula
      let ast: AST.Expression;
      try {
        ast = Paraformula.parse(f);
      } catch (e) {
        console.warn(`Unable to parse formula '${f}' at address ${faddr}:\n${e} in worksheet ${addr.worksheet}`);
        continue;
      }

      // adjust the formula's AST to reflect a new origin
      const ast2 = Analysis.adjustFormulaOrigin(v, faddr, ast);

      // generate a new formula string
      const fixstr = ast2.toFormula();

      // if the formula is the same as the one we already have, skip
      if (formulas.contains(addr.asKey()) && formulas.get(addr.asKey()) === fixstr) {
        continue;
      }

      // if the address of the fix is not at a fix boundary, skip
      if (!atDiscontinuity(addr, fix)) {
        continue;
      }

      // count string
      if (fix_strings_ranks.contains(fixstr)) {
        // add one to count
        fix_strings_ranks.put(fixstr, fix_strings_ranks.get(fixstr) + 1);
      } else {
        // never seen before-- add to dict
        fix_strings_ranks.put(fixstr, 1);
      }
    }

    // order dict by rank and return in that order
    const fix_strings_flat: [string, number][] = [];
    for (const key of fix_strings_ranks.keys) {
      fix_strings_flat.push([key, fix_strings_ranks.get(key)]);
    }
    fix_strings_flat.sort(([, aval], [, bval]) => aval - bval);

    // remove count
    const just_strs = fix_strings_flat.map(([str]) => str);

    return just_strs;
  }

  /**
   * Adjust the origin of the given address by the given delta.
   * @param delta A delta encoded as an ExceLintVector.
   * @param addr The address to adjust.
   */
  export function adjustAddress(delta: XLNT.ExceLintVector, addr: AST.Address): AST.Address {
    const v = new XLNT.ExceLintVector(addr.column, addr.row, 0);
    const v2 = v.add(delta);
    return new AST.Address(v2.y, v2.x, addr.rowMode, addr.colMode, addr.env);
  }

  /**
   * Recursively adjust every expression's address by the given address delta.
   * @param delta An ExceLintVector address delta.
   * @param expr An expression.
   */
  export function adjustExpressionOrigin(delta: XLNT.ExceLintVector, expr: AST.Expression): AST.Expression {
    switch (expr.type) {
      case AST.ReferenceRange.type: {
        // generate a new range
        const regions: [AST.Address, AST.Address][] = [];
        for (const region of expr.rng.regions) {
          const [tl, br] = region;
          const tl2 = Analysis.adjustAddress(delta, tl);
          const br2 = Analysis.adjustAddress(delta, br);
          regions.push([tl2, br2]);
        }
        const rng2 = new AST.Range(regions);
        return new AST.ReferenceRange(regions[0][0].env, rng2);
      }
      case AST.ReferenceAddress.type: {
        // generate a new address
        const addr2 = Analysis.adjustAddress(delta, expr.address);
        return new AST.ReferenceAddress(addr2.env, addr2);
      }
      case AST.ReferenceNamed.type:
        // named addresses do not need to be changed
        return expr;
      case AST.FunctionApplication.type: {
        // recursively adjust arguments
        const args2 = expr.args.map((arg) => Analysis.adjustExpressionOrigin(delta, arg));
        return new AST.FunctionApplication(expr.name, args2, expr.arity);
      }
      case AST.Number.type:
        // number literals do not need to be changed
        return expr;
      case AST.StringLiteral.type:
        // string literals do not need to be changed
        return expr;
      case AST.Boolean.type:
        // boolean literals do not need to be changed
        return expr;
      case AST.BinOpExpr.type: {
        // recursively adjust operands
        const lhs = Analysis.adjustExpressionOrigin(delta, expr.exprL);
        const rhs = Analysis.adjustExpressionOrigin(delta, expr.exprR);
        return new AST.BinOpExpr(expr.op, lhs, rhs);
      }
      case AST.UnaryOpExpr.type: {
        // recursive adjust operand
        const expr2 = Analysis.adjustExpressionOrigin(delta, expr.expr);
        return new AST.UnaryOpExpr(expr.op, expr2);
      }
      case AST.ParensExpr.type: {
        // recursive adjust subexpression
        const expr2 = Analysis.adjustExpressionOrigin(delta, expr.expr);
        return new AST.ParensExpr(expr2);
      }
      default:
        throw new Error(`Unknown AST node type '${expr}'`);
    }
  }

  /**
   * Adjusts every address the given expression to reflect a new origin.
   * @param neworigin
   * @param oldorigin
   * @param ast
   */
  export function adjustFormulaOrigin(
    neworigin: XLNT.ExceLintVector,
    oldorigin: XLNT.ExceLintVector,
    ast: AST.Expression
  ): AST.Expression {
    // calculate delta
    const delta = neworigin.subtract(oldorigin);
    // recursively adjust
    return Analysis.adjustExpressionOrigin(delta, ast);
  }
}
