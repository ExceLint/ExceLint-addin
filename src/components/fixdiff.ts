let fs = require('fs');
let textdiff = require('text-diff');
let diff = new textdiff();

import { ExcelUtils } from './excelutils';

export class FixDiff {
    
    // Load the JSON file containing all the Excel functions.
    private fns = JSON.parse(fs.readFileSync('functions.json', 'utf-8'));
    // console.log(JSON.stringify(fns));

    // Build a map of Excel functions to crazy Unicode characters and back
    // again.  We do this so that diffs are in effect "token by token"
    // (e.g., so ROUND and RAND don't get a diff of "O|A" but are instead
    // considered entirely different).
    private fn2unicode = {};
    private unicode2fn = {};

    // Construct the arrays above.
    private initArrays() {
	let i = 0;
	for (let fnName of this.fns) {
	    const str = String.fromCharCode(256 + i);
	    this.fn2unicode[fnName] = str;
	    this.unicode2fn[str] = fnName;
	    i++;
	    // console.log(fnName + " " + this.fn2unicode[fnName] + " " + this.unicode2fn[this.fn2unicode[fnName]]);
	}
	
	// Sort the functions in reverse order by size (longest first). This
	// order will prevent accidentally tokenizing substrings of functions.
	this.fns.sort((a,b) => { if (a.length < b.length) { return 1; } if (a.length > b.length) { return -1; } else return 0; })
    }
    
    constructor() {
	this.initArrays();
//	console.log(this.fns);
    }

    public tokenize(formula: string) : string {
	for (let i = 0; i < this.fns.length; i++) {
	    formula = formula.replace(this.fns[i], this.fn2unicode[this.fns[i]]);
	}
	formula = formula.replace(/(\-?\d+)/g, (_, num) => {
//	    console.log("found " + num);
	    const replacement = String.fromCharCode(16384 + parseInt(num));
//	    console.log("replacing with " + replacement);
	    return replacement;
	});
//	console.log("formula is now " + formula);
	return formula;
    }

    public detokenize(formula: string) : string {
	for (let i = 0; i < this.fns.length; i++) {
	    formula = formula.replace(this.fn2unicode[this.fns[i]], this.fns[i]);
	}
//	console.log("now checking " + formula);
	formula = formula.replace(/([\u2000-\u6000])/g, (_, numStr) => { // handles a reasonable range of differences
	    const replacement = (numStr.charCodeAt(0) - 16384).toString();
//	    console.log("done found: " + numStr);
//	    console.log("replacing with: " + replacement);
	    return replacement;
	});
	return formula;
    }
    
    // Return the diffs (with formulas treated specially).
    public compute_fix_diff(str1, str2, c1, r1, c2, r2) { //c2, r2) {
	// First, "tokenize" the strings.
	str1 = this.tokenize(str1);
	str2 = this.tokenize(str2);
	// Convert to R1C1 format.
	let rc_str1 = ExcelUtils.formulaToR1C1(str1, c1, r1);
	let rc_str2 = ExcelUtils.formulaToR1C1(str2, c2, r2);
//	console.log(rc_str1);
//	console.log(rc_str2);
	// Build up the diff.
	let theDiff = diff.main(rc_str1, rc_str2);
//	console.log(theDiff);
	// Now de-tokenize the diff contents
	// and convert back out of R1C1 format.
	for (let j = 0; j < theDiff.length; j++) {
	    if (theDiff[j][0] == 0) { // No diff
		theDiff[j][1] = this.fromR1C1(theDiff[j][1], c1, r1); // doesn't matter which one
	    } else if (theDiff[j][0] == -1) { // Left diff
		theDiff[j][1] = this.fromR1C1(theDiff[j][1], c1, r1);
	    } else { // Right diff
		theDiff[j][1] = this.fromR1C1(theDiff[j][1], c2, r2);
	    }
	    theDiff[j][1] = this.detokenize(theDiff[j][1]);
	}
	return theDiff;
    }

    public fromR1C1(r1c1_formula : string, origin_col: number, origin_row: number) : string {
	// We assume that formulas have already been 'tokenized'.
	let r1c1 = r1c1_formula.slice();
	const R = "ρ";
	const C = "γ";
	r1c1 = r1c1.replace("R", R); // needs to be 'greeked'
	r1c1 = r1c1.replace("C", C);
	// Both relative (R[..]C[...])
	r1c1 = r1c1.replace(/ρ\[(\-?[0-9])\]γ\[(\-?[0-9])\]/g, (_, row_offset, col_offset) => {
	    let ro = parseInt(row_offset) + 1;
	    let co = parseInt(col_offset) + 1;
	    return ExcelUtils.column_index_to_name(origin_col + co) + (origin_row + ro);
	});
	// Row relative, column absolute (R[..]C...)
	r1c1 = r1c1.replace(/ρ\[(\-?[0-9])\]γ(\-?[0-9])/g, (_, row_offset, col_offset) => {
	    let ro = parseInt(row_offset) + 1;
	    let co = parseInt(col_offset);
	    return ExcelUtils.column_index_to_name(co) + (origin_row + ro);
	});
	// Row absolute, column relative (R...C[..])
	r1c1 = r1c1.replace(/ρ(\-?[0-9])γ\[(\-?[0-9])\]/g, (_, row_offset, col_offset) => {
	    let ro = parseInt(row_offset);
	    let co = parseInt(col_offset) + 1;
	    return ExcelUtils.column_index_to_name(origin_col + co) + ro;
	});
	// Both absolute (R...C...)
	r1c1 = r1c1.replace(/ρ(\-?[0-9])γ(\-?[0-9])/g, (_, row_offset, col_offset) => {
	    let ro = parseInt(row_offset);
	    let co = parseInt(col_offset);
	    return ExcelUtils.column_index_to_name(co) + ro;
	});
	// Now de-greek.
	r1c1 = r1c1.replace(R, "R");
	r1c1 = r1c1.replace(C, "C");
	return r1c1;
    }

    private static redtext = "\u001b[31m";
    private static yellowtext = "\u001b[33m";
    private static greentext = "\u001b[32m";
    private static whitetext = "\u001b[37m";
    private static resettext = "\u001b[0m";
    private static textcolor = [FixDiff.redtext, FixDiff.yellowtext, FixDiff.greentext];

    public pretty_diffs(diffs) : string[] {
	let strList = [];
	// Iterate for -1 and 1.
	for (let i of [-1, 1]) {
	    // console.log(i);
	    let str = "";
	    for (let d of diffs) {
		// console.log("diff = " + JSON.stringify(d));
		if (d[0] === i) {
		    str += (FixDiff.textcolor[i+1] + d[1] + FixDiff.resettext);
		} else if (d[0] == 0) {
		    str += (FixDiff.whitetext + d[1] + FixDiff.resettext);
		}
	    }
	    strList.push(str);
	}
	return strList;
    }
};

let nd = new FixDiff();

// Now try a diff.
let str1 = '=SUM(B6:E6)+100'; // 'ROUND(A1)+12';
let str2 = '=SUM(B7:D7)+10'; // 'ROUNDUP(B2)+12';

//console.log(str1);
//console.log(str2);

let diffs = nd.compute_fix_diff(str1, str2, 6, 6, 6, 7);
//console.log(JSON.stringify(diffs));
let [a, b] = nd.pretty_diffs(diffs);

console.log(a);
console.log("---");
console.log(b);

