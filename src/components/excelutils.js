"use strict";
// excel-utils
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
exports.__esModule = true;
var sjcl = require("sjcl");
var rectangleutils_js_1 = require("./rectangleutils.js");
var ExcelUtils = /** @class */ (function () {
    function ExcelUtils() {
    }
    // Convert the UID string into a hashed version using SHA256, truncated to a max length.
    ExcelUtils.hash_sheet = function (uid, maxlen) {
        if (maxlen === void 0) { maxlen = 31; }
        // We can't just use the UID because it is too long to be a sheet name in Excel (limit is 31 characters).
        return (sjcl.codec.base32.fromBits(sjcl.hash.sha256.hash(uid)).slice(0, maxlen));
    };
    ExcelUtils.get_rectangle = function (proposed_fixes, current_fix) {
        if (!proposed_fixes) {
            return null;
        }
        if (proposed_fixes.length > 0) {
            // console.log("proposed_fixes = " + JSON.stringify(proposed_fixes));
            // console.log("current fix = " + current_fix);
            var r = rectangleutils_js_1.RectangleUtils.bounding_box(proposed_fixes[current_fix][1], proposed_fixes[current_fix][2]);
            // console.log("r = " + JSON.stringify(r));
            // convert to sheet notation
            var col0 = ExcelUtils.column_index_to_name(r[0][0]);
            var row0 = r[0][1].toString();
            var col1 = ExcelUtils.column_index_to_name(r[1][0]);
            var row1 = r[1][1].toString();
            return [col0, row0, col1, row1];
        }
        else {
            return null;
        }
    };
    // Convert an Excel column name (a string of alphabetical charcaters) into a number.
    ExcelUtils.column_name_to_index = function (name) {
        var e_1, _a;
        if (name.length === 1) { // optimizing for the overwhelmingly common case
            return name[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
        }
        var value = 0;
        var split_name = name.split('');
        try {
            for (var split_name_1 = __values(split_name), split_name_1_1 = split_name_1.next(); !split_name_1_1.done; split_name_1_1 = split_name_1.next()) {
                var i = split_name_1_1.value;
                value *= 26;
                value += (i.charCodeAt(0) - 'A'.charCodeAt(0)) + 1;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (split_name_1_1 && !split_name_1_1.done && (_a = split_name_1["return"])) _a.call(split_name_1);
            }
            finally { if (e_1) throw e_1.error; }
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
            var r = ExcelUtils.cell_both_absolute.exec(cell);
            if (r) {
                //console.log('both_absolute');
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                //console.log("parsed " + JSON.stringify([col, row]));
                return [col, row, 0];
            }
        }
        {
            var r = ExcelUtils.cell_col_absolute.exec(cell);
            if (r) {
                //console.log("cell col absolute only " + JSON.stringify(r));
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                //	    console.log('absolute col: ' + col + ', row: ' + row);
                return [col, row - origin_row, 0];
            }
        }
        {
            var r = ExcelUtils.cell_row_absolute.exec(cell);
            if (r) {
                //console.log('row_absolute');
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                return [col - origin_col, row, 0];
            }
        }
        {
            var r = ExcelUtils.cell_both_relative.exec(cell);
            if (r) {
                //console.log('both_relative: r[1] = ' + r[1] + ', r[2] = ' + r[2]);
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                //		console.log('both relative col: ' + col + ', row: ' + row);
                return [col - origin_col, row - origin_row, 0];
            }
        }
        // console.log("cell is "+cell);
        throw new Error('We should never get here.');
        return [0, 0, 0];
    };
    ExcelUtils.extract_sheet_cell = function (str) {
        //	console.log("extract_sheet_cell " + str);
        var matched = ExcelUtils.sheet_plus_cell.exec(str);
        if (matched) {
            //	    console.log("extract_sheet_cell matched " + str);
            // There is only one thing to match for this pattern: we convert it into a range.
            return [matched[1], matched[2], matched[2]];
        }
        //	console.log("extract_sheet_cell failed for "+str);
        return ['', '', ''];
    };
    ExcelUtils.extract_sheet_range = function (str) {
        var matched = ExcelUtils.sheet_plus_range.exec(str);
        if (matched) {
            //	    console.log("extract_sheet_range matched " + str);
            return [matched[1], matched[2], matched[3]];
        }
        //	console.log("extract_sheet_range failed to match " + str);
        return ExcelUtils.extract_sheet_cell(str);
    };
    ExcelUtils.all_cell_dependencies = function (range, origin_col, origin_row) {
        console.log("looking for dependencies in " + range);
        var found_pair = null;
        var all_vectors = [];
        if (typeof (range) !== 'string') {
            return null;
        }
        range = range.replace(this.formulas_with_numbers, '_'); // kind of a hack for now
        range = range.replace(this.formulas_with_quoted_sheetnames, '_'); // kind of a hack for now
        range = range.replace(this.formulas_with_unquoted_sheetnames, '_');
        /// FIX ME - should we count the same range multiple times? Or just once?
        // First, get all the range pairs out.
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                //		console.log('all_cell_dependencies --> ' + found_pair);
                var first_cell = found_pair[1];
                //		console.log(' first_cell = ' + first_cell);
                var first_vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                //		console.log(' first_vec = ' + JSON.stringify(first_vec));
                var last_cell = found_pair[2];
                //		console.log(' last_cell = ' + last_cell);
                var last_vec = ExcelUtils.cell_dependency(last_cell, origin_col, origin_row);
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
                        all_vectors.push([x + first_vec[0], y + first_vec[1], 0]);
                    }
                }
                // Wipe out the matched contents of range.
                range = range.replace(found_pair[0], '_');
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
                //                console.log(first_cell);
                var vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                all_vectors.push(vec);
                // Wipe out the matched contents of range.
                range = range.replace(singleton[0], '_');
            }
        }
        console.log("range is now " + range);
        // FIXME perhaps. For now, we are going to roll numbers in
        // formulas into the dependency vectors.  To keep this as a
        // metric, we want the distance between two vectors with two
        // numbers X and Y to have distance |X-Y|. To do this, we can
        // just put the number N in a single dimension. Rather than pick one,
        // we split it across two dimensions by adding sqrt(N^2/2) to each.
        // e.g., 8 adds sqrt(64/2) = sqrt(32) to both x and y.
        // Derivation:
        //   dist((0,0), (x, x) = sqrt(x^2 + x^2) = sqrt(2x^2)
        //   sqrt(2x^2) = Q
        //   2x^2 =  Q^2
        //   x^2 = Q^2/2
        //   x = sqrt(Q^2/2)
        var number = null;
        while (number = ExcelUtils.number_dep.exec(range)) {
            console.log("matched a number");
            if (number) {
                var n = parseFloat(number[1]);
                console.log("number = " + n);
                var q = Math.sqrt(n * n / 2);
                all_vectors.push([0, 0, n]);
                // Wipe out the matched contents of range.
                range = range.replace(number[0], '_');
            }
        }
        //console.log(JSON.stringify(all_vectors));
        return all_vectors;
    };
    ExcelUtils.baseVector = function () {
        return [0, 0, 0];
    };
    ExcelUtils.all_dependencies = function (row, col, origin_row, origin_col, formulas) {
        var deps = [];
        // Discard references to cells outside the formula range.
        if ((row >= formulas.length)
            || (col >= formulas[0].length)
            || (row < 0)
            || (col < 0)) {
            return [];
        }
        // Check if this cell is a formula.
        var cell = formulas[row][col];
        if ((cell.length > 1) && (cell[0] === "=")) {
            // It is. Compute the dependencies.
            console.log("ALL CELL DEPENDENCIES");
            deps = ExcelUtils.all_cell_dependencies(cell, origin_col, origin_row);
        }
        return deps;
    };
    ExcelUtils.generate_all_references = function (formulas, origin_col, origin_row) {
        var e_2, _a;
        origin_row = origin_row;
        origin_col = origin_col;
        var refs = {};
        var counter = 0;
        //	let all_deps = {};
        //	console.log(JSON.stringify(formulas));
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j];
                counter++;
                if (counter % 1000 == 0) {
                    console.log(counter + " references down");
                }
                // console.log('origin_col = '+origin_col+', origin_row = ' + origin_row);
                if (cell[0] === '=') { // It's a formula.
                    //		    let direct_refs = ExcelUtils.all_cell_dependencies(cell, origin_col + j, origin_row + i);
                    var direct_refs = ExcelUtils.all_cell_dependencies(cell, 0, 0); // origin_col, origin_row);
                    try {
                        for (var direct_refs_1 = __values(direct_refs), direct_refs_1_1 = direct_refs_1.next(); !direct_refs_1_1.done; direct_refs_1_1 = direct_refs_1.next()) {
                            var dep = direct_refs_1_1.value;
                            if ((dep[0] == 0) && (dep[1] == 0) && (dep[2] != 0)) {
                                // Not a real reference. Skip.
                            }
                            else {
                                var key = dep.join(',');
                                refs[key] = true;
                            }
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (direct_refs_1_1 && !direct_refs_1_1.done && (_a = direct_refs_1["return"])) _a.call(direct_refs_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                }
            }
        }
        return refs;
    };
    // Matchers for all kinds of Excel expressions.
    ExcelUtils.general_re = '\\$?[A-Z][A-Z]?\\$?\\d+'; // column and row number, optionally with $
    ExcelUtils.sheet_re = '[^\\!]+';
    ExcelUtils.sheet_plus_cell = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + ')');
    ExcelUtils.sheet_plus_range = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')');
    ExcelUtils.single_dep = new RegExp('(' + ExcelUtils.general_re + ')');
    ExcelUtils.range_pair = new RegExp('(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')', 'g');
    ExcelUtils.number_dep = new RegExp('([0-9]+\.?[0-9]*)');
    ExcelUtils.cell_both_relative = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)(\\d+)');
    ExcelUtils.cell_col_absolute = new RegExp('\\$([A-Z][A-Z]?)[^\\$\\d]?(\\d+)');
    ExcelUtils.cell_row_absolute = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)\\$(\\d+)');
    ExcelUtils.cell_both_absolute = new RegExp('\\$([A-Z][A-Z]?)\\$(\\d+)');
    // We need to filter out all formulas with numbers so they don't mess with our dependency regexps.
    ExcelUtils.formulas_with_numbers = new RegExp('/ATAN2|BIN2DEC|BIN2HEX|BIN2OCT|DAYS360|DEC2BIN|DEC2HEX|DEC2OCT|HEX2BIN|HEX2DEC|HEX2OCT|IMLOG2|IMLOG10|LOG10|OCT2BIN|OCT2DEC|OCT2HEX|SUNX2MY2|SUMX2PY2|SUMXMY2|T.DIST.2T|T.INV.2T/', 'g');
    // Same with sheet name references.
    ExcelUtils.formulas_with_quoted_sheetnames = new RegExp("'[^\']*'\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    ExcelUtils.formulas_with_unquoted_sheetnames = new RegExp("[A-Za-z0-9]+\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    return ExcelUtils;
}());
exports.ExcelUtils = ExcelUtils;
