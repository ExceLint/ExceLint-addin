import { binsearch, strict_binsearch } from './binsearch';
import { Colorize } from './colorize';
import { Timer } from './timer';

type excelintVector = [number, number, number];

/*
// Enable reasonable comparisons of numbers by converting them to zero-padded strings
// so that 9 < 56 (because "0009" < "0056").
function fix(n) {
    return n.toString().padStart(10, '0');
}

// Apply fixes to an array.
function fix_array(arr) {
    return arr.map((x, _1, _2) => { return fix(x); });
}

// Apply fixes to a pair.
function fix_pair(p) {
    const [p1, p2] = p;
    return [fix_array(p1), fix_array(p2)];
}
*/

// A comparison function to sort by x-coordinate.
function sort_x_coord(a, b) {
    const [a1, a2] = a;
    const [b1, b2] = b;
    if (a1[0] !== b1[0]) {
        return (a1[0] - b1[0]);
    } else {
        return (a1[1] - b1[1]);
    }
}

// A comparison function to sort by y-coordinate.
function sort_y_coord(a, b) {
    const [a1, a2] = a;
    const [b1, b2] = b;
    if (a1[1] !== b1[1]) {
        return (a1[1] - b1[1]);
    } else {
        return (a1[0] - b1[0]);
    }
}

function generate_bounding_box(g): { [val: string]: [excelintVector, excelintVector] } {
    let bb = {};
    for (let i of Object.keys(g)) {
        //	console.log("length of formulas for " + i + " = " + g[i].length);
        let xMin = 1000000;
        let yMin = 1000000;
        let xMax = -1000000;
        let yMax = -1000000;
        for (let j = 0; j < g[i].length; j++) {
            let x1 = g[i][j][0][0];
            let x2 = g[i][j][1][0];
            let y1 = g[i][j][0][1];
            let y2 = g[i][j][1][1];
            if (x2 > xMax) {
                xMax = x2;
            }
            if (x1 < xMin) {
                xMin = x1;
            }
            if (y2 > yMax) {
                yMax = y2;
            }
            if (y1 < yMin) {
                yMin = y1;
            }
        }
        bb[i] = [[xMin, yMin, 0], [xMax, yMax, 0]];
        //	console.log("bounding rectangle = (" + xMin + ", " + yMin + "), (" + xMax + ", " + yMax + ")");
    }
    return bb;
}

function fix_grouped_formulas(g, newGnum) {
    for (let i of Object.keys(g)) {
        newGnum[i] = g[i].sort(sort_x_coord).map((x, _1, _2) => {
            return [x[0].map((a, _1, _2) => Number(a)),
            x[1].map((a, _1, _2) => Number(a))];
        });
    }
}


// Knuth-Fisher-Yates shuffle (not currently used).
function shuffle(a) {
    let j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}


//test_binsearch();

let comparisons = 0;

function numComparator(a_val: excelintVector, b_val: excelintVector) {
    for (let i = 0; i < 3; i++) { // note: length of excelint vector
        if (a_val[i] < b_val[i]) {
            return -1;
        }
        if (a_val[i] > b_val[i]) {
            return 1;
        }
    }
    return 0;
}

function matching_rectangles(rect_ul: excelintVector,
    rect_lr: excelintVector,
    rect_uls: Array<excelintVector>,
    rect_lrs: Array<excelintVector>): Array<[excelintVector, excelintVector]> {
    // Assumes uls and lrs are already sorted and the same length.
    const x1 = rect_ul[0];
    const y1 = rect_ul[1];
    const x2 = rect_lr[0];
    const y2 = rect_lr[1];

    // Try to find something adjacent to A = [[x1, y1, 0], [x2, y2, 0]]
    // options are:
    //   [x1-1, y2] left (lower-right)   [ ] [A] --> [ (?, y1) ... (x1-1, y2) ]
    //   [x2, y1-1] up (lower-right)     [ ]
    //                                   [A] --> [ (x1, ?) ... (x2, y1-1) ]
    //   [x2+1, y1] right (upper-left)   [A] [ ] --> [ (x2 + 1, y1) ... (?, y2) ]
    //   [x1, y2+1] down (upper-left)    [A]
    //                                   [ ] --> [ (x1, y2+1) ... (x2, ?) ]

    // left (lr) = ul_x, lr_y
    const left = [x1 - 1, y2, 0];
    // up (lr) = lr_x, ul_y
    const up = [x2, y1 - 1, 0];
    // right (ul) = lr_x, ul_y
    const right = [x2 + 1, y1, 0];
    // down (ul) = ul_x, lr_y
    const down = [x1, y2 + 1, 0];
    let matches = [];
    let ind = -1;
    ind = strict_binsearch(rect_lrs, left, numComparator);
    //	console.log("left = " + ind);
    if (ind !== -1) {
        if (rect_uls[ind][1] === y1) {
            const candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    ind = strict_binsearch(rect_lrs, up, numComparator);
    //	console.log("up = " + ind);
    if (ind !== -1) {
        if (rect_uls[ind][0] === x1) {
            const candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    ind = strict_binsearch(rect_uls, right, numComparator);
    //	console.log("right = " + ind);
    if (ind !== -1) {
        if (rect_lrs[ind][1] === y2) {
            const candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    ind = strict_binsearch(rect_uls, down, numComparator);
    //	console.log("down = " + ind);
    if (ind !== -1) {
        if (rect_lrs[ind][0] === x2) {
            const candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    return matches;
}


let rectangles_count = 0;

function find_all_matching_rectangles(thisKey: string,
    rect: [excelintVector, excelintVector],
    grouped_formulas: { [val: string]: Array<[excelintVector, excelintVector]> },
    keylistX: Array<string>,
    keylistY: Array<string>,
    x_ul: { [val: string]: Array<excelintVector> },
    x_lr: { [val: string]: Array<excelintVector> },
    bb: { [val: string]: [excelintVector, excelintVector] },
    bbsX: Array<[excelintVector, excelintVector]>,
    bbsY: Array<[excelintVector, excelintVector]>): Array<[number, [excelintVector, excelintVector]]> {
    const [base_ul, base_lr] = rect;
    //    console.log("Looking for matches of " + JSON.stringify(base_ul) + ", " + JSON.stringify(base_lr));
    let match_list = [];
    let a = grouped_formulas;
    //	console.log("total formulas = " + keylist.length);
    //	console.log(JSON.stringify(bbs));
    const ind1 = binsearch(bbsX, rect, ((a, b) => { return a[0][0] - b[0][0]; }));
    const ind2 = binsearch(bbsY, rect, ((a, b) => { return a[0][1] - b[0][1]; }));
    //	console.log("ind1 = " + ind1 + ", ind2 = " + ind2);
    // Pick the coordinate axis that takes us the furthest in the list.
    let keylist;
    let axis;
    let ind;
    if (ind1 > ind2) {
        keylist = keylistX;
        ind = ind1;
        axis = 0;
    } else {
        keylist = keylistY;
        ind = ind2;
        axis = 1;
    }
    if (ind > 0) {
        ind -= 1;
    }
    // ind = 0; // FIXME FIXME
    //	console.log("found the item " + JSON.stringify(rect) + " at position = " + ind);
    for (let i = ind; i < keylist.length; i++) {
        const key = keylist[i];
        if (key === thisKey) {
            continue;
        }
        rectangles_count++;
        if (rectangles_count % 10000 === 0) {
            //	    if (true) { // rectangles_count % 1000 === 0) {
            //            console.log('find_all_matching_rectangles, iteration ' + rectangles_count);
        }
        // Check bounding box.
        let box = bb[key];

        /* Since the keys are sorted in x-axis order,
	       we can stop once we have gone too far on the x-axis to ever merge again;
	       mutatis mutandis for the y-axis. */

        if (true) { // early stopping

            if (axis === 0) {
                /* [rect] ... [box]  */
                // if left side of box is too far away from right-most edge of the rectangle
                if (base_lr[0] + 1 < box[0][0]) {
                    //			console.log("horizontal: breaking out");
                    break;
                }
            } else {
                /* [rect]
                           ...
                   [box]  */
                // if the top side of box is too far away from bottom-most edge of the rectangle
                if (base_lr[1] + 1 < box[0][1]) {
                    //			console.log("vertical: breaking out");
                    break;
                }
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

        if (((base_lr[0] + 1 < box[0][0]) // left
            || (base_lr[1] + 1 < box[0][1]) // top
            || (box[1][0] + 1 < base_ul[0]) // right
            || (box[1][1] + 1 < base_ul[1]))) {
            // Skip. Outside the bounding box.
            //		console.log("outside bounding box.");

        } else {

            const matches = matching_rectangles(base_ul, base_lr, x_ul[key], x_lr[key]);
            if (matches.length > 0) {
                //		    console.log("found matches for key "+key+" --> " + JSON.stringify(matches));
                match_list = match_list.concat(matches.map((item, _1, _2) => {
                    let metric = Colorize.fix_metric(parseFloat(thisKey), rect, parseFloat(key), item);
                    return [metric, rect, item];
                }));
            }
        }
    }
    //	console.log("match_list = " + JSON.stringify(match_list));
    //	t.split("done.");
    ///	console.log("find_all_matching_rectangles, iteration " + rectangles_count);
    return match_list;
}


// Returns an array with all duplicated entries removed.
function dedup(arr) {
    let t = {};
    return arr.filter(e => !(t[e] = e in t));
}


export function find_all_proposed_fixes(grouped_formulas: { [val: string]: Array<[excelintVector, excelintVector]> }): Array<[number, [excelintVector, excelintVector], [excelintVector, excelintVector]]> {
    //    let t = new Timer("find_all_proposed_fixes");
    let all_matches = [];
    let count = 0;
    rectangles_count = 0;
    let aNum = {};
    fix_grouped_formulas(grouped_formulas, aNum);
    let x_ul = {};
    let x_lr = {};
    for (let key of Object.keys(grouped_formulas)) {
        x_ul[key] = aNum[key].map((i, _1, _2) => { let [p1, p2] = i; return p1; });
        x_lr[key] = aNum[key].map((i, _1, _2) => { let [p1, p2] = i; return p2; });
    }
    //   t.split("generated upper left and lower right arrays.");
    let bb = generate_bounding_box(grouped_formulas);
    //    t.split("generated bounding box.");
    let keylistX = Object.keys(grouped_formulas);

    //    console.log("keylist was = " + JSON.stringify(keylist));
    // Sort the keys by the x-axis of the upper-left corner of their bounding boxes.
    keylistX.sort((a, b) => { return bb[a][0][0] - bb[b][0][0]; });
    const bbsX = keylistX.map((item, _1, _2) => { return bb[item]; });

    let keylistY = Object.keys(grouped_formulas);
    // Sort the keys by the y-axis of the upper-left corner of their bounding boxes.
    keylistY.sort((a, b) => { return bb[a][0][1] - bb[b][0][1]; });
    const bbsY = keylistY.map((item, _1, _2) => { return bb[item]; });


    //    console.log("keylist now = " + JSON.stringify(keylist));

    for (let key of Object.keys(grouped_formulas)) {
        for (let i = 0; i < aNum[key].length; i++) {
            const matches = find_all_matching_rectangles(key, aNum[key][i], aNum, keylistX, keylistY, x_ul, x_lr, bb, bbsX, bbsY);
            all_matches = all_matches.concat(matches);
            count++;
            if (count % 1000 === 0) {
                //                console.log('find_all_proposed_fixes, iteration ' + count);
            }
        }
    }
    if (false) {
        all_matches = all_matches.map((x, _1, _2) => {
            return [x[0].map((a, _1, _2) => Number(a)),
            x[1].map((a, _1, _2) => Number(a))];
        });
    }
    //    console.log("before: " + JSON.stringify(all_matches));
    all_matches = all_matches.map((x, _1, _2) => {
        if (numComparator(x[1], x[2]) < 0) {
            return [x[0], x[2], x[1]];
        } else {
            return [x[0], x[1], x[2]];
        }
    });
    all_matches = dedup(all_matches);
    //    console.log("after: " + JSON.stringify(all_matches));
    //    t.split("done.");
    return all_matches;
}

export function test_find_all_proposed_fixes(grouped_formulas) {
    comparisons = 0;
    const all_fixes = find_all_proposed_fixes(grouped_formulas);
    console.log('all matches = ' + JSON.stringify(all_fixes));
    //    console.log("comparisons = " + comparisons);
    let theLength = 0;
    for (let k of Object.keys(grouped_formulas)) {
        theLength += grouped_formulas[k].length;
    }
    console.log('total length of grouped_formulas = ' + theLength);
}

//let r = require('./grouped_formulas.js');
//test_find_all_proposed_fixes(r.grouped_formulas);


