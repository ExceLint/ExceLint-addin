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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
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
                return [col, row];
            }
        }
        {
            var r = ExcelUtils.cell_col_absolute.exec(cell);
            if (r) {
                //console.log("cell col absolute only " + JSON.stringify(r));
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                //	    console.log('absolute col: ' + col + ', row: ' + row);
                return [col, row - origin_row];
            }
        }
        {
            var r = ExcelUtils.cell_row_absolute.exec(cell);
            if (r) {
                //console.log('row_absolute');
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                return [col - origin_col, row];
            }
        }
        {
            var r = ExcelUtils.cell_both_relative.exec(cell);
            if (r) {
                //console.log('both_relative: r[1] = ' + r[1] + ', r[2] = ' + r[2]);
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                //		console.log('both relative col: ' + col + ', row: ' + row);
                return [col - origin_col, row - origin_row];
            }
        }
        console.log("cell is " + cell);
        throw new Error('We should never get here.');
        return [0, 0];
    };
    ExcelUtils.extract_sheet_cell = function (str) {
        console.log("extract_sheet_cell " + str);
        var matched = ExcelUtils.sheet_plus_cell.exec(str);
        if (matched) {
            console.log("extract_sheet_cell matched " + str);
            // There is only one thing to match for this pattern: we convert it into a range.
            return [matched[1], matched[2], matched[2]];
        }
        console.log("extract_sheet_cell failed for " + str);
        return ['', '', ''];
    };
    ExcelUtils.extract_sheet_range = function (str) {
        var matched = ExcelUtils.sheet_plus_range.exec(str);
        if (matched) {
            console.log("extract_sheet_range matched " + str);
            return [matched[1], matched[2], matched[3]];
        }
        console.log("extract_sheet_range failed to match " + str);
        return ExcelUtils.extract_sheet_cell(str);
    };
    ExcelUtils.all_cell_dependencies = function (range, origin_col, origin_row) {
        //	console.log("looking for dependencies in " + range);
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
                        all_vectors.push([x + first_vec[0], y + first_vec[1]]);
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
        //console.log(JSON.stringify(all_vectors));
        return all_vectors;
    };
    ExcelUtils.dependencies = function (range, origin_col, origin_row) {
        var base_vector = [0, 0];
        var found_pair = null;
        range = range.replace(this.formulas_with_numbers, '_'); // kind of a hack for now
        range = range.replace(this.formulas_with_unquoted_sheetnames, '_'); // kind of a hack for now
        range = range.replace(this.formulas_with_quoted_sheetnames, '_'); // kind of a hack for now
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
                range = range.replace(found_pair[0], '_');
            }
        }
        // Now look for singletons.
        var singleton = null;
        while (singleton = ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
                //	    console.log(found_pair);
                var first_cell = singleton[1];
                //                console.log("dependencies: first cell = " + JSON.stringify(first_cell) + ", origin col = " + origin_col + ", origin_row = " + origin_row);
                var vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                //		console.log("dependencies: vec = " + vec[0] + ", " + vec[1]);
                base_vector[0] += vec[0];
                base_vector[1] += vec[1];
                // Wipe out the matched contents of range.
                range = range.replace(singleton[0], '_');
            }
        }
        return base_vector;
    };
    ExcelUtils.build_transitive_closures = function (formulas, origin_col, origin_row, all_deps) {
        for (var i = 0; i < formulas.length; i++) {
            for (var j = 0; j < formulas[0].length; j++) {
                // Ignore the return value and just use it for the side effects on all_deps.
                ExcelUtils.transitive_closure(i, j, origin_row + i, origin_col + j, formulas, all_deps);
            }
        }
    };
    ExcelUtils.transitive_closure = function (row, col, origin_row, origin_col, formulas, all_deps) {
        var e_2, _a;
        console.log("tc1: transitive closure of " + row + ", " + col + ", origin_row = " + origin_row + ", origin_col = " + origin_col);
        var index = [row, col].join(',');
        //	console.log("index = " + index);
        if (index in all_deps) {
            // We already processed this index: return it.
            return all_deps[index];
        }
        //	console.log("tc2");
        console.log("formulas[" + row + "][" + col + "]");
        if ((row >= formulas.length)
            || (col >= formulas[0].length)
            || (row < 0)
            || (col < 0)) {
            // Discard references to cells outside the formula range.
            return [];
        }
        var cell = formulas[row][col];
        console.log("formulas[" + row + "][" + col + "] = " + cell);
        if (cell.length <= 1 || cell[0] !== "=") {
            // Not a formula -- no dependencies.
            return [];
        }
        //	console.log("tc3: cell = " + cell);
        var deps = ExcelUtils.all_cell_dependencies(cell, origin_col, origin_row);
        if (deps.length >= 1) {
            var tcs = deps.slice();
            console.log("cell deps = " + JSON.stringify(tcs));
            try {
                for (var deps_1 = __values(deps), deps_1_1 = deps_1.next(); !deps_1_1.done; deps_1_1 = deps_1.next()) {
                    var dep = deps_1_1.value;
                    //		dep[0] -= origin_col;
                    //		dep[0] -= 1;
                    //		dep[1] -= origin_row;
                    //		dep[1] -= 1;
                    //		console.log("tc4 " + JSON.stringify(dep));
                    tcs = tcs.concat(ExcelUtils.transitive_closure(dep[1] - 1, dep[0] - 1, origin_row, origin_col, formulas, all_deps));
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (deps_1_1 && !deps_1_1.done && (_a = deps_1["return"])) _a.call(deps_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            //	    console.log("tc5: tcs = " + JSON.stringify(tcs));
            // Remove any duplicates.
            tcs = __spread(new Set(tcs.map(function (x) { return JSON.stringify(x); }))).map(function (x) { return JSON.parse(x); });
            all_deps[index] = tcs;
            console.log("tc6: all_deps[" + index + "] = " + JSON.stringify(tcs));
            return tcs.slice(); // FIXME perhaps
        }
        else {
            return [];
        }
    };
    ExcelUtils.generate_all_references = function (formulas, origin_col, origin_row) {
        var e_3, _a;
        var refs = {};
        var counter = 0;
        //	let all_deps = {};
        console.log(JSON.stringify(formulas));
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
                    console.log("direct refs for " + i + ", " + j + " [origin_row=" + origin_row + ", origin_col=" + origin_col + "] (" + cell + ") = " + JSON.stringify(direct_refs));
                    try {
                        //		    let transitive_deps = ExcelUtils.transitive_closure(i, j, origin_row, origin_col, formulas, all_deps);
                        //		    console.log("TRANSITIVE CLOSURE FOR " + i + ", " + j + " = " + JSON.stringify(transitive_deps));
                        //		    all_deps[index] = transitive_deps; //
                        for (var direct_refs_1 = __values(direct_refs), direct_refs_1_1 = direct_refs_1.next(); !direct_refs_1_1.done; direct_refs_1_1 = direct_refs_1.next()) { // direct_refs) {
                            var dep = direct_refs_1_1.value;
                            var key = dep.join(',');
                            refs[key] = true; // refs[key] || [];
                            // NOTE: we are disabling pushing the src onto the list because we don't need it.
                            // refs[dep2.join(',')].push(src);
                        }
                    }
                    catch (e_3_1) { e_3 = { error: e_3_1 }; }
                    finally {
                        try {
                            if (direct_refs_1_1 && !direct_refs_1_1.done && (_a = direct_refs_1["return"])) _a.call(direct_refs_1);
                        }
                        finally { if (e_3) throw e_3.error; }
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
