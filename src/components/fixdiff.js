"use strict";
exports.__esModule = true;
var fs = require('fs');
var textdiff = require('text-diff');
var diff = new textdiff();
var excelutils_1 = require("./excelutils");
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
        //	console.log(this.fns);
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
        this.fns.sort(function (a, b) { if (a.length < b.length) {
            return 1;
        } if (a.length > b.length) {
            return -1;
        }
        else
            return 0; });
    };
    FixDiff.prototype.tokenize = function (formula) {
        for (var i = 0; i < this.fns.length; i++) {
            formula = formula.replace(this.fns[i], this.fn2unicode[this.fns[i]]);
        }
        //	console.log("TOKENIZING " + formula);
        formula = formula.replace(/(\-?\d+)/g, function (_, num) {
            //	    console.log("found " + num);
            var replacement = String.fromCharCode(16384 + parseInt(num));
            //	    console.log("replacing with " + replacement);
            return replacement;
        });
        //	console.log("formula is now " + formula);
        return formula;
    };
    FixDiff.prototype.detokenize = function (formula) {
        console.log("DETOKENIZING " + formula);
        for (var i = 0; i < this.fns.length; i++) {
            formula = formula.replace(this.fn2unicode[this.fns[i]], this.fns[i]);
        }
        //	console.log("now checking " + formula);
        formula = formula.replace(/([\u2000-\u6000])/g, function (_, numStr) {
            var replacement = (numStr.charCodeAt(0) - 16384).toString();
            //	    console.log("done found: " + numStr);
            //	    console.log("replacing with: " + replacement);
            return replacement;
        });
        console.log("formula is now " + formula);
        return formula;
    };
    // Return the diffs (with formulas treated specially).
    FixDiff.prototype.compute_fix_diff = function (str1, str2, c1, r1, c2, r2) {
        // First, "tokenize" the strings.
        console.log(str1);
        console.log(str2);
        // Convert to R1C1 format.
        var rc_str1 = excelutils_1.ExcelUtils.formulaToR1C1(str1, c1, r1);
        var rc_str2 = excelutils_1.ExcelUtils.formulaToR1C1(str2, c2, r2);
        console.log("R1C1: ");
        console.log(rc_str1);
        console.log(rc_str2);
        rc_str1 = this.tokenize(rc_str1);
        rc_str2 = this.tokenize(rc_str2);
        console.log("R1C1 tokenized: ");
        console.log(rc_str1);
        console.log(rc_str2);
        // Build up the diff.
        var theDiff = diff.main(rc_str1, rc_str2);
        //	console.log(theDiff);
        // Now de-tokenize the diff contents
        // and convert back out of R1C1 format.
        for (var j = 0; j < theDiff.length; j++) {
            if (theDiff[j][0] == 0) { // No diff
                theDiff[j][1] = this.fromR1C1(theDiff[j][1], c1, r1); // doesn't matter which one
            }
            else if (theDiff[j][0] == -1) { // Left diff
                theDiff[j][1] = this.fromR1C1(theDiff[j][1], c1, r1);
            }
            else { // Right diff
                theDiff[j][1] = this.fromR1C1(theDiff[j][1], c2, r2);
            }
            theDiff[j][1] = this.detokenize(theDiff[j][1]);
        }
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
;
var nd = new FixDiff();
// Now try a diff.
var str1 = '=SUM(B6:E6)+100'; // 'ROUND(A1)+12';
var str2 = '=SUM(B7:D7)+10'; // 'ROUNDUP(B2)+12';
//console.log(str1);
//console.log(str2);
var diffs = nd.compute_fix_diff(str1, str2, 6, 6, 6, 7);
//console.log(JSON.stringify(diffs));
var _a = nd.pretty_diffs(diffs), a = _a[0], b = _a[1];
console.log(a);
console.log("---");
console.log(b);
