import { binsearch, strict_binsearch } from './binsearch';
import { Colorize } from './colorize';
import { ExceLintVector, Dictionary, ProposedFix, Rectangle, upperleft, bottomright } from './ExceLintTypes';

// A comparison function to sort by x-coordinate.
function sort_x_coord(a: Rectangle, b: Rectangle): number {
  const a1 = a.upperleft;
  const b1 = b.upperleft;
  if (a1.x !== b1.x) {
    return a1.x - b1.x;
  } else {
    return a1.y - b1.y;
  }
}

// Returns a dictionary containing a bounding box for each group (indexed by hash).
function generate_bounding_box(g: Dictionary<Rectangle[]>): Dictionary<Rectangle> {
  const bb = new Dictionary<Rectangle>();
  for (const hash of g.keys) {
    let xMin = 1000000;
    let yMin = 1000000;
    let xMax = -1000000;
    let yMax = -1000000;

    // find the max/min x and y that bound all the rectangles in the group
    for (let j = 0; j < g.get(hash).length; j++) {
      const x_tl = g.get(hash)[j].upperleft.x; // top left x
      const x_br = g.get(hash)[j].bottomright.x; // bottom right x
      const y_tl = g.get(hash)[j].upperleft.y; // top left y
      const y_br = g.get(hash)[j].bottomright.y; // bottom right y
      if (x_br > xMax) {
        xMax = x_br;
      }
      if (x_tl < xMin) {
        xMin = x_tl;
      }
      if (y_br > yMax) {
        yMax = y_br;
      }
      if (y_tl < yMin) {
        yMin = y_tl;
      }
    }
    bb.put(hash, new Rectangle(new ExceLintVector(xMin, yMin, 0), new ExceLintVector(xMax, yMax, 0)));
  }
  return bb;
}

// Sort formulas in each group by x coordinate
function sort_grouped_formulas(grouped_formulas: Dictionary<Rectangle[]>): Dictionary<Rectangle[]> {
  const newGnum = new Dictionary<Rectangle[]>();
  for (const key of grouped_formulas.keys) {
    newGnum.put(key, grouped_formulas.get(key).sort(sort_x_coord));
  }
  return newGnum;
}

function numComparator(a_val: ExceLintVector, b_val: ExceLintVector): number {
  if (a_val.x < b_val.x) {
    return -1;
  }
  if (a_val.x > b_val.x) {
    return 1;
  }
  if (a_val.y < b_val.y) {
    return -1;
  }
  if (a_val.y > b_val.y) {
    return 1;
  }
  if (a_val.c < b_val.c) {
    return -1;
  }
  if (a_val.c > b_val.c) {
    return 1;
  }
  return 0; // they're the same
}

// Return the set of adjacent rectangles that are merge-compatible with the given rectangle
function matching_rectangles(
  rect: Rectangle,
  rect_uls: Array<ExceLintVector>,
  rect_lrs: Array<ExceLintVector>
): Rectangle[] {
  // Assumes uls and lrs are already sorted and the same length.
  const rect_ul = rect.upperleft;
  const rect_lr = rect.bottomright;
  const x1 = rect_ul.x;
  const y1 = rect_ul.y;
  const x2 = rect_lr.x;
  const y2 = rect_lr.y;

  /* Try to find something adjacent to A = [[x1, y1, 0], [x2, y2, 0]]
   * options are:
   *   [x1-1, y2] left (lower-right)   [ ] [A] --> [ (?, y1) ... (x1-1, y2) ]
   *   [x2, y1-1] up (lower-right)     [ ]
   *                                   [A] --> [ (x1, ?) ... (x2, y1-1) ]
   *   [x2+1, y1] right (upper-left)   [A] [ ] --> [ (x2 + 1, y1) ... (?, y2) ]
   *   [x1, y2+1] down (upper-left)    [A]
   *                                   [ ] --> [ (x1, y2+1) ... (x2, ?) ]
   */

  // left (lr) = ul_x, lr_y
  const left = new ExceLintVector(x1 - 1, y2, 0);
  // up (lr) = lr_x, ul_y
  const up = new ExceLintVector(x2, y1 - 1, 0);
  // right (ul) = lr_x, ul_y
  const right = new ExceLintVector(x2 + 1, y1, 0);
  // down (ul) = ul_x, lr_y
  const down = new ExceLintVector(x1, y2 + 1, 0);
  const matches: Rectangle[] = [];
  let ind = -1;
  ind = strict_binsearch(rect_lrs, left, numComparator);
  if (ind !== -1) {
    if (rect_uls[ind].y === y1) {
      const candidate: Rectangle = new Rectangle(rect_uls[ind], rect_lrs[ind]);
      matches.push(candidate);
    }
  }
  ind = strict_binsearch(rect_lrs, up, numComparator);
  if (ind !== -1) {
    if (rect_uls[ind].x === x1) {
      const candidate: Rectangle = new Rectangle(rect_uls[ind], rect_lrs[ind]);
      matches.push(candidate);
    }
  }
  ind = strict_binsearch(rect_uls, right, numComparator);
  if (ind !== -1) {
    if (rect_lrs[ind].y === y2) {
      const candidate: Rectangle = new Rectangle(rect_uls[ind], rect_lrs[ind]);
      matches.push(candidate);
    }
  }
  ind = strict_binsearch(rect_uls, down, numComparator);
  if (ind !== -1) {
    if (rect_lrs[ind].x === x2) {
      const candidate: Rectangle = new Rectangle(rect_uls[ind], rect_lrs[ind]);
      matches.push(candidate);
    }
  }
  return matches;
}

// find all merge-compatible rectangles for the given rectangle including their
// fix metrics.
function find_all_matching_rectangles(
  thisfp: string,
  rect: Rectangle,
  fingerprintsX: string[],
  fingerprintsY: string[],
  x_ul: Dictionary<ExceLintVector[]>,
  x_lr: Dictionary<ExceLintVector[]>,
  bb: Dictionary<Rectangle>,
  bbsX: Rectangle[],
  bbsY: Rectangle[]
): ProposedFix[] {
  // get the upper-left and lower-right vectors for the given rectangle
  const base_ul = rect.upperleft;
  const base_lr = rect.bottomright;

  // this is the output
  let match_list: ProposedFix[] = [];

  // find the index of the given rectangle in the list of rects sorted by X
  const ind1 = binsearch(bbsX, rect, (a: Rectangle, b: Rectangle) => a.upperleft.x - b.upperleft.x);

  // find the index of the given rectangle in the list of rects sorted by Y
  const ind2 = binsearch(bbsY, rect, (a: Rectangle, b: Rectangle) => a.upperleft.y - b.upperleft.y);

  // Pick the coordinate axis that takes us the furthest in the fingerprint list.
  const [fps, itmp, axis] = ind1 > ind2 ? [fingerprintsX, ind1, 0] : [fingerprintsY, ind2, 1];
  const ind = itmp > 0 ? itmp - 1 : itmp;
  for (let i = ind; i < fps.length; i++) {
    const fp = fps[i];
    if (fp === thisfp) {
      continue;
    }

    // Check bounding box.
    const box = bb.get(fp);

    /* Since fingerprints are sorted in x-axis order,
	     we can stop once we have gone too far on the x-axis to ever merge again;
	     mutatis mutandis for the y-axis. */

    // early stopping
    if (axis === 0) {
      /* [rect] ... [box]  */
      // if left side of box is too far away from right-most edge of the rectangle
      if (base_lr.x + 1 < box.upperleft.x) {
        break;
      }
    } else {
      /* [rect]
                           ...
                   [box]  */
      // if the top side of box is too far away from bottom-most edge of the rectangle
      if (base_lr.y + 1 < box.upperleft.y) {
        break;
      }
    }

    /*

	      Don't bother processing any rectangle whose edges are
	      outside the bounding box, since they could never be merged with any
	      rectangle inside that box.


                          [ lr_y + 1 < min_y ]

                          +--------------+
      [lr_x + 1 < min_x ] |   Bounding   |  [ max_x + 1 < ul_x ]
	                        |      Box     |
	                        +--------------+

		                      [ max_y + 1 < ul_y ]

	  */

    if (
      base_lr.x + 1 < box.upperleft.x || // left
      base_lr.y + 1 < box.upperleft.y || // top
      box.bottomright.x + 1 < base_ul.x || // right
      box.bottomright.y + 1 < base_ul.y
    ) {
      // Skip. Outside the bounding box.
      //		console.log("outside bounding box.");
    } else {
      const matches: Rectangle[] = matching_rectangles(rect, x_ul.get(fp), x_lr.get(fp));
      if (matches.length > 0) {
        // compute the fix metric for every potential merge and
        // concatenate them into the match_list
        match_list = match_list.concat(
          matches.map((item: Rectangle) => {
            const metric = Colorize.compute_fix_metric(parseFloat(thisfp), rect, parseFloat(fp), item);
            return new ProposedFix(metric, rect, item);
          })
        );
      }
    }
  }
  return match_list;
}

// Returns an array with all duplicate proposed fixes removed.
function dedup_fixes(pfs: ProposedFix[]): ProposedFix[] {
  // filtered array
  const rv: ProposedFix[] = [];

  // this is pretty brute force
  for (const i in pfs) {
    const my_pf = pfs[i];
    let found = false;
    for (const j in rv) {
      const oth_pf = rv[j];
      if (my_pf.equals(oth_pf)) {
        found = true;
        break; // my_pf is already in the list
      }
    }
    // add to the list if it was never encountered
    if (!found) rv.push(my_pf);
  }

  return rv;
}

export function find_all_proposed_fixes(grouped_formulas: Dictionary<Rectangle[]>): ProposedFix[] {
  let all_matches: ProposedFix[] = [];

  // sort each group of rectangles by their x coordinates
  const aNum = sort_grouped_formulas(grouped_formulas);

  // extract from rects the upper-left and lower-right vectors into dicts, indexed by hash
  const x_ul = new Dictionary<ExceLintVector[]>(); // upper-left
  const x_lr = new Dictionary<ExceLintVector[]>(); // lower-right
  for (const fp of grouped_formulas.keys) {
    x_ul.put(fp, aNum.get(fp).map(upperleft));
    x_lr.put(fp, aNum.get(fp).map(bottomright));
  }

  // find the bounding box for each group
  const bb = generate_bounding_box(grouped_formulas);

  // extract fingerprints (we're going to sort list in place)
  const fpStringsX: string[] = grouped_formulas.keys;

  // sort fingerprints by the x-coordinate of the upper-left corner of their bounding box.
  fpStringsX.sort((a: string, b: string) => bb.get(a).upperleft.x - bb.get(b).upperleft.x);

  // generate a sorted list of rectangles
  const bbsX: Rectangle[] = fpStringsX.map(fp => bb.get(fp));

  // extract fingerprints again (we're going to sort list in place)
  const fpStringsY = grouped_formulas.keys;

  // sort fingerprints by the x-coordinate of the upper-left corner of their bounding box.
  fpStringsY.sort((a: string, b: string) => bb.get(a).upperleft.y - bb.get(b).upperleft.y);

  // generate a sorted list of rectangles
  const bbsY: Rectangle[] = fpStringsY.map(fp => bb.get(fp));

  // for every group
  for (const fp of grouped_formulas.keys) {
    // and every rectangle in the group
    for (let i = 0; i < aNum.get(fp).length; i++) {
      // find all matching rectangles and compute their fix scores
      const matches = find_all_matching_rectangles(
        fp,
        aNum.get(fp)[i],
        fpStringsX,
        fpStringsY,
        x_ul,
        x_lr,
        bb,
        bbsX,
        bbsY
      );

      // add these matches to the output
      all_matches = all_matches.concat(matches);
    }
  }

  // reorganize proposed fixes so that the rectangle
  // with the lowest column number comes first
  all_matches = all_matches.map((pf: ProposedFix, _1, _2) => {
    const rect1_ul = upperleft(pf.rect1);
    const rect2_ul = upperleft(pf.rect2);
    // swap rect1 and rect2 depending on the outcome of the comparison
    const newpf: ProposedFix =
      numComparator(rect1_ul, rect2_ul) < 0 ? new ProposedFix(pf.score, pf.rect2, pf.rect1) : pf;
    return newpf;
  });

  // remove duplicate entries
  return dedup_fixes(all_matches);
}
