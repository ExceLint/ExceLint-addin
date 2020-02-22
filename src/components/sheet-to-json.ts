'use strict';

const fs = require('fs');
const xlsx = require('xlsx');
const sha224 = require('crypto-js/sha224');
const base64 = require('crypto-js/enc-base64');

const general_re = '\\$?[A-Z][A-Z]?\\$?\\d+'; // column and row number, optionally with $
const pair_re = new RegExp('(' + general_re + '):(' + general_re + ')');
const singleton_re = new RegExp(general_re);

enum selections {
    FORMULAS,
    VALUES,
    STYLES
};

function processWorksheet(sheet, selection : selections) {
    let ref = "A1:A1"; // for empty sheets.
    if ("!ref" in sheet) {
	// Not empty.
	ref = sheet["!ref"];
    }
    const decodedRange = xlsx.utils.decode_range(ref);
    const startColumn = decodedRange['s']['c'];
    const startRow    = decodedRange['s']['r'];
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
		case selections.FORMULAS:
		    if (!cellValue['f']) {
			cellValueStr = "";
		    } else {
			cellValueStr = "=" + cellValue['f'];
		    }
		    break;
		case selections.VALUES:
		    // Numeric values.
		    if (cellValue['t'] === 'n') {
			cellValueStr = JSON.stringify(cellValue['v']);
		    }
		    break;
		case selections.STYLES:
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

// Process command-line arguments.
const usageString = 'Usage: $0 <command> [options]';
const args = require('yargs')
    .usage(usageString)
    .command('--input', 'Input from filename (Excel file).')
    .alias('i', 'input')
    .nargs('input', 1)
    .command('--directory', 'Read from a directory of files (all either .xls or .xlsx).')
    .alias('d', 'directory')
    .help('h')
    .alias('h', 'help')
    .argv;

if (args.help) {
    process.exit(0);
}

if ((Boolean(args.input) === Boolean(args.directory))) {
    console.log("Specify exactly one of --input and --directory.");
    console.log(args.input);
    console.log(args.directory);
    process.exit(0);
}

let files = [];
if (args.input) {
    files.push(args.input);
}

let base = '';
if (args.directory) {
    // Load up all files to process.
    files = fs.readdirSync(args.directory).filter((x: string) => x.endsWith('.xls') || x.endsWith('.xlsx'));
    base = args.directory + '/';
}

let outputs = [];
for (let filename of files) {
    let f = xlsx.readFile(base + filename, { "cellStyles": true } );
    //console.log(JSON.stringify(f, null, 4));
    let output = {};
    output["workbookName"] = filename;
    output["worksheets"] = [];
    let sheetNames = f.SheetNames;
    let sheets = f.Sheets;
    for (let sheet of sheetNames) {
	// Try to parse the ref to see if it's a pair (e.g., A1:B10) or a singleton (e.g., C9).
	// If the latter, make it into a pair (e.g., C9:C9).
	let ref;
	if ("!ref" in sheets[sheet]) {
	    ref = sheets[sheet]["!ref"];
	} else {
	    // Empty sheet.
	    ref = "A1:A1";
	}
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
	    "formulas" : processWorksheet(sheets[sheet], selections.FORMULAS),
	    "values" : processWorksheet(sheets[sheet], selections.VALUES),
	    "styles" : processWorksheet(sheets[sheet], selections.STYLES)
	});
    }
    const outputFile = (base + filename).replace('.xlsx', '.json').replace('.xls', '.json');
    fs.writeFileSync(outputFile, JSON.stringify(output));
//    console.log(JSON.stringify(output));
//    outputs.push(output);
}
// Pretty-print
// console.log(JSON.stringify(outputs, null, 4));
//console.log(JSON.stringify(outputs));

