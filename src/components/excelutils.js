"use strict";
// excel-utils
exports.__esModule = true;
var ExcelUtils = /** @class */ (function () {
    function ExcelUtils() {
    }
    // Convert an Excel column name (a string of alphabetical charcaters) into a number.
    ExcelUtils.column_name_to_index = function (name) {
        if (name.length === 1) { // optimizing for the overwhelmingly common case
            return name[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        }
        var value = 0;
        var split_name = name.split('');
        for (var _i = 0, split_name_1 = split_name; _i < split_name_1.length; _i++) {
            var i = split_name_1[_i];
            value *= 26;
            value += (i.charCodeAt(0) - 'A'.charCodeAt(0)) + 1;
        }
        return value;
    };
    // Convert a column number to a name (as in, 3 => 'C').
    ExcelUtils.column_index_to_name = function (index) {
        var str = '';
        while (index > 0) {
            str += String.fromCharCode((index - 1) % 26 + 65); // 65 = 'A'
            index = Math.floor((index - 1) / 26);
        }
        return str.split('').reverse().join('');
    };
    // Returns a vector (x, y) corresponding to the column and row of the computed dependency.
    ExcelUtils.cell_dependency = function (cell, origin_col, origin_row) {
        {
            var r_1 = ExcelUtils.cell_col_absolute.exec(cell);
            if (r_1) {
                //	    console.log(JSON.stringify(r));
                var col = ExcelUtils.column_name_to_index(r_1[1]);
                var row = parseInt(r_1[2], 10);
                //	    console.log('absolute col: ' + col + ', row: ' + row);
                return [col, row - origin_row];
            }
        }
        {
            var r_2 = ExcelUtils.cell_both_relative.exec(cell);
            if (r_2) {
                //			console.log("r = " + JSON.stringify(r));
                //			    	    console.log('both_relative: r[1] = ' + r[1]);
                var col = ExcelUtils.column_name_to_index(r_2[1]);
                var row = parseInt(r_2[2], 10);
                //			    	    console.log('both relative col: ' + col + ', row: ' + row);
                return [col - origin_col, row - origin_row];
            }
        }
        {
            var r_3 = ExcelUtils.cell_row_absolute.exec(cell);
            if (r_3) {
                //	    console.log('row_absolute');
                var col = ExcelUtils.column_name_to_index(r_3[1]);
                var row = parseInt(r_3[2], 10);
                return [col - origin_col, row];
            }
        }
        {
            var r_4 = ExcelUtils.cell_both_absolute.exec(cell);
            if (r_4) {
                //	    console.log('both_absolute');
                var col = ExcelUtils.column_name_to_index(r_4[1]);
                var row = parseInt(r_4[2], 10);
                return [col, row];
            }
        }
        throw new Error('We should never get here.');
        return [0, 0];
    };
    ExcelUtils.extract_sheet_cell = function (str) {
        var matched = ExcelUtils.sheet_plus_cell.exec(str);
        if (matched) {
            return [matched[1], matched[2], matched[3]];
        }
        return ['', '', ''];
    };
    ExcelUtils.extract_sheet_range = function (str) {
        var matched = ExcelUtils.sheet_plus_range.exec(str);
        if (matched) {
            return [matched[1], matched[2], matched[3]];
        }
        return ['', '', ''];
    };
    ExcelUtils.all_cell_dependencies = function (range) {
        var found_pair = null;
        var all_vectors = [];
        /// FIX ME - should we count the same range multiple times? Or just once?
        // First, get all the range pairs out.
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                //		console.log('all_cell_dependencies --> ' + found_pair);
                var first_cell = found_pair[1];
                //		console.log(' first_cell = ' + first_cell);
                var first_vec = ExcelUtils.cell_dependency(first_cell, 0, 0);
                //		console.log(' first_vec = ' + JSON.stringify(first_vec));
                var last_cell = found_pair[2];
                //		console.log(' last_cell = ' + last_cell);
                var last_vec = ExcelUtils.cell_dependency(last_cell, 0, 0);
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
        while (singleton = ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
                //		console.log('SINGLETON');
                //		console.log('singleton[1] = ' + singleton[1]);
                //	    console.log(found_pair);
                var first_cell = singleton[1];
                //		console.log(first_cell);
                var vec = ExcelUtils.cell_dependency(first_cell, 0, 0);
                all_vectors.push(vec);
                // Wipe out the matched contents of range.
                var newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
                range = newRange;
            }
        }
        //console.log(JSON.stringify(all_vectors));
        return all_vectors;
    };
    ExcelUtils.dependencies = function (range, origin_col, origin_row) {
        var base_vector = [0, 0];
        var found_pair = null;
        /// FIX ME - should we count the same range multiple times? Or just once?
        // First, get all the range pairs out.
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                //	    console.log(found_pair);
                var first_cell = found_pair[1];
                //		console.log(first_cell);
                var first_vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                var last_cell = found_pair[2];
                //		console.log(last_cell);
                var last_vec = ExcelUtils.cell_dependency(last_cell, origin_col, origin_row);
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
        while (singleton = ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
                //	    console.log(found_pair);
                var first_cell = singleton[1];
                //		console.log(first_cell);
                var vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                base_vector[0] += vec[0];
                base_vector[1] += vec[1];
                // Wipe out the matched contents of range.
                var newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
                range = newRange;
            }
        }
        return base_vector;
    };
    // Matchers for all kinds of Excel expressions.
    ExcelUtils.general_re = '\\$?[A-Z]+\\$?\\d+'; // column and row number, optionally with $
    ExcelUtils.sheet_re = '[^\\!]+';
    ExcelUtils.sheet_plus_cell = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + ')');
    ExcelUtils.sheet_plus_range = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')');
    ExcelUtils.single_dep = new RegExp('(' + ExcelUtils.general_re + ')');
    ExcelUtils.range_pair = new RegExp('(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')', 'g');
    ExcelUtils.cell_both_relative = new RegExp('[^\\$A-Z]?([A-Z]+)(\\d+)');
    ExcelUtils.cell_col_absolute = new RegExp('\\$([A-Z]+)[^\\$\\d]?(\\d+)');
    ExcelUtils.cell_row_absolute = new RegExp('[^\\$A-Z]?([A-Z]+)\\$(\\d+)');
    ExcelUtils.cell_both_absolute = new RegExp('\\$([A-Z]+)\\$(\\d+)');
    return ExcelUtils;
}());
exports.ExcelUtils = ExcelUtils;
