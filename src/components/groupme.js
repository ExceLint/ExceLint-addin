"use strict";
exports.__esModule = true;
var binsearch_1 = require("./binsearch");
var colorize_1 = require("./colorize");
var timer_1 = require("./timer");
// Enable reasonable comparisons of numbers by converting them to zero-padded strings
// so that 9 < 56 (because "0009" < "0056").
function fix(n) {
    return n.toString().padStart(10, '0');
}
// Apply fixes to an array.
function fix_array(arr) {
    return arr.map(function (x, _1, _2) { return fix(x); });
}
// Apply fixes to a pair.
function fix_pair(p) {
    var p1 = p[0], p2 = p[1];
    return [fix_array(p1), fix_array(p2)];
}
// A comparison function to sort by x-coordinate.
function sort_x_coord(a, b) {
    var a1 = a[0], a2 = a[1];
    var b1 = b[0], b2 = b[1];
    if (a1[0] != b1[0]) {
        return (a1[0] - b1[0]);
    }
    else {
        return (a1[1] - b1[1]);
    }
}
// A comparison function to sort by y-coordinate.
function sort_y_coord(a, b) {
    var a1 = a[0], a2 = a[1];
    var b1 = b[0], b2 = b[1];
    if (a1[1] != b1[1]) {
        return (a1[1] - b1[1]);
    }
    else {
        return (a1[0] - b1[0]);
    }
}
function generate_bounding_box(g) {
    var bb = {};
    for (var _i = 0, _a = Object.keys(g); _i < _a.length; _i++) {
        var i = _a[_i];
        //	console.log("length of formulas for " + i + " = " + g[i].length);
        var xMin = 1000000;
        var yMin = 1000000;
        var xMax = -1000000;
        var yMax = -1000000;
        for (var j = 0; j < g[i].length; j++) {
            var x1 = g[i][j][0][0];
            var x2 = g[i][j][1][0];
            var y1 = g[i][j][0][1];
            var y2 = g[i][j][1][1];
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
    for (var _i = 0, _a = Object.keys(g); _i < _a.length; _i++) {
        var i = _a[_i];
        newGnum[i] = g[i].sort(sort_x_coord).map(function (x, _1, _2) {
            return [x[0].map(function (a, _1, _2) { return Number(a); }),
                x[1].map(function (a, _1, _2) { return Number(a); })];
        });
    }
}
// Knuth-Fisher-Yates shuffle (not currently used).
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
//test_binsearch();
var comparisons = 0;
function numComparator(a_val, b_val) {
    for (var i = 0; i < 3; i++) { // note: length of excelint vector
        if (a_val[i] < b_val[i]) {
            return -1;
        }
        if (a_val[i] > b_val[i]) {
            return 1;
        }
    }
    return 0;
}
function matching_rectangles(rect_ul, rect_lr, rect_uls, rect_lrs) {
    // Assumes uls and lrs are already sorted and the same length.
    var x1 = rect_ul[0];
    var y1 = rect_ul[1];
    var x2 = rect_lr[0];
    var y2 = rect_lr[1];
    // Try to find something adjacent to A = [[x1, y1, 0], [x2, y2, 0]]
    // options are:
    //   [x1-1, y2] left (lower-right)   [ ] [A] --> [ (?, y1) ... (x1-1, y2) ]
    //   [x2, y1-1] up (lower-right)     [ ]
    //                                   [A] --> [ (x1, ?) ... (x2, y1-1) ]
    //   [x2+1, y1] right (upper-left)   [A] [ ] --> [ (x2 + 1, y1) ... (?, y2) ]
    //   [x1, y2+1] down (upper-left)    [A]
    //                                   [ ] --> [ (x1, y2+1) ... (x2, ?) ]
    // left (lr) = ul_x, lr_y
    var left = [x1 - 1, y2, 0];
    // up (lr) = lr_x, ul_y
    var up = [x2, y1 - 1, 0];
    // right (ul) = lr_x, ul_y
    var right = [x2 + 1, y1, 0];
    // down (ul) = ul_x, lr_y
    var down = [x1, y2 + 1, 0];
    var matches = [];
    var ind = -1;
    ind = binsearch_1.strict_binsearch(rect_lrs, left, numComparator);
    //	console.log("left = " + ind);
    if (ind != -1) {
        if (rect_uls[ind][1] === y1) {
            var candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    ind = binsearch_1.strict_binsearch(rect_lrs, up, numComparator);
    //	console.log("up = " + ind);
    if (ind != -1) {
        if (rect_uls[ind][0] === x1) {
            var candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    ind = binsearch_1.strict_binsearch(rect_uls, right, numComparator);
    //	console.log("right = " + ind);
    if (ind != -1) {
        if (rect_lrs[ind][1] === y2) {
            var candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    ind = binsearch_1.strict_binsearch(rect_uls, down, numComparator);
    //	console.log("down = " + ind);
    if (ind != -1) {
        if (rect_lrs[ind][0] === x2) {
            var candidate = [rect_uls[ind], rect_lrs[ind]];
            matches.push(candidate);
        }
    }
    return matches;
}
var rectangles_count = 0;
function find_all_matching_rectangles(thisKey, rect, grouped_formulas, keylistX, keylistY, x_ul, x_lr, bb, bbsX, bbsY) {
    var base_ul = rect[0], base_lr = rect[1];
    //    console.log("Looking for matches of " + JSON.stringify(base_ul) + ", " + JSON.stringify(base_lr));
    var match_list = [];
    var a = grouped_formulas;
    //	console.log("total formulas = " + keylist.length);
    //	console.log(JSON.stringify(bbs));
    var ind1 = binsearch_1.binsearch(bbsX, rect, (function (a, b) { return a[0][0] - b[0][0]; }));
    var ind2 = binsearch_1.binsearch(bbsY, rect, (function (a, b) { return a[0][1] - b[0][1]; }));
    //	console.log("ind1 = " + ind1 + ", ind2 = " + ind2);
    // Pick the coordinate axis that takes us the furthest in the list.
    var keylist;
    var axis;
    var ind;
    if (ind1 > ind2) {
        keylist = keylistX;
        ind = ind1;
        axis = 0;
    }
    else {
        keylist = keylistY;
        ind = ind2;
        axis = 1;
    }
    if (ind > 0) {
        ind -= 1;
    }
    var _loop_1 = function (i) {
        var key = keylist[i];
        if (key === thisKey) {
            return "continue";
        }
        rectangles_count++;
        if (rectangles_count % 10000 === 0) {
            //	    if (true) { // rectangles_count % 1000 === 0) {
            console.log("find_all_matching_rectangles, iteration " + rectangles_count);
        }
        // Check bounding box.
        var box = bb[key];
        /* Since the keys are sorted in x-axis order,
           we can stop once we have gone too far on the x-axis to ever merge again;
           mutatis mutandis for the y-axis. */
        if (true) { // early stopping
            if (axis === 0) {
                /* [rect] ... [box]  */
                // if left side of box is too far away from right-most edge of the rectangle
                if (base_lr[0] + 1 < box[0][0]) {
                    return "break";
                }
            }
            else {
                /* [rect]
                           ...
                   [box]  */
                // if the top side of box is too far away from bottom-most edge of the rectangle
                if (base_lr[1] + 1 < box[0][1]) {
                    return "break";
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
        }
        else {
            var matches = matching_rectangles(base_ul, base_lr, x_ul[key], x_lr[key]);
            if (matches.length > 0) {
                //		    console.log("found matches for key "+key+" --> " + JSON.stringify(matches));
                match_list = match_list.concat(matches.map(function (item, _1, _2) {
                    var metric = colorize_1.Colorize.fix_metric(parseFloat(thisKey), rect, parseFloat(key), item);
                    return [metric, rect, item];
                }));
            }
        }
    };
    // ind = 0; // FIXME FIXME
    //	console.log("found the item " + JSON.stringify(rect) + " at position = " + ind);
    for (var i = ind; i < keylist.length; i++) {
        var state_1 = _loop_1(i);
        if (state_1 === "break")
            break;
    }
    //	console.log("match_list = " + JSON.stringify(match_list));
    //	t.split("done.");
    ///	console.log("find_all_matching_rectangles, iteration " + rectangles_count);
    return match_list;
}
// Returns an array with all duplicated entries removed.
function dedup(arr) {
    var t = {};
    return arr.filter(function (e) { return !(t[e] = e in t); });
}
function find_all_proposed_fixes(grouped_formulas) {
    var t = new timer_1.Timer("find_all_proposed_fixes");
    var all_matches = [];
    var count = 0;
    rectangles_count = 0;
    var aNum = {};
    fix_grouped_formulas(grouped_formulas, aNum);
    var x_ul = {};
    var x_lr = {};
    for (var _i = 0, _a = Object.keys(grouped_formulas); _i < _a.length; _i++) {
        var key = _a[_i];
        x_ul[key] = aNum[key].map(function (i, _1, _2) { var p1 = i[0], p2 = i[1]; return p1; });
        x_lr[key] = aNum[key].map(function (i, _1, _2) { var p1 = i[0], p2 = i[1]; return p2; });
    }
    t.split("generated upper left and lower right arrays.");
    var bb = generate_bounding_box(grouped_formulas);
    t.split("generated bounding box.");
    var keylistX = Object.keys(grouped_formulas);
    //    console.log("keylist was = " + JSON.stringify(keylist));
    // Sort the keys by the x-axis of the upper-left corner of their bounding boxes.
    keylistX.sort(function (a, b) { return bb[a][0][0] - bb[b][0][0]; });
    var bbsX = keylistX.map(function (item, _1, _2) { return bb[item]; });
    var keylistY = Object.keys(grouped_formulas);
    // Sort the keys by the y-axis of the upper-left corner of their bounding boxes.
    keylistY.sort(function (a, b) { return bb[a][0][1] - bb[b][0][1]; });
    var bbsY = keylistY.map(function (item, _1, _2) { return bb[item]; });
    //    console.log("keylist now = " + JSON.stringify(keylist));
    for (var _b = 0, _c = Object.keys(grouped_formulas); _b < _c.length; _b++) {
        var key = _c[_b];
        for (var i = 0; i < aNum[key].length; i++) {
            var matches = find_all_matching_rectangles(key, aNum[key][i], aNum, keylistX, keylistY, x_ul, x_lr, bb, bbsX, bbsY);
            all_matches = all_matches.concat(matches);
            count++;
            if (count % 1000 == 0) {
                console.log("find_all_proposed_fixes, iteration " + count);
            }
        }
    }
    if (false) {
        all_matches = all_matches.map(function (x, _1, _2) {
            return [x[0].map(function (a, _1, _2) { return Number(a); }),
                x[1].map(function (a, _1, _2) { return Number(a); })];
        });
    }
    //    console.log("before: " + JSON.stringify(all_matches));
    all_matches = all_matches.map(function (x, _1, _2) {
        if (numComparator(x[1], x[2]) < 0) {
            return [x[0], x[2], x[1]];
        }
        else {
            return [x[0], x[1], x[2]];
        }
    });
    all_matches = dedup(all_matches);
    //    console.log("after: " + JSON.stringify(all_matches));
    t.split("done.");
    return all_matches;
}
exports.find_all_proposed_fixes = find_all_proposed_fixes;
function test_find_all_proposed_fixes(grouped_formulas) {
    comparisons = 0;
    var all_fixes = find_all_proposed_fixes(grouped_formulas);
    //    console.log("all matches = " + JSON.stringify(all_fixes));
    //    console.log("comparisons = " + comparisons);
    var theLength = 0;
    for (var _i = 0, _a = Object.keys(grouped_formulas); _i < _a.length; _i++) {
        var k = _a[_i];
        theLength += grouped_formulas[k].length;
    }
    console.log("total length of grouped_formulas = " + theLength);
}
exports.test_find_all_proposed_fixes = test_find_all_proposed_fixes;
//let r = require('./grouped_formulas.js');
//test_find_all_proposed_fixes(r.grouped_formulas);
