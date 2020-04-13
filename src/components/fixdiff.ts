let fs = require('fs');
let textdiff = require('text-diff');
let diff = new textdiff();

import { ExcelUtils } from './excelutils';



class CellEncoder {

    private static maxRows : number = 64;
    private static maxColumns : number = 32;
    private static absoluteRowMultiplier : number = 2 * CellEncoder.maxRows * CellEncoder.maxColumns;  // if bit set, absolute row
    private static absoluteColumnMultiplier : number = 2 * CellEncoder.absoluteRowMultiplier;          // if bit set, absolute column
    
    public static startPoint : number = 2048;

    public static encode(col: number, row: number, absoluteColumn: boolean = false, absoluteRow: boolean = false) : number {
	console.log("encode: col = (" + col + ")");
	console.log("encode: row = (" + row + ")");
	const addAbsolutes = Number(absoluteRow) * CellEncoder.absoluteRowMultiplier
	    + Number(absoluteColumn) * CellEncoder.absoluteColumnMultiplier;
	return addAbsolutes + CellEncoder.maxRows * (CellEncoder.maxColumns / 2 + col)
	    + (CellEncoder.maxRows / 2 + row)
	    + CellEncoder.startPoint;
    }
    
    public static encodeToChar(col: number, row: number, absoluteColumn: boolean = false, absoluteRow: boolean = false) : string {
	console.log("col = " + col + ", row = " + row);
	console.log("encoded num = " + CellEncoder.encode(col, row, absoluteColumn, absoluteRow));
	const chr = String.fromCodePoint(CellEncoder.encode(col, row, absoluteColumn, absoluteRow));
	console.log('chr = ' + chr);
	console.log('code = ' + chr.codePointAt(0));
	return chr;
    }

    private static decodeColumn(encoded: number) : number {
	encoded -= CellEncoder.startPoint;
	return Math.floor(encoded / CellEncoder.maxRows) - CellEncoder.maxColumns / 2;
    }
    
    private static decodeRow(encoded: number) : number {
	encoded -= CellEncoder.startPoint;
	return (encoded % CellEncoder.maxRows) - CellEncoder.maxRows / 2;
    }

    public static decodeFromChar(chr: string): [number, number, boolean, boolean] {
	console.log("decodeFromChar(" + chr + ")");
	let decodedNum = chr.codePointAt(0);
	console.log("decodedNum = " + decodedNum);
	console.log("absolute column multiplier = " + CellEncoder.absoluteColumnMultiplier);
	console.log("absolute row multiplier = " + CellEncoder.absoluteRowMultiplier);
	let absoluteColumn = false;
	let absoluteRow = false;
	if (decodedNum & CellEncoder.absoluteRowMultiplier) {
	    decodedNum &= ~CellEncoder.absoluteRowMultiplier;
	    absoluteRow = true;
	}
	if (decodedNum & CellEncoder.absoluteColumnMultiplier) {
	    decodedNum &= ~CellEncoder.absoluteColumnMultiplier;
	    absoluteColumn = true;
	}
	console.log("decoded num = " + decodedNum);
	console.log("absolute column: " + absoluteColumn);
	console.log("absolute row: " + absoluteRow);
	const result : [number, number, boolean, boolean] = [CellEncoder.decodeColumn(decodedNum), CellEncoder.decodeRow(decodedNum), absoluteColumn, absoluteRow];
	return result;
    }

    public static maxEncodedSize() : number {
	return CellEncoder.encode(CellEncoder.maxColumns - 1, CellEncoder.maxRows - 1) - CellEncoder.encode(-(CellEncoder.maxColumns-1), -(CellEncoder.maxRows-1));
    }

    public static test() : void {
	for (let col = -CellEncoder.maxColumns; col < CellEncoder.maxColumns; col++) {
	    for (let row = -CellEncoder.maxRows; row < CellEncoder.maxRows; row++) {
		let encoded = CellEncoder.encode(col, row);
		let decodedCol = CellEncoder.decodeColumn(encoded);
		let decodedRow = CellEncoder.decodeRow(encoded);
		//	console.log(decodedCol + " " + decodedRow);
		console.assert(col === decodedCol, "NOPE COL");
		console.assert(row === decodedRow, "NOPE ROW");
	    }
	}
    }
}



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
	this.fns.sort((a,b) => {
	    if (a.length < b.length) {
		return 1;
	    }
	    if (a.length > b.length) {
		return -1;
	    } else {
		// Sort in alphabetical order.
		if (a < b) { return -1; }
		if (a > b) { return 1; }
		return 0;
	    }
	});
    }
    
    //private static absoluteGreek = "α";
    //private static relativeGreek = "ρ";
    
    constructor() {
	this.initArrays();
//	console.log(this.fns);
    }

    public static toPseudoR1C1(srcCell : string, destCell: string) : string {
	// Dependencies are column, then row.
	const vec1 = ExcelUtils.cell_dependency(srcCell, 0, 0);
	const vec2 = ExcelUtils.cell_dependency(destCell, 0, 0);
	// Compute the difference.
	let resultVec = [];
	vec2.forEach((item, index, _) => { resultVec.push(item - vec1[index]); });
	// Now generate the pseudo R1C1 version, which varies
	// depending whether it's a relative or absolute reference.
	let resultStr : string = "";
	if (ExcelUtils.cell_both_absolute.exec(destCell)) {
	    resultStr = CellEncoder.encodeToChar(vec2[0], vec2[1], true, true);
	} else if (ExcelUtils.cell_col_absolute.exec(destCell)) {
	    resultStr = CellEncoder.encodeToChar(vec2[0], resultVec[1], true, false);
	} else if (ExcelUtils.cell_row_absolute.exec(destCell)) {
	    resultStr = CellEncoder.encodeToChar(resultVec[0], vec2[1], false, true);
	} else {
	    // Common case, both relative.
	    resultStr = CellEncoder.encodeToChar(resultVec[0], resultVec[1], false, false);
	}
	return resultStr;
    }

    public static formulaToPseudoR1C1(formula: string, origin_col: number, origin_row: number) : string {
	let range = formula.slice();
	const origin = ExcelUtils.column_index_to_name(origin_col) + origin_row;
	// First, get all the range pairs out.
	let found_pair;
	while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
		let first_cell = found_pair[1];
		let last_cell = found_pair[2];
		range = range.replace(found_pair[0], FixDiff.toPseudoR1C1(origin,found_pair[1]) + ":" + FixDiff.toPseudoR1C1(origin, found_pair[2]));
            }
	}
	
	// Now look for singletons.
	let singleton = null;
	while (singleton = ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
		let first_cell = singleton[1];
		range = range.replace(singleton[0], FixDiff.toPseudoR1C1(origin, first_cell));
            }
	}
	return range;
    }

    public tokenize(formula: string) : string {
	for (let i = 0; i < this.fns.length; i++) {
	    formula = formula.replace(this.fns[i], this.fn2unicode[this.fns[i]]);
	}
//	console.log("TOKENIZING " + formula);
	formula = formula.replace(/(\-?\d+)/g, (_, num) => {
	    console.log("found " + num);
	    const replacement = String.fromCodePoint(16384 + parseInt(num));
	    console.log("replacing with " + replacement);
	    return replacement;
	});
//	console.log("formula is now " + formula);
	return formula;
    }

    public detokenize(formula: string) : string {
	console.log("DETOKENIZING " + formula);
	for (let i = 0; i < this.fns.length; i++) {
	    formula = formula.replace(this.fn2unicode[this.fns[i]], this.fns[i]);
	}
	console.log("formula is now " + formula);
	return formula;
    }
    
    // Return the diffs (with formulas treated specially).
    public compute_fix_diff(str1, str2, c1, r1, c2, r2) { //c2, r2) {
	// First, "tokenize" the strings.
	console.log(str1);
	console.log(str2);
	// Convert to R1C1 format.
	let rc_str1 = FixDiff.formulaToPseudoR1C1(str1, c1, r1); // ExcelUtils.formulaToR1C1(str1, c1, r1);
	let rc_str2 = FixDiff.formulaToPseudoR1C1(str2, c2, r2); // ExcelUtils.formulaToR1C1(str2, c2, r2);
	console.log("Pseudo R1C1: ");
	console.log(rc_str1);
	console.log(rc_str2);
	rc_str1 = this.tokenize(rc_str1);
	rc_str2 = this.tokenize(rc_str2);
	console.log("Pseudo R1C1 tokenized: ");
	console.log(rc_str1);
	console.log(rc_str2);
	// Build up the diff.
	let theDiff = diff.main(rc_str1, rc_str2);
	console.log("diff " + JSON.stringify(theDiff));
	// Now de-tokenize the diff contents
	// and convert back out of R1C1 format.
	for (let j = 0; j < theDiff.length; j++) {
	    console.log("processing " + JSON.stringify(theDiff[j][1]));
	    if (theDiff[j][0] == 0) { // No diff
		theDiff[j][1] = this.fromPseudoR1C1(theDiff[j][1], c1, r1); ///FIXME // doesn't matter which one
	    } else if (theDiff[j][0] == -1) { // Left diff
		theDiff[j][1] = this.fromPseudoR1C1(theDiff[j][1], c1, r1);
	    } else { // Right diff
		theDiff[j][1] = this.fromPseudoR1C1(theDiff[j][1], c2, r2);
	    }
	    console.log("about to detokenize " + JSON.stringify(theDiff[j][1]));
	    theDiff[j][1] = this.detokenize(theDiff[j][1]);
	}
	diff.cleanupSemantic(theDiff);
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


    public fromPseudoR1C1(r1c1_formula : string, origin_col: number, origin_row: number) : string {
	// We assume that formulas have already been 'tokenized'.
	console.log("fromPseudoR1C1 = " + r1c1_formula + ", origin_col = " + origin_col + ", origin_row = " + origin_row);
	let r1c1 = r1c1_formula.slice();
	// Find the Unicode characters and decode them.
	r1c1 = r1c1.replace(/([\u800-\uF000])/g, (_full, encoded_char) => {
	    if (encoded_char.codePointAt(0) < CellEncoder.startPoint) {
		return encoded_char;
	    }
	    console.log("encoded char = (" + encoded_char + ")");
	    console.log("value of char = " + encoded_char.codePointAt(0));
	    let [co, ro, absCo, absRo] = CellEncoder.decodeFromChar(encoded_char);
	    console.log(JSON.stringify([ro, co]));
	    let result: string;
	    if (!absCo && !absRo) {
		// Both relative (R[..]C[...])
		result = ExcelUtils.column_index_to_name(origin_col + co) + (origin_row + ro);
	    }
	    if (absCo && !absRo) {
		// Row absolute, column relative (R...C[..])
		result = ExcelUtils.column_index_to_name(origin_col + co) + '$' + ro;
	    }
	    if (!absCo && absRo) {
		// Row relative, column absolute (R[..]C...)
		result = '$' + ExcelUtils.column_index_to_name(co) + (origin_row + ro);
	    }
	    if (absCo && absRo) {
		// Both absolute (R...C...)
		result = '$'  + ExcelUtils.column_index_to_name(co) + '$' + ro;
	    }
	    console.log("converted to " + result);
	    return result;
	});
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
}

let nd = new FixDiff();

// Now try a diff.
let [row1, col1] = [1, 2];
let [row2, col2] = [1, 3];
//let [row1, col1] = [11, 2];
//let [row2, col2] = [11, 3];
//let str1 = '=ROUND(B7:B9)'; // 'ROUND(A1)+12';
//let str2 = '=ROUND(C7:C10)'; // 'ROUNDUP(B2)+12';
let str1 = '=ROUND($A1:B9)'; // 'ROUND(A1)+12';
let str2 = '=ROUND($A1:C10)'; // 'ROUNDUP(B2)+12';

console.log(ExcelUtils.column_index_to_name(col1) + row1);
console.log(ExcelUtils.column_index_to_name(col2) + row2);
//console.log(str1);
//console.log(str2);

let diffs = nd.compute_fix_diff(str1, str2, col1 - 1, row1 - 1, col2 - 1, row2 - 1);
console.log(JSON.stringify(diffs));
let [a, b] = nd.pretty_diffs(diffs);

if (false) {
    
    console.log(".....");
    
    
    console.log(CellEncoder.maxEncodedSize());
    let x = CellEncoder.encodeToChar(3, 4);
    console.log(x);
    console.log(JSON.stringify(CellEncoder.decodeFromChar(x)));
    



    let encoded = FixDiff.toPseudoR1C1("C10", "B10");
    
    console.log(encoded);
    console.log(JSON.stringify(CellEncoder.decodeFromChar(encoded)));
    
    let encodedFormula = FixDiff.formulaToPseudoR1C1("=ROUND(B1:B10)", 2, 11);
    console.log("encoded formula = " + encodedFormula);

}

console.log(a);
console.log("---");
console.log(b);

