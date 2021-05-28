/**
 * This is the top-level interface to ExceLint.  Everything in the `core`
 * folder corresponds to the ExceLint-core project, which can be found here:
 * https://github.com/ExceLint/ExceLint-core
 *
 * ©2017-2021 Daniel W. Barowy and Emery D. Berger
 *
 * See repository link above for licensing information.
 */

/**
 * Major TODOs:
 * 1. Condition analysis on the partial string being typed in
 *    by the user; integrate partial parsing.
 * 2. Synthesize replacement formulas.
 * 3. Remove dead code.
 */

import * as XLNT from './core/ExceLintTypes';
import { Colorize } from './core/colorize';
import { RectangleUtils } from './core/rectangleutils';
import { Config } from './core/config';
import { x10, location, util } from '@ms/excel-online-calc';
import { Some } from './core/option';
import { padStart } from './core/colorutils';

export module ExceLint {
  function findUsedRange(fs: XLNT.Dictionary<string>, sheet: string): XLNT.Range {
    // find grid bounds
    let tl_x = Number.MAX_SAFE_INTEGER;
    let tl_y = Number.MAX_SAFE_INTEGER;
    let br_x = Number.MIN_SAFE_INTEGER;
    let br_y = Number.MIN_SAFE_INTEGER;
    for (const key of fs.keys) {
      const vect = XLNT.ExceLintVector.fromKey(key);
      if (vect.x < tl_x) {
        tl_x = vect.x;
      }
      if (vect.x > br_x) {
        br_x = vect.x;
      }
      if (vect.y < tl_y) {
        tl_y = vect.y;
      }
      if (vect.y > br_y) {
        br_y = vect.y;
      }
    }
    const tl = new XLNT.Address(sheet, tl_y, tl_x);
    const br = new XLNT.Address(sheet, br_y, br_x);
    return new XLNT.Range(tl, br);
  }

  function colWidth(fs: XLNT.Dictionary<string>, col: number): number {
    let maxWidth = 0;
    for (const key of fs.keys) {
      const v = XLNT.ExceLintVector.fromKey(key);
      if (v.x === col) {
        const f = fs.get(key);
        if (f.length > maxWidth) {
          maxWidth = f.length;
        }
      }
    }
    return maxWidth;
  }

  export function visualizeGrid(fs: XLNT.Dictionary<string>, sheet: string): string {
    const ur = findUsedRange(fs, sheet);

    // get col widths
    const widths = new XLNT.Dictionary<number>();
    for (let col = ur.upperLeftColumn; col <= ur.bottomRightColumn; col++) {
      widths.put(col.toString(), colWidth(fs, col));
    }

    // make string
    let s = '';
    for (let row = ur.upperLeftRow; row <= ur.bottomRightRow; row++) {
      for (let col = ur.upperLeftColumn; col <= ur.bottomRightColumn; col++) {
        const addr = new XLNT.Address(sheet, row, col);
        const key = addr.asVector().asKey();
        const width = widths.get(col.toString());
        if (fs.contains(key)) {
          s += '[' + padStart(fs.get(key), width, ' ') + ']';
        } else {
          s += '[' + padStart('', width, ' ') + ']';
        }
      }
      s += '\n';
    }
    return s;
  }

  function rangeToSheetGridRange(r: XLNT.Range, si: location.SheetIndex): location.SheetGridRange {
    const row = r.addressStart.row - 1;
    const col = r.addressStart.column - 1;
    const rows = r.bottomRightRow - r.upperLeftRow + 1;
    const cols = r.bottomRightColumn - r.upperLeftColumn + 1;
    const sgRange = location.sheetGridRange(si, location.gridRange(row, col, rows, cols));
    return sgRange;
  }

  /**
   * Finds a region to start exploring.
   * Absent used range information, this is basically just a guess.
   * @param addr The center of the region.
   */
  export function basicRegion(addr: XLNT.Address): XLNT.Range {
    const PAD = 3; // The size of the region is +/-PAD vertically and horizontally
    const upperleft = new XLNT.Address(addr.worksheet, Math.max(addr.row - PAD, 1), Math.max(addr.column - PAD, 1));
    const bottomright = new XLNT.Address(addr.worksheet, addr.row + PAD, addr.column + PAD);
    return new XLNT.Range(upperleft, bottomright);
  }

  /**
   * Run analysis.  The given address must correspond to a single cell.
   *
   * @param addr An Excel address.
   * @param formulas All the formulas in the region of interest.
   * @returns An array of proposed fixes.
   */
  function analyze(addr: XLNT.Address, formulas: XLNT.Dictionary<string>): XLNT.ProposedFix[] {
    // console.log(visualizeGrid(formulas, addr.worksheet));

    // formula groups
    let rects = new XLNT.Dictionary<XLNT.Rectangle[]>();

    // styles
    let styles = new XLNT.Dictionary<string>();

    // output
    let proposed_fixes: XLNT.ProposedFix[] = [];

    // get every reference vector set for every formula, indexed by address vector
    const fRefs = Colorize.relativeFormulaRefs(formulas);

    // compute fingerprints for reference vector sets, indexed by address vector
    const fps = Colorize.fingerprints(fRefs);

    // decompose into rectangles, indexed by fingerprint
    const stepRects = Colorize.identify_groups(fps);

    // merge these new rectangles with the old ones
    rects = Colorize.mergeRectangleDictionaries(stepRects, rects);
    rects = Colorize.mergeRectangles(rects);

    // generate proposed fixes for all the new rectanles
    const pfs = Colorize.generate_proposed_fixes(rects);

    // remove duplicate fixes
    const pfs2 = Colorize.filterDuplicateFixes(pfs);

    // filter fixes by target address
    const pfs3 = pfs2.filter(pf => pf.includesCellAt(addr));

    // filter fixes by user threshold
    const pfs4 = Colorize.filterFixesByUserThreshold(pfs3, Config.reportingThreshold);

    // adjust proposed fixes by style (mutates input)
    Colorize.adjustProposedFixesByStyleHash(pfs4, styles);

    // filter fixes with heuristics
    for (const fix of pfs4) {
      // function to get rectangle info for a rectangle;
      // closes over sheet data
      const rectf = (rect: XLNT.Rectangle) => {
        const formulaCoord = rect.upperleft;
        const firstFormula = formulas.get(formulaCoord.asKey());
        return new XLNT.RectInfo(rect, firstFormula);
      };

      const ffix = Colorize.filterFix(fix, rectf, false);
      if (ffix.hasValue) proposed_fixes.push(ffix.value);
    }

    return proposed_fixes;
  }

  export function* getSuggestions(): x10.PluginValue<string[]> {
    // get active cell
    const origin = yield { kind: x10.PluginRequestKind.GetActiveCell };
    if (origin.kind !== x10.PluginRequestKind.GetActiveCell) {
      throw new Error("Can't find active cell.");
    }
    const activeCell = origin.activeCell;
    const gcell = activeCell.range;
    const si = activeCell.sheet;
    const addr = new XLNT.Address(si.index as string, gcell.row + 1, gcell.col + 1);

    // get the region to explore
    const region = basicRegion(addr);

    // get fat cross regions
    const fc = RectangleUtils.findFatCross(region, addr);
    const regions = [fc.up, fc.left, fc.down, fc.right]
      .filter(reg => reg.hasValue)
      .map(reg => (reg as Some<XLNT.Range>).value); // TS does not propagate guard

    // fetch formulas for regions
    const formulas = new XLNT.Dictionary<string>();
    for (const region of regions) {
      const rng = rangeToSheetGridRange(region, si);
      const res = yield* x10.getRangeRequest(rng);
      const lsg = res.localSheetGrid;
      for (let row = rng.range.row; row < rng.range.row + rng.range.rows; row++) {
        for (let col = rng.range.col; col < rng.range.col + rng.range.cols; col++) {
          // get "formula"
          // in x10, all unevaluated values are "formulas"
          const addr = new XLNT.Address(si.index as string, row + 1, col + 1);
          const fRes = lsg.getCellFormula(row, col);
          if (util.isSuccess(fRes)) {
            // only keep value if it is actually a formula
            const f = fRes.value;
            if (f.startsWith('=')) {
              const key = addr.asVector().asKey();
              formulas.put(key, f);
            }
          }
        }
      }
    }

    // run ExceLint
    const fixes = analyze(addr, formulas);

    // return suggestions
    // we only care about suggestions for the formula under the cursor
    const cursor = addr.asVector();
    return fixes
      .filter(fix => fix.rect1.is(cursor) || fix.rect2.is(cursor))
      .map(
        fix =>
          fix.rect1.upperleft +
          ':' +
          fix.rect1.bottomright +
          ' and ' +
          fix.rect2.upperleft +
          ':' +
          fix.rect2.bottomright
      );
  }
}
