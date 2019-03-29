"use strict";
exports.__esModule = true;
var colorutils_1 = require("./colorutils");
var Colorize = /** @class */ (function () {
    function Colorize() {
    }
    Colorize.initialize = function () {
        if (!Colorize.initialized) {
            Colorize.make_light_color_versions();
            for (var _i = 0, _a = Object.keys(Colorize.light_color_dict); _i < _a.length; _i++) {
                var i = _a[_i];
                Colorize.color_list.push(i);
                Colorize.light_color_list.push(Colorize.light_color_dict[i]);
            }
            Colorize.initialized = true;
        }
    };
    Colorize.get_color = function (hashval) {
        return Colorize.color_list[hashval % Colorize.color_list.length];
    };
    Colorize.make_light_color_versions = function () {
        //		console.log('YO');
        for (var i = 0; i < 255; i += 7) {
            var rgb = colorutils_1.ColorUtils.HSVtoRGB(i / 255.0, .5, .75);
            var _a = rgb.map(function (x) { return Math.round(x).toString(16).padStart(2, '0'); }), rs = _a[0], gs = _a[1], bs = _a[2];
            var str = '#' + rs + gs + bs;
            str = str.toUpperCase();
            Colorize.light_color_dict[str] = '';
        }
        for (var color in Colorize.light_color_dict) {
            var lightstr = Colorize.adjust_color(color, 2.0);
            var darkstr = color; // = Colorize.adjust_color(color, 0.25);
            //			console.log(str);
            //			console.log('Old RGB = ' + color + ', new = ' + str);
            delete Colorize.light_color_dict[color];
            Colorize.light_color_dict[darkstr] = lightstr;
        }
    };
    Colorize.adjust_color = function (color, multiplier) {
        var c = Colorize.rgb_ex.exec(color);
        var _a = [parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16)], r = _a[0], g = _a[1], b = _a[2];
        var _b = colorutils_1.ColorUtils.RGBtoHSV(r, g, b), h = _b[0], s = _b[1], v = _b[2];
        v = multiplier * v;
        if (v <= 0.0) {
            v = 0.0;
        }
        if (v >= 1.0) {
            v = 0.99;
        }
        var rgb = colorutils_1.ColorUtils.HSVtoRGB(h, s, v);
        var _c = rgb.map(function (x) { return Math.round(x).toString(16).padStart(2, '0'); }), rs = _c[0], gs = _c[1], bs = _c[2];
        var str = '#' + rs + gs + bs;
        str = str.toUpperCase();
        return str;
    };
    Colorize.get_light_color_version = function (color) {
        return Colorize.light_color_dict[color];
    };
    /*
      private static transpose(array) {
      array[0].map((col, i) => array.map(row => row[i]));
      }
    */
    Colorize.process_formulas = function (formulas, origin_col, origin_row) {
        var output = [];
        // Build up all of the columns of colors.
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                if ((row[j].length > 0) && (row[j][0] === '=')) {
                    var vec = Colorize.dependencies(row[j], j + origin_col, i + origin_row);
                    var hash = Colorize.hash_vector(vec);
                    output.push([[j + origin_col + 1, i + origin_row + 1], hash.toString()]);
                }
            }
        }
        return output;
    };
    Colorize.color_all_data = function (formulas, processed_formulas, origin_col, origin_row) {
        //console.log('color_all_data');
        var refs = Colorize.generate_all_references(formulas, origin_col, origin_row);
        var data_color = {};
        var processed_data = [];
        // Generate all formula colors (as a dict).
        var formula_hash = {};
        for (var _i = 0, processed_formulas_1 = processed_formulas; _i < processed_formulas_1.length; _i++) {
            var f = processed_formulas_1[_i];
            var formula_vec = f[0];
            formula_hash[formula_vec.join(',')] = f[1];
        }
        // Color all references based on the color of their referring formula.
        for (var _a = 0, _b = Object.keys(refs); _a < _b.length; _a++) {
            var refvec = _b[_a];
            for (var _c = 0, _d = refs[refvec]; _c < _d.length; _c++) {
                var r = _d[_c];
                var hash = formula_hash[r.join(',')];
                if (!(hash === undefined)) {
                    var rv = JSON.parse('[' + refvec + ']');
                    var row = parseInt(rv[0], 10);
                    var col = parseInt(rv[1], 10);
                    var rj = [row, col].join(',');
                    if (!(rj in formula_hash)) {
                        if (!(rj in data_color)) {
                            processed_data.push([[row, col], hash]);
                            data_color[rj] = hash;
                        }
                    }
                }
            }
        }
        return processed_data;
    };
    Colorize.hash = function (str) {
        // From https://github.com/darkskyapp/string-hash
        var hash = 5381, i = str.length;
        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }
        /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
        * integers. Since we want the results to be always positive, convert the
        * signed int to an unsigned by doing an unsigned bitshift. */
        return hash >>> 0;
    };
    // Convert an Excel column name (a string of alphabetical charcaters) into a number.
    Colorize.column_name_to_index = function (name) {
        if (name.length === 1) { // optimizing for the overwhelmingly common case
            return name[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        }
        var value = 0;
        var reversed_name = name.split('').reverse();
        for (var _i = 0, reversed_name_1 = reversed_name; _i < reversed_name_1.length; _i++) {
            var i = reversed_name_1[_i];
            value *= 26;
            value = (i.charCodeAt(0) - 'A'.charCodeAt(0)) + 1;
        }
        return value;
    };
    // Convert a column number to a name (as in, 3 => 'C').
    Colorize.column_index_to_name = function (index) {
        var str = '';
        while (index > 0) {
            str += String.fromCharCode((index - 1) % 26 + 65); // 65 = 'A'
            index = Math.floor(index / 26);
        }
        return str.split('').reverse().join('');
    };
    // Take in a list of [[row, col], color] pairs and group them,
    // sorting them (e.g., by columns).
    Colorize.identify_ranges = function (list, sortfn) {
        // Separate into groups based on their string value.
        var groups = {};
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var r = list_1[_i];
            groups[r[1]] = groups[r[1]] || [];
            groups[r[1]].push(r[0]);
        }
        // Now sort them all.
        for (var _a = 0, _b = Object.keys(groups); _a < _b.length; _a++) {
            var k = _b[_a];
            //	console.log(k);
            groups[k].sort(sortfn);
            //	console.log(groups[k]);
        }
        return groups;
    };
    Colorize.group_ranges = function (groups, columnFirst) {
        var output = {};
        var index0 = 0; // column
        var index1 = 1; // row
        if (!columnFirst) {
            index0 = 1; // row
            index1 = 0; // column
        }
        for (var _i = 0, _a = Object.keys(groups); _i < _a.length; _i++) {
            var k = _a[_i];
            output[k] = [];
            var prev = groups[k].shift();
            var last = prev;
            for (var _b = 0, _c = groups[k]; _b < _c.length; _b++) {
                var v = _c[_b];
                // Check if in the same column, adjacent row (if columnFirst; otherwise, vice versa).
                if ((v[index0] === last[index0]) && (v[index1] === last[index1] + 1)) {
                    last = v;
                }
                else {
                    output[k].push([prev, last]);
                    prev = v;
                    last = v;
                }
            }
            output[k].push([prev, last]);
        }
        return output;
    };
    Colorize.identify_groups = function (list) {
        var columnsort = function (a, b) { if (a[0] === b[0]) {
            return a[1] - b[1];
        }
        else {
            return a[0] - b[0];
        } };
        var id = Colorize.identify_ranges(list, columnsort);
        var gr = Colorize.group_ranges(id, true); // column-first
        // Now try to merge stuff with the same hash.
        var newGr1 = JSON.parse(JSON.stringify(gr)); // deep copy
        var newGr2 = JSON.parse(JSON.stringify(gr)); // deep copy
        var mr = Colorize.mergeable(newGr1);
        var mg = Colorize.merge_groups(newGr2, mr);
        return mg;
    };
    // True if combining A and B would result in a new rectangle.
    Colorize.merge_friendly = function (A, B) {
        var _a = A[0], Ax0 = _a[0], Ay0 = _a[1], _b = A[1], Ax1 = _b[0], Ay1 = _b[1];
        var _c = B[0], Bx0 = _c[0], By0 = _c[1], _d = B[1], Bx1 = _d[0], By1 = _d[1];
        if ((Ax0 === Bx0) && (Ax1 === Bx1)) {
            if (Ay0 === By1 + 1) {
                // top
                return true;
            }
            if (Ay1 + 1 === By0) {
                // bottom
                return true;
            }
        }
        if ((Ay0 === By0) && (Ay1 === By1)) {
            if (Ax0 === Bx1 + 1) {
                // left
                return true;
            }
            if (Ax1 + 1 === Bx0) {
                // right
                return true;
            }
        }
        return false;
    };
    // Return a merged version (both should be 'merge friendly').
    Colorize.merge_rectangles = function (A, B) {
        var _a = A[0], Ax0 = _a[0], Ay0 = _a[1], _b = A[1], Ax1 = _b[0], Ay1 = _b[1];
        var _c = B[0], Bx0 = _c[0], By0 = _c[1], _d = B[1], Bx1 = _d[0], By1 = _d[1];
        if ((Ax0 === Bx0) && (Ax1 === Bx1)) {
            if (Ay0 === By1 + 1) {
                // top
                return [[Bx0, By0], [Ax0, Ay1]];
            }
            if (Ay1 + 1 === By0) {
                // bottom
                return [[Ax0, Ay0], [Bx1, By1]];
            }
        }
        if ((Ay0 === By0) && (Ay1 === By1)) {
            if (Ax0 === Bx1 + 1) {
                // left
                return [[Bx0, By0], [Ax1, Ay1]];
            }
            if (Ax1 + 1 === Bx0) {
                // right
                return [[Ax0, Ay0], [Bx1, By1]];
            }
        }
        return [[-1, -1], [-1, -1]]; //FIXME should throw an exception here
    };
    Colorize.merge_groups = function (groups, merge_candidates) {
        var _a;
        // Groups already passed as input to mergeable.
        // Merge_candidates generated by mergeable.
        // Go through all mergeable groups; for each, remove the corresponding two rectangles and add the merged one.
        var merged_rectangles = {};
        var previous_merged_rectangles = {};
        var numIterations = 0;
        while (true) {
            numIterations++;
            //	    console.log('iterating');
            previous_merged_rectangles = JSON.parse(JSON.stringify(merged_rectangles));
            for (var _i = 0, _b = Object.keys(merge_candidates); _i < _b.length; _i++) {
                var k = _b[_i];
                var to_be_merged_rectangles = [];
                var removed = {};
                for (var _c = 0, _d = merge_candidates[k]; _c < _d.length; _c++) {
                    var range = _d[_c];
                    var first = range[0];
                    var second = range[1];
                    // Add these to be removed later.
                    removed[JSON.stringify(first)] = true;
                    removed[JSON.stringify(second)] = true;
                    //console.log('1. marking for removal ' + JSON.stringify(first));
                    //console.log('2. marking for removal ' + JSON.stringify(second));
                    var merged = Colorize.merge_rectangles(first, second);
                    to_be_merged_rectangles.push(merged);
                }
                var newList = [];
                for (var i = 0; i < groups[k].length; i++) {
                    var v = groups[k][i];
                    var str = JSON.stringify(v);
                    if (!(str in removed)) {
                        newList.push(groups[k][i]);
                    }
                }
                merged_rectangles[k] = newList;
                (_a = merged_rectangles[k]).push.apply(_a, to_be_merged_rectangles);
            }
            if (JSON.stringify(merged_rectangles) === JSON.stringify(previous_merged_rectangles)) {
                break;
            }
            else {
                //console.log(JSON.stringify(merged_rectangles));
                //console.log(JSON.stringify(previous_merged_rectangles));
            }
        }
        return merged_rectangles;
    };
    Colorize.mergeable = function (grouped_ranges) {
        // Input comes from group_ranges.
        var mergeable = {};
        for (var _i = 0, _a = Object.keys(grouped_ranges); _i < _a.length; _i++) {
            var k = _a[_i];
            mergeable[k] = [];
            var r = grouped_ranges[k];
            var _loop_1 = function () {
                var head = r.shift();
                var merge_candidates = r.filter(function (b) { return Colorize.merge_friendly(head, b); });
                if (merge_candidates.length > 0) {
                    for (var _i = 0, merge_candidates_1 = merge_candidates; _i < merge_candidates_1.length; _i++) {
                        var c = merge_candidates_1[_i];
                        mergeable[k].push([head, c]);
                    }
                }
            };
            while (r.length > 0) {
                _loop_1();
            }
        }
        return mergeable;
    };
    // Returns a vector (x, y) corresponding to the column and row of the computed dependency.
    Colorize.cell_dependency = function (cell, origin_col, origin_row) {
        {
            var r = Colorize.cell_col_absolute.exec(cell);
            if (r) {
                //	    console.log(JSON.stringify(r));
                var col = Colorize.column_name_to_index(r[1]);
                var row = parseInt(r[2], 10);
                //	    console.log('absolute col: ' + col + ', row: ' + row);
                return [col, row - origin_row];
            }
        }
        {
            var r = Colorize.cell_both_relative.exec(cell);
            if (r) {
                //	    console.log('both_relative');
                var col = Colorize.column_name_to_index(r[1]);
                var row = parseInt(r[2], 10);
                return [col - origin_col, row - origin_row];
            }
        }
        {
            var r = Colorize.cell_row_absolute.exec(cell);
            if (r) {
                //	    console.log('row_absolute');
                var col = Colorize.column_name_to_index(r[1]);
                var row = parseInt(r[2], 10);
                return [col - origin_col, row];
            }
        }
        {
            var r = Colorize.cell_both_absolute.exec(cell);
            if (r) {
                //	    console.log('both_absolute');
                var col = Colorize.column_name_to_index(r[1]);
                var row = parseInt(r[2], 10);
                return [col, row];
            }
        }
        throw new Error('We should never get here.');
        return [0, 0];
    };
    Colorize.all_cell_dependencies = function (range) {
        var found_pair = null;
        var all_vectors = [];
        /// FIX ME - should we count the same range multiple times? Or just once?
        // First, get all the range pairs out.
        while (found_pair = Colorize.range_pair.exec(range)) {
            if (found_pair) {
                //		console.log('all_cell_dependencies --> ' + found_pair);
                var first_cell = found_pair[1];
                //		console.log(' first_cell = ' + first_cell);
                var first_vec = Colorize.cell_dependency(first_cell, 0, 0);
                //		console.log(' first_vec = ' + JSON.stringify(first_vec));
                var last_cell = found_pair[2];
                //		console.log(' last_cell = ' + last_cell);
                var last_vec = Colorize.cell_dependency(last_cell, 0, 0);
                //		console.log(' last_vec = ' + JSON.stringify(last_vec));
                // First_vec is the upper-left hand side of a rectangle.
                // Last_vec is the lower-right hand side of a rectangle.
                // Generate all vectors.
                var length_1 = last_vec[0] - first_vec[0] + 1;
                var width = last_vec[1] - first_vec[1] + 1;
                for (var x = 0; x < length_1; x++) {
                    for (var y = 0; y < width; y++) {
                        // console.log(' pushing ' + (x + first_vec[0]) + ', ' + (y + first_vec[1]));
                        // console.log(' (x = ' + x + ', y = ' + y);
                        all_vectors.push([x + first_vec[0], y + first_vec[1]]);
                    }
                }
                // Wipe out the matched contents of range.
                var newRange = range.replace(found_pair[0], '_'.repeat(found_pair[0].length));
                range = newRange;
            }
        }
        // Now look for singletons.
        var singleton = null;
        while (singleton = Colorize.single_dep.exec(range)) {
            if (singleton) {
                //		console.log('SINGLETON');
                //		console.log('singleton[1] = ' + singleton[1]);
                //	    console.log(found_pair);
                var first_cell = singleton[1];
                //		console.log(first_cell);
                var vec = Colorize.cell_dependency(first_cell, 0, 0);
                all_vectors.push(vec);
                // Wipe out the matched contents of range.
                var newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
                range = newRange;
            }
        }
        return all_vectors;
    };
    Colorize.dependencies = function (range, origin_col, origin_row) {
        var base_vector = [0, 0];
        var found_pair = null;
        /// FIX ME - should we count the same range multiple times? Or just once?
        // First, get all the range pairs out.
        while (found_pair = Colorize.range_pair.exec(range)) {
            if (found_pair) {
                //	    console.log(found_pair);
                var first_cell = found_pair[1];
                //		console.log(first_cell);
                var first_vec = Colorize.cell_dependency(first_cell, origin_col, origin_row);
                var last_cell = found_pair[2];
                //		console.log(last_cell);
                var last_vec = Colorize.cell_dependency(last_cell, origin_col, origin_row);
                // First_vec is the upper-left hand side of a rectangle.
                // Last_vec is the lower-right hand side of a rectangle.
                // Compute the appropriate vectors to be added.
                // e.g., [3, 2] --> [5, 5] ===
                //          [3, 2], [3, 3], [3, 4], [3, 5]
                //          [4, 2], [4, 3], [4, 4], [4, 5]
                //          [5, 2], [5, 3], [5, 4], [5, 5]
                //
                // vector to be added is [4 * (3 + 4 + 5), 3 * (2 + 3 + 4 + 5) ]
                //  = [48, 42]
                var sum_x = 0;
                var sum_y = 0;
                var width = last_vec[1] - first_vec[1] + 1; // 4
                sum_x = width * ((last_vec[0] * (last_vec[0] + 1)) / 2 - ((first_vec[0] - 1) * ((first_vec[0] - 1) + 1)) / 2);
                var length_2 = last_vec[0] - first_vec[0] + 1; // 3
                sum_y = length_2 * ((last_vec[1] * (last_vec[1] + 1)) / 2 - ((first_vec[1] - 1) * ((first_vec[1] - 1) + 1)) / 2);
                base_vector[0] += sum_x;
                base_vector[1] += sum_y;
                // Wipe out the matched contents of range.
                var newRange = range.replace(found_pair[0], '_'.repeat(found_pair[0].length));
                range = newRange;
            }
        }
        // Now look for singletons.
        var singleton = null;
        while (singleton = Colorize.single_dep.exec(range)) {
            if (singleton) {
                //	    console.log(found_pair);
                var first_cell = singleton[1];
                //		console.log(first_cell);
                var vec = Colorize.cell_dependency(first_cell, origin_col, origin_row);
                base_vector[0] += vec[0];
                base_vector[1] += vec[1];
                // Wipe out the matched contents of range.
                var newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
                range = newRange;
            }
        }
        return base_vector;
    };
    Colorize.generate_all_references = function (formulas, origin_col, origin_row) {
        // Generate all references.
        var refs = {};
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                // console.log('origin_col = '+origin_col+', origin_row = ' + origin_row);
                var all_deps = Colorize.all_cell_dependencies(row[j]); // , origin_col + j, origin_row + i);
                if (all_deps.length > 0) {
                    // console.log(all_deps);
                    var src = [origin_col + j, origin_row + i];
                    // console.log('src = ' + src);
                    for (var _i = 0, all_deps_1 = all_deps; _i < all_deps_1.length; _i++) {
                        var dep = all_deps_1[_i];
                        var dep2 = dep; // [dep[0]+origin_col, dep[1]+origin_row];
                        //				console.log('dep type = ' + typeof(dep));
                        //				console.log('dep = '+dep);
                        refs[dep2.join(',')] = refs[dep2.join(',')] || [];
                        refs[dep2.join(',')].push(src);
                        // console.log('refs[' + dep2.join(',') + '] = ' + JSON.stringify(refs[dep2.join(',')]));
                    }
                }
            }
        }
        return refs;
    };
    Colorize.extract_sheet_cell = function (str) {
        var matched = Colorize.sheet_plus_cell.exec(str);
        if (matched) {
            return [matched[1], matched[2], matched[3]];
        }
        return ['', '', ''];
    };
    Colorize.extract_sheet_range = function (str) {
        var matched = Colorize.sheet_plus_range.exec(str);
        if (matched) {
            return [matched[1], matched[2], matched[3]];
        }
        return ['', '', ''];
    };
    Colorize.hash_vector = function (vec) {
        // Return a hash of the given vector.
        var h = Colorize.hash(JSON.stringify(vec) + 'NONCE01');
        return h;
    };
    // Matchers for all kinds of Excel expressions.
    Colorize.general_re = '\\$?[A-Z]+\\$?\\d+'; // column and row number, optionally with $
    Colorize.sheet_re = '[^\\!]+';
    Colorize.sheet_plus_cell = new RegExp('(' + Colorize.sheet_re + ')\\!(' + Colorize.general_re + ')');
    Colorize.sheet_plus_range = new RegExp('(' + Colorize.sheet_re + ')\\!(' + Colorize.general_re + '):(' + Colorize.general_re + ')');
    Colorize.single_dep = new RegExp('(' + Colorize.general_re + ')');
    Colorize.range_pair = new RegExp('(' + Colorize.general_re + '):(' + Colorize.general_re + ')', 'g');
    Colorize.cell_both_relative = new RegExp('[^\\$]?([A-Z]+)(\\d+)');
    Colorize.cell_col_absolute = new RegExp('\\$([A-Z]+)[^\\$\\d]?(\\d+)');
    Colorize.cell_row_absolute = new RegExp('[^\\$]?([A-Z]+)\\$(\\d+)');
    Colorize.cell_both_absolute = new RegExp('\\$([A-Z]+)\\$(\\d+)');
    Colorize.rgb_ex = new RegExp('#([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])');
    Colorize.initialized = false;
    Colorize.color_list = [];
    Colorize.light_color_list = [];
    Colorize.light_color_dict = {};
    return Colorize;
}());
exports.Colorize = Colorize;
//console.log(Colorize.dependencies('$C$2:$E$5', 10, 10));
//console.log(Colorize.dependencies('$A$123,A1:B$12,$A12:$B$14', 10, 10));
//console.log(Colorize.hash_vector(Colorize.dependencies('$C$2:$E$5', 10, 10)));
