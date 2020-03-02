'use strict';

const xlsx = require('xlsx');
const sha224 = require('crypto-js/sha224');
const base64 = require('crypto-js/enc-base64');

export class ExcelJSON {

    private static general_re = '\\$?[A-Z][A-Z]?\\$?\\d+'; // column and row number, optionally with $
    private static pair_re = new RegExp('(' + ExcelJSON.general_re + '):(' + ExcelJSON.general_re + ')');
    private static singleton_re = new RegExp(ExcelJSON.general_re);

    public static processWorksheet(sheet, selection : ExcelJSON.selections) {
	let ref = "A1:A1"; // for empty sheets.
	if ("!ref" in sheet) {
	    // Not empty.
	    ref = sheet["!ref"];
	}
	const decodedRange = xlsx.utils.decode_range(ref);
	const startColumn = 0; // decodedRange['s']['c'];
	const startRow    = 0; // decodedRange['s']['r'];
	const endColumn   = decodedRange['e']['c'];
	const endRow      = decodedRange['e']['r'];
	
	let rows : string[][] = [];
	for (let r = startRow; r <= endRow; r++) {
	    let row : string[] = [];
	    for (let c = startColumn; c <= endColumn; c++) {
		const cell = xlsx.utils.encode_cell({ 'c' : c, 'r' : r });
		const cellValue = sheet[cell];
		// console.log(cell + ': ' + JSON.stringify(cellValue));
		let cellValueStr = "";
		if (cellValue) {
		    switch (selection) {
		    case ExcelJSON.selections.FORMULAS:
			if (!cellValue['f']) {
			    cellValueStr = "";
			} else {
			    cellValueStr = "=" + cellValue['f'];
			}
			break;
		    case ExcelJSON.selections.VALUES:
			// Numeric values.
			if (cellValue['t'] === 'n') {
			    if (('z' in cellValue) && cellValue['z'] && (cellValue['z'].endsWith('yy'))) {
				// ad hoc date matching.
				// skip dates.
			    } else {
				cellValueStr = JSON.stringify(cellValue['v']);
			    }
			}
			break;
		    case ExcelJSON.selections.STYLES:
			if (cellValue['s']) {
			    // Encode the style as a hash (and just keep the first 10 characters).
			    const styleString = JSON.stringify(cellValue['s']);
			    const str = base64.stringify(sha224(styleString));
			    cellValueStr = str.slice(0,10);
			}
			break;
		    }
		}
		row.push(cellValueStr);
	    }
	    rows.push(row);
	}
	return rows;
    }

    public static processWorkbook(base: string, filename: string) {
	let f = xlsx.readFile(base + filename, { "cellStyles": true } );
	//console.log(JSON.stringify(f, null, 4));
	let output = {};
	output["workbookName"] = filename;
	output["worksheets"] = [];
	let sheetNames = f.SheetNames;
	let sheets = f.Sheets;
	for (let sheetName of sheetNames) {
	    if (!sheets[sheetName]) {
		// Weird edge case here.
		continue;
	    }
	    console.warn('  processing ' + filename + '!' + sheetName);
	    // Try to parse the ref to see if it's a pair (e.g., A1:B10) or a singleton (e.g., C9).
	    // If the latter, make it into a pair (e.g., C9:C9).
	    let ref;
	    if ("!ref" in sheets[sheetName]) {
		ref = sheets[sheetName]["!ref"];
	    } else {
		// Empty sheet.
		ref = "A1:A1";
	    }
	    let result = ExcelJSON.pair_re.exec(ref); // ExcelJSON.pair_re.exec(ref);
	    if (result) {
 		// It's a pair; we're fine.
		// ACTUALLY to work around a bug downstream, we start everything at A1.
		// This sucks but it works.
		ref = "A1:" + result[2];
	    } else {
		// Singleton. Make it a pair.
		ref = ref + ":" + ref;
	    }
	    const sheetRange = sheetName + "!" + ref;
	    output["worksheets"].push({
		"sheetName": sheetName,
		"usedRangeAddress": sheetRange,
		"formulas" : ExcelJSON.processWorksheet(sheets[sheetName], ExcelJSON.selections.FORMULAS),
		"values"   : ExcelJSON.processWorksheet(sheets[sheetName], ExcelJSON.selections.VALUES),
		"styles"   : ExcelJSON.processWorksheet(sheets[sheetName], ExcelJSON.selections.STYLES)
	    });
	}
	return output;
    }
};

export namespace ExcelJSON {
    export enum selections {
	FORMULAS,
	VALUES,
	STYLES
    };
}

