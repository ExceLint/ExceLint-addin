"use strict";
exports.__esModule = true;
var fs = require('fs');
var textdiff = require('text-diff');
var diff = new textdiff();
var excelutils_1 = require("./excelutils");
var CellEncoder = /** @class */ (function () {
    function CellEncoder() {
    }
    CellEncoder.encode = function (col, row, absoluteColumn, absoluteRow) {
        if (absoluteColumn === void 0) { absoluteColumn = false; }
        if (absoluteRow === void 0) { absoluteRow = false; }
        var addAbsolutes = Number(absoluteRow) * CellEncoder.absoluteRowMultiplier
            + Number(absoluteColumn) * CellEncoder.absoluteColumnMultiplier;
        return addAbsolutes + CellEncoder.maxRows * (CellEncoder.maxColumns / 2 + col)
            + (CellEncoder.maxRows / 2 + row)
            + CellEncoder.startPoint;
    };
    CellEncoder.encodeToChar = function (col, row, absoluteColumn, absoluteRow) {
        if (absoluteColumn === void 0) { absoluteColumn = false; }
        if (absoluteRow === void 0) { absoluteRow = false; }
        var chr = String.fromCodePoint(CellEncoder.encode(col, row, absoluteColumn, absoluteRow));
        return chr;
    };
    CellEncoder.decodeColumn = function (encoded) {
        encoded -= CellEncoder.startPoint;
        return Math.floor(encoded / CellEncoder.maxRows) - CellEncoder.maxColumns / 2;
    };
    CellEncoder.decodeRow = function (encoded) {
        encoded -= CellEncoder.startPoint;
        return (encoded % CellEncoder.maxRows) - CellEncoder.maxRows / 2;
    };
    CellEncoder.decodeFromChar = function (chr) {
        var decodedNum = chr.codePointAt(0);
        var absoluteColumn = false;
        var absoluteRow = false;
        if (decodedNum & CellEncoder.absoluteRowMultiplier) {
            decodedNum &= ~CellEncoder.absoluteRowMultiplier;
            absoluteRow = true;
        }
        if (decodedNum & CellEncoder.absoluteColumnMultiplier) {
            decodedNum &= ~CellEncoder.absoluteColumnMultiplier;
            absoluteColumn = true;
        }
        var result = [CellEncoder.decodeColumn(decodedNum), CellEncoder.decodeRow(decodedNum), absoluteColumn, absoluteRow];
        return result;
    };
    CellEncoder.maxEncodedSize = function () {
        return CellEncoder.encode(CellEncoder.maxColumns - 1, CellEncoder.maxRows - 1) - CellEncoder.encode(-(CellEncoder.maxColumns - 1), -(CellEncoder.maxRows - 1));
    };
    CellEncoder.test = function () {
        for (var col = -CellEncoder.maxColumns; col < CellEncoder.maxColumns; col++) {
            for (var row = -CellEncoder.maxRows; row < CellEncoder.maxRows; row++) {
                var encoded = CellEncoder.encode(col, row);
                var decodedCol = CellEncoder.decodeColumn(encoded);
                var decodedRow = CellEncoder.decodeRow(encoded);
                //	console.log(decodedCol + " " + decodedRow);
                console.assert(col === decodedCol, "NOPE COL");
                console.assert(row === decodedRow, "NOPE ROW");
            }
        }
    };
    CellEncoder.maxRows = 64; // -32..32
    CellEncoder.maxColumns = 32; // -16..16
    CellEncoder.absoluteRowMultiplier = 2 * CellEncoder.maxRows * CellEncoder.maxColumns; // if bit set, absolute row
    CellEncoder.absoluteColumnMultiplier = 2 * CellEncoder.absoluteRowMultiplier; // if bit set, absolute column
    CellEncoder.startPoint = 2048; // Start the encoding of the cell at this Unicode value
    return CellEncoder;
}());
var FixDiff = /** @class */ (function () {
    function FixDiff() {
        // Load the JSON file containing all the Excel functions.
        this.fns = JSON.parse(fs.readFileSync('functions.json', 'utf-8'));
        // console.log(JSON.stringify(fns));
        // Build a map of Excel functions to crazy Unicode characters and back
        // again.  We do this so that diffs are in effect "token by token"
        // (e.g., so ROUND and RAND don't get a diff of "O|A" but are instead
        // considered entirely different).
        this.fn2unicode = {};
        this.unicode2fn = {};
        this.initArrays();
    }
    // Construct the arrays above.
    FixDiff.prototype.initArrays = function () {
        var i = 0;
        for (var _i = 0, _a = this.fns; _i < _a.length; _i++) {
            var fnName = _a[_i];
            var str = String.fromCharCode(256 + i);
            this.fn2unicode[fnName] = str;
            this.unicode2fn[str] = fnName;
            i++;
            // console.log(fnName + " " + this.fn2unicode[fnName] + " " + this.unicode2fn[this.fn2unicode[fnName]]);
        }
        // Sort the functions in reverse order by size (longest first). This
        // order will prevent accidentally tokenizing substrings of functions.
        this.fns.sort(function (a, b) {
            if (a.length < b.length) {
                return 1;
            }
            if (a.length > b.length) {
                return -1;
            }
            else {
                // Sort in alphabetical order.
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            }
        });
    };
    FixDiff.toPseudoR1C1 = function (srcCell, destCell) {
        // Dependencies are column, then row.
        var vec1 = excelutils_1.ExcelUtils.cell_dependency(srcCell, 0, 0);
        var vec2 = excelutils_1.ExcelUtils.cell_dependency(destCell, 0, 0);
        // Compute the difference.
        var resultVec = [];
        vec2.forEach(function (item, index, _) { resultVec.push(item - vec1[index]); });
        // Now generate the pseudo R1C1 version, which varies
        // depending whether it's a relative or absolute reference.
        var resultStr = "";
        if (excelutils_1.ExcelUtils.cell_both_absolute.exec(destCell)) {
            resultStr = CellEncoder.encodeToChar(vec2[0], vec2[1], true, true);
        }
        else if (excelutils_1.ExcelUtils.cell_col_absolute.exec(destCell)) {
            resultStr = CellEncoder.encodeToChar(vec2[0], resultVec[1], true, false);
        }
        else if (excelutils_1.ExcelUtils.cell_row_absolute.exec(destCell)) {
            resultStr = CellEncoder.encodeToChar(resultVec[0], vec2[1], false, true);
        }
        else {
            // Common case, both relative.
            resultStr = CellEncoder.encodeToChar(resultVec[0], resultVec[1], false, false);
        }
        return resultStr;
    };
    FixDiff.formulaToPseudoR1C1 = function (formula, origin_col, origin_row) {
        var range = formula.slice();
        var origin = excelutils_1.ExcelUtils.column_index_to_name(origin_col) + origin_row;
        // First, get all the range pairs out.
        var found_pair;
        while (found_pair = excelutils_1.ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                var first_cell = found_pair[1];
                var last_cell = found_pair[2];
                range = range.replace(found_pair[0], FixDiff.toPseudoR1C1(origin, found_pair[1]) + ":" + FixDiff.toPseudoR1C1(origin, found_pair[2]));
            }
        }
        // Now look for singletons.
        var singleton = null;
        while (singleton = excelutils_1.ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
                var first_cell = singleton[1];
                range = range.replace(singleton[0], FixDiff.toPseudoR1C1(origin, first_cell));
            }
        }
        return range;
    };
    FixDiff.prototype.tokenize = function (formula) {
        for (var i = 0; i < this.fns.length; i++) {
            formula = formula.replace(this.fns[i], this.fn2unicode[this.fns[i]]);
        }
        formula = formula.replace(/(\-?\d+)/g, function (_, num) {
            // Make sure the unicode characters are far away from the encoded cell values.
            var replacement = String.fromCodePoint(CellEncoder.absoluteColumnMultiplier * 2 + parseInt(num));
            return replacement;
        });
        return formula;
    };
    FixDiff.prototype.detokenize = function (formula) {
        for (var i = 0; i < this.fns.length; i++) {
            formula = formula.replace(this.fn2unicode[this.fns[i]], this.fns[i]);
        }
        return formula;
    };
    // Return the diffs (with formulas treated specially).
    FixDiff.prototype.compute_fix_diff = function (str1, str2, c1, r1, c2, r2) {
        // Convert to pseudo R1C1 format.
        var rc_str1 = FixDiff.formulaToPseudoR1C1(str1, c1, r1); // ExcelUtils.formulaToR1C1(str1, c1, r1);
        var rc_str2 = FixDiff.formulaToPseudoR1C1(str2, c2, r2); // ExcelUtils.formulaToR1C1(str2, c2, r2);
        // Tokenize the functions.
        rc_str1 = this.tokenize(rc_str1);
        rc_str2 = this.tokenize(rc_str2);
        // Build up the diff.
        var theDiff = diff.main(rc_str1, rc_str2);
        // Now de-tokenize the diff contents
        // and convert back out of pseudo R1C1 format.
        for (var j = 0; j < theDiff.length; j++) {
            // console.log("processing " + JSON.stringify(theDiff[j][1]));
            if (theDiff[j][0] == 0) { // No diff
                theDiff[j][1] = this.fromPseudoR1C1(theDiff[j][1], c1, r1); ///FIXME // doesn't matter which one
            }
            else if (theDiff[j][0] == -1) { // Left diff
                theDiff[j][1] = this.fromPseudoR1C1(theDiff[j][1], c1, r1);
            }
            else { // Right diff
                theDiff[j][1] = this.fromPseudoR1C1(theDiff[j][1], c2, r2);
            }
            theDiff[j][1] = this.detokenize(theDiff[j][1]);
        }
        diff.cleanupSemantic(theDiff);
        return theDiff;
    };
    FixDiff.prototype.fromR1C1 = function (r1c1_formula, origin_col, origin_row) {
        // We assume that formulas have already been 'tokenized'.
        var r1c1 = r1c1_formula.slice();
        var R = "ρ";
        var C = "γ";
        r1c1 = r1c1.replace("R", R); // needs to be 'greeked'
        r1c1 = r1c1.replace("C", C);
        // Both relative (R[..]C[...])
        r1c1 = r1c1.replace(/ρ\[(\-?[0-9])\]γ\[(\-?[0-9])\]/g, function (_, row_offset, col_offset) {
            var ro = parseInt(row_offset) + 1;
            var co = parseInt(col_offset) + 1;
            return excelutils_1.ExcelUtils.column_index_to_name(origin_col + co) + (origin_row + ro);
        });
        // Row relative, column absolute (R[..]C...)
        r1c1 = r1c1.replace(/ρ\[(\-?[0-9])\]γ(\-?[0-9])/g, function (_, row_offset, col_offset) {
            var ro = parseInt(row_offset) + 1;
            var co = parseInt(col_offset);
            return excelutils_1.ExcelUtils.column_index_to_name(co) + (origin_row + ro);
        });
        // Row absolute, column relative (R...C[..])
        r1c1 = r1c1.replace(/ρ(\-?[0-9])γ\[(\-?[0-9])\]/g, function (_, row_offset, col_offset) {
            var ro = parseInt(row_offset);
            var co = parseInt(col_offset) + 1;
            return excelutils_1.ExcelUtils.column_index_to_name(origin_col + co) + ro;
        });
        // Both absolute (R...C...)
        r1c1 = r1c1.replace(/ρ(\-?[0-9])γ(\-?[0-9])/g, function (_, row_offset, col_offset) {
            var ro = parseInt(row_offset);
            var co = parseInt(col_offset);
            return excelutils_1.ExcelUtils.column_index_to_name(co) + ro;
        });
        // Now de-greek.
        r1c1 = r1c1.replace(R, "R");
        r1c1 = r1c1.replace(C, "C");
        return r1c1;
    };
    FixDiff.prototype.fromPseudoR1C1 = function (r1c1_formula, origin_col, origin_row) {
        // We assume that formulas have already been 'tokenized'.
        // console.log("fromPseudoR1C1 = " + r1c1_formula + ", origin_col = " + origin_col + ", origin_row = " + origin_row);
        var r1c1 = r1c1_formula.slice();
        // Find the Unicode characters and decode them.
        r1c1 = r1c1.replace(/([\u800-\uF000])/g, function (_full, encoded_char) {
            if (encoded_char.codePointAt(0) < CellEncoder.startPoint) {
                return encoded_char;
            }
            var _a = CellEncoder.decodeFromChar(encoded_char), co = _a[0], ro = _a[1], absCo = _a[2], absRo = _a[3];
            var result;
            if (!absCo && !absRo) {
                // Both relative (R[..]C[...])
                result = excelutils_1.ExcelUtils.column_index_to_name(origin_col + co) + (origin_row + ro);
            }
            if (absCo && !absRo) {
                // Row absolute, column relative (R...C[..])
                result = excelutils_1.ExcelUtils.column_index_to_name(origin_col + co) + '$' + ro;
            }
            if (!absCo && absRo) {
                // Row relative, column absolute (R[..]C...)
                result = '$' + excelutils_1.ExcelUtils.column_index_to_name(co) + (origin_row + ro);
            }
            if (absCo && absRo) {
                // Both absolute (R...C...)
                result = '$' + excelutils_1.ExcelUtils.column_index_to_name(co) + '$' + ro;
            }
            return result;
        });
        return r1c1;
    };
    FixDiff.prototype.pretty_diffs = function (diffs) {
        var strList = [];
        // Iterate for -1 and 1.
        for (var _i = 0, _a = [-1, 1]; _i < _a.length; _i++) {
            var i = _a[_i];
            // console.log(i);
            var str = "";
            for (var _b = 0, diffs_1 = diffs; _b < diffs_1.length; _b++) {
                var d = diffs_1[_b];
                // console.log("diff = " + JSON.stringify(d));
                if (d[0] === i) {
                    str += (FixDiff.textcolor[i + 1] + d[1] + FixDiff.resettext);
                }
                else if (d[0] == 0) {
                    str += (FixDiff.whitetext + d[1] + FixDiff.resettext);
                }
            }
            strList.push(str);
        }
        return strList;
    };
    FixDiff.redtext = "\u001b[31m";
    FixDiff.yellowtext = "\u001b[33m";
    FixDiff.greentext = "\u001b[32m";
    FixDiff.whitetext = "\u001b[37m";
    FixDiff.resettext = "\u001b[0m";
    FixDiff.textcolor = [FixDiff.redtext, FixDiff.yellowtext, FixDiff.greentext];
    return FixDiff;
}());
exports.FixDiff = FixDiff;
var nd = new FixDiff();
// Now try a diff.
var _a = [1, 2], row1 = _a[0], col1 = _a[1];
var _b = [1, 3], row2 = _b[0], col2 = _b[1];
//let [row1, col1] = [11, 2];
//let [row2, col2] = [11, 3];
//let str1 = '=ROUND(B7:B9)'; // 'ROUND(A1)+12';
//let str2 = '=ROUND(C7:C10)'; // 'ROUNDUP(B2)+12';
var str1 = '=ROUND($A1:B9)'; // 'ROUND(A1)+12';
var str2 = '=ROUND($A1:C10)'; // 'ROUNDUP(B2)+12';
var diffs = nd.compute_fix_diff(str1, str2, col1 - 1, row1 - 1, col2 - 1, row2 - 1);
console.log(JSON.stringify(diffs));
var _c = nd.pretty_diffs(diffs), a = _c[0], b = _c[1];
console.log(a);
console.log("---");
console.log(b);
