"use strict";
// excel-utils
// Emery Berger, Microsoft Research / UMass Amherst
// https://emeryberger.com
exports.__esModule = true;
var sjcl = require("sjcl");
var rectangleutils_1 = require("./rectangleutils");
var ExcelUtils = /** @class */ (function () {
    function ExcelUtils() {
    }
    // Get the saved formats for this sheet (by its unique identifier).
    ExcelUtils.saved_original_sheetname = function (id) {
        return this.hash_sheet(id, 28) + this.originalSheetSuffix;
    };
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
            var r = rectangleutils_1.RectangleUtils.bounding_box(proposed_fixes[current_fix][1], proposed_fixes[current_fix][2]);
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
    // Take a range string and compute the number of cells.
    ExcelUtils.get_number_of_cells = function (address) {
        // Compute the number of cells in the range "usedRange".
        var usedRangeAddresses = ExcelUtils.extract_sheet_range(address);
        var upperLeftCorner = ExcelUtils.cell_dependency(usedRangeAddresses[1], 0, 0);
        var lowerRightCorner = ExcelUtils.cell_dependency(usedRangeAddresses[2], 0, 0);
        var numberOfCellsUsed = rectangleutils_1.RectangleUtils.area([upperLeftCorner, lowerRightCorner]);
        return numberOfCellsUsed;
    };
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
        var alwaysReturnAdjustedColRow = false;
        {
            var r = ExcelUtils.cell_both_absolute.exec(cell);
            if (r) {
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                if (alwaysReturnAdjustedColRow) {
                    return [col - origin_col, row - origin_row, 0];
                }
                else {
                    return [col, row, 0];
                }
            }
        }
        {
            var r = ExcelUtils.cell_col_absolute.exec(cell);
            if (r) {
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                if (alwaysReturnAdjustedColRow) {
                    return [col, row, 0];
                }
                else {
                    return [col, row - origin_row, 0];
                }
            }
        }
        {
            var r = ExcelUtils.cell_row_absolute.exec(cell);
            if (r) {
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                if (alwaysReturnAdjustedColRow) {
                    return [col, row, 0];
                }
                else {
                    return [col - origin_col, row, 0];
                }
            }
        }
        {
            var r = ExcelUtils.cell_both_relative.exec(cell);
            if (r) {
                var col = ExcelUtils.column_name_to_index(r[1]);
                var row = Number(r[2]);
                if (alwaysReturnAdjustedColRow) {
                    return [col, row, 0];
                }
                else {
                    return [col - origin_col, row - origin_row, 0];
                }
            }
        }
        console.log('cell is ' + cell + ', origin_col = ' + origin_col + ', origin_row = ' + origin_row);
        throw new Error('We should never get here.');
        return [0, 0, 0];
    };
    ExcelUtils.toR1C1 = function (srcCell, destCell, greek) {
        if (greek === void 0) { greek = false; }
        // Dependencies are column, then row.
        var vec1 = ExcelUtils.cell_dependency(srcCell, 0, 0);
        var vec2 = ExcelUtils.cell_dependency(destCell, 0, 0);
        var R = "R";
        var C = "C";
        if (greek) {
            // We use this encoding to avoid confusion with, say, "C1", downstream.
            R = "ρ";
            C = "γ";
        }
        // Compute the difference.
        var resultVec = [];
        vec2.forEach(function (item, index, _) { resultVec.push(item - vec1[index]); });
        // Now generate the R1C1 notation version, which varies
        // depending whether it's a relative or absolute reference.
        var resultStr = "";
        if (ExcelUtils.cell_both_absolute.exec(destCell)) {
            resultStr = R + vec2[1] + C + vec2[0];
        }
        else if (ExcelUtils.cell_col_absolute.exec(destCell)) {
            if (resultVec[1] === 0) {
                resultStr += R;
            }
            else {
                resultStr += R + "[" + resultVec[1] + "]";
            }
            resultStr += C + vec2[0];
        }
        else if (ExcelUtils.cell_row_absolute.exec(destCell)) {
            if (resultVec[0] === 0) {
                resultStr += C;
            }
            else {
                resultStr += C + "[" + resultVec[0] + "]";
            }
            resultStr = R + vec2[1] + resultStr;
        }
        else {
            // Common case, both relative.
            if (resultVec[1] === 0) {
                resultStr += R;
            }
            else {
                resultStr += R + "[" + resultVec[1] + "]";
            }
            if (resultVec[0] === 0) {
                resultStr += C;
            }
            else {
                resultStr += C + "[" + resultVec[0] + "]";
            }
        }
        return resultStr;
    };
    ExcelUtils.formulaToR1C1 = function (formula, origin_col, origin_row) {
        var range = formula.slice();
        var origin = ExcelUtils.column_index_to_name(origin_col) + origin_row;
        // First, get all the range pairs out.
        var found_pair;
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                var first_cell = found_pair[1];
                var last_cell = found_pair[2];
                range = range.replace(found_pair[0], ExcelUtils.toR1C1(origin, found_pair[1], true) + ":" + ExcelUtils.toR1C1(origin, found_pair[2], true));
            }
        }
        // Now look for singletons.
        var singleton = null;
        while (singleton = ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
                var first_cell = singleton[1];
                range = range.replace(singleton[0], ExcelUtils.toR1C1(origin, first_cell, true));
            }
        }
        // Now, we de-greek.
        range = range.replace(/ρ/g, 'R');
        range = range.replace(/γ/g, 'C');
        return range;
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
    ExcelUtils.make_range_string = function (theRange) {
        var r = theRange;
        var col0 = r[0][0];
        var row0 = r[0][1];
        var col1 = r[1][0];
        var row1 = r[1][1];
        if ((col0 === 0) && (row0 === 0) && (r[0][2] !== 0)) {
            // Not a real dependency. Skip.
            console.log('NOT A REAL DEPENDENCY: ' + col1 + ',' + row1);
            return '';
        }
        else if ((col0 < 0) || (row0 < 0) || (col1 < 0) || (row1 < 0)) {
            // Defensive programming.
            console.log('WARNING: FOUND NEGATIVE VALUES.');
            return '';
        }
        else {
            var colname0 = ExcelUtils.column_index_to_name(col0);
            var colname1 = ExcelUtils.column_index_to_name(col1);
            //		    console.log("process: about to get range " + colname0 + row0 + ":" + colname1 + row1);
            var rangeStr = colname0 + row0 + ':' + colname1 + row1;
            return rangeStr;
        }
    };
    ExcelUtils.all_cell_dependencies = function (range, origin_col, origin_row) {
        //	console.log("looking for dependencies in " + range);
        var found_pair = null;
        var all_vectors = [];
        if (typeof (range) !== 'string') {
            return null;
        }
        // Zap all the formulas with the below characteristics.
        range = range.replace(this.formulas_with_numbers, '_'); // Don't track these.
        range = range.replace(this.formulas_with_quoted_sheetnames_2, '_');
        range = range.replace(this.formulas_with_quoted_sheetnames_1, '_');
        range = range.replace(this.formulas_with_unquoted_sheetnames_2, '_');
        range = range.replace(this.formulas_with_unquoted_sheetnames_1, '_');
        range = range.replace(this.formulas_with_unquoted_sheetnames_1, '_');
        range = range.replace(this.formulas_with_structured_references, '_');
        /// FIX ME - should we count the same range multiple times? Or just once?
        // First, get all the range pairs out.
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                var first_cell = found_pair[1];
                var first_vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                var last_cell = found_pair[2];
                var last_vec = ExcelUtils.cell_dependency(last_cell, origin_col, origin_row);
                // First_vec is the upper-left hand side of a rectangle.
                // Last_vec is the lower-right hand side of a rectangle.
                // Generate all vectors.
                var length_1 = last_vec[0] - first_vec[0] + 1;
                var width = last_vec[1] - first_vec[1] + 1;
                for (var x = 0; x < length_1; x++) {
                    for (var y = 0; y < width; y++) {
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
                var first_cell = singleton[1];
                var vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                all_vectors.push(vec);
                // Wipe out the matched contents of range.
                range = range.replace(singleton[0], '_');
            }
        }
        // For now, we roll numbers in formulas into the dependency vectors. Each number counts as "1".
        var number = null;
        while (number = ExcelUtils.number_dep.exec(range)) {
            if (number) {
                all_vectors.push([0, 0, 1]); // just add 1 for every number
                // Wipe out the matched contents of range.
                range = range.replace(number[0], '_');
            }
        }
        return all_vectors;
    };
    ExcelUtils.sum_numeric_constants = function (range) {
        range = range.slice();
        if (typeof (range) !== 'string') {
            return 0;
        }
        // Zap all the formulas with the below characteristics.
        range = range.replace(this.formulas_with_numbers, '_'); // Don't track these.
        range = range.replace(this.formulas_with_quoted_sheetnames_2, '_');
        range = range.replace(this.formulas_with_quoted_sheetnames_1, '_');
        range = range.replace(this.formulas_with_unquoted_sheetnames_2, '_');
        range = range.replace(this.formulas_with_unquoted_sheetnames_1, '_');
        range = range.replace(this.formulas_with_unquoted_sheetnames_1, '_');
        range = range.replace(this.formulas_with_structured_references, '_');
        // First, get all the range pairs out.
        var found_pair = null;
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                // Wipe out the matched contents of range.
                range = range.replace(found_pair[0], '_');
            }
        }
        // Now look for singletons.
        var singleton = null;
        while (singleton = ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
                // Wipe out the matched contents of range.
                range = range.replace(singleton[0], '_');
            }
        }
        // Now aggregate total numeric constants (sum them).
        var number = null;
        var total = 0.0;
        while (number = ExcelUtils.number_dep.exec(range)) {
            if (number) {
                total += parseFloat(number);
                // Wipe out the matched contents of range.
                range = range.replace(number[0], '_');
            }
        }
        return total;
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
        if ((cell.length > 1) && (cell[0] === '=')) {
            // It is. Compute the dependencies.
            deps = ExcelUtils.all_cell_dependencies(cell, origin_col, origin_row);
        }
        return deps;
    };
    ExcelUtils.generate_all_references = function (formulas, origin_col, origin_row) {
        var refs = {};
        var counter = 0;
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j];
                counter++;
                if (counter % 1000 === 0) {
                    //		    console.log(counter + " references down");
                }
                if (cell[0] === '=') { // It's a formula.
                    var direct_refs = ExcelUtils.all_cell_dependencies(cell, 0, 0); // origin_col, origin_row); // was just 0,0....  origin_col, origin_row);
                    for (var _i = 0, direct_refs_1 = direct_refs; _i < direct_refs_1.length; _i++) {
                        var dep = direct_refs_1[_i];
                        if ((dep[0] === 0) && (dep[1] === 0) && (dep[2] !== 0)) {
                            // Not a real reference. Skip.
                        }
                        else {
                            // Check to see if this is data or a formula.
                            // If it's not a formula, add it.
                            var rowIndex = dep[0] - origin_col - 1;
                            var colIndex = dep[1] - origin_row - 1;
                            var outsideFormulaRange = ((colIndex >= formulas.length)
                                || (rowIndex >= formulas[0].length)
                                || (rowIndex < 0)
                                || (colIndex < 0));
                            if (true) {
                                var addReference = false;
                                if (outsideFormulaRange) {
                                    addReference = true;
                                }
                                else {
                                    // Only include non-formulas (if they are in the range).
                                    var referentCell = formulas[colIndex][rowIndex];
                                    if ((referentCell !== undefined) && (referentCell[0] !== '=')) {
                                        addReference = true;
                                    }
                                }
                                if (addReference) {
                                    var key = dep.join(',');
                                    refs[key] = true;
                                }
                            }
                        }
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
    ExcelUtils.number_dep = new RegExp('([0-9]+\\.?[0-9]*)');
    ExcelUtils.cell_both_relative = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)(\\d+)');
    ExcelUtils.cell_col_absolute = new RegExp('\\$([A-Z][A-Z]?)[^\\$\\d]?(\\d+)');
    ExcelUtils.cell_row_absolute = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)\\$(\\d+)');
    ExcelUtils.cell_both_absolute = new RegExp('\\$([A-Z][A-Z]?)\\$(\\d+)');
    // We need to filter out all formulas with these characteristics so they don't mess with our dependency regexps.
    ExcelUtils.formulas_with_numbers = new RegExp('/ATAN2|BIN2DEC|BIN2HEX|BIN2OCT|DAYS360|DEC2BIN|DEC2HEX|DEC2OCT|HEX2BIN|HEX2DEC|HEX2OCT|IMLOG2|IMLOG10|LOG10|OCT2BIN|OCT2DEC|OCT2HEX|SUNX2MY2|SUMX2PY2|SUMXMY2|T.DIST.2T|T.INV.2T/', 'g');
    // Same with sheet name references.
    ExcelUtils.formulas_with_quoted_sheetnames_1 = new RegExp("'[^\']*'\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    ExcelUtils.formulas_with_quoted_sheetnames_2 = new RegExp("'[^\']*'\!" + '\\$?[A-Z][A-Z]?\\$?\\d+' + ':' + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    ExcelUtils.formulas_with_unquoted_sheetnames_1 = new RegExp("[A-Za-z0-9]+\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    ExcelUtils.formulas_with_unquoted_sheetnames_2 = new RegExp("[A-Za-z0-9]+\!" + '\\$?[A-Z][A-Z]?\\$?\\d+' + ':' + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    ExcelUtils.formulas_with_structured_references = new RegExp('\\[([^\\]])*\\]', 'g');
    ExcelUtils.originalSheetSuffix = '_EL';
    return ExcelUtils;
}());
exports.ExcelUtils = ExcelUtils;
