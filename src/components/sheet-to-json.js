"use strict;"

const filename = 'tiny-sheet.xlsx';
const general_re = '\\$?[A-Z][A-Z]?\\$?\\d+'; // column and row number, optionally with $
const pair_re = new RegExp('(' + general_re + '):(' + general_re + ')');
const singleton_re = new RegExp(general_re);

function processWorksheet(sheet, formulas) {
    let ref = sheets[sheet]["!ref"];
    const decodedRange = xlsx.utils.decode_range(ref);
    const startColumn = decodedRange['s']['c'];
    const startRow    = decodedRange['s']['r'];
    const endColumn   = decodedRange['e']['c'];
    const endRow      = decodedRange['e']['r'];
    let rows = [];
    for (let r = startRow; r <= endRow; r++) {
	let row = [];
	for (let c = startColumn; c <= endColumn; c++) {
	    const cell = xlsx.utils.encode_cell({ 'c' : c, 'r' : r });
	    const cellValue = sheets[sheet][cell];
	    // console.log(cell + ': ' + JSON.stringify(cellValue));
	    let cellValueStr = "";
	    if (cellValue) {
		if (formulas) {
		    if (!cellValue['f']) {
			cellValueStr = "";
		    } else {
			cellValueStr = "=" + cellValue['f'];
		    }
		} else {
		    // Numeric values.
		    if (cellValue['t'] === 'n') {
			cellValueStr = cellValue['v'];
		    }
		}
	    }
	    row.push(cellValueStr);
	}
	rows.push(row);
    }
    return rows;
}

const xlsx = require('xlsx');
let f = xlsx.readFile(filename);
//console.log(JSON.stringify(f, null, 4));
let output = {};
output["workbookName"] = filename;
output["worksheets"] = [];
let sheetNames = f.SheetNames;
let sheets = f.Sheets;
for (let sheet of sheetNames) {
    // Try to parse the ref to see if it's a pair (e.g., A1:B10) or a singleton (e.g., C9).
    // If the latter, make it into a pair (e.g., C9:C9).
    let ref = sheets[sheet]["!ref"];
    let result = pair_re.exec(ref); // pair_re.exec(ref);
    if (result) {
 	// It's a pair; we're fine.
    } else {
	// Singleton. Make it a pair.
	ref = ref + ":" + ref;
    }
    const sheetRange = sheet + "!" + ref;
    output["worksheets"].push({
	"sheetName": sheet,
	"usedRangeAddress": sheetRange,
	"formulas" : processWorksheet(sheet, true),
	"values" : processWorksheet(sheet, false)
    });
}

console.log(JSON.stringify(output, null, 4));
