// Process Excel files (input from stdin or file as JSON) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com

'use strict';
let fs = require('fs');
let path = require('path');
import { Colorize } from './colorize';
import { Timer } from './timer';

type excelintVector = [number, number, number];

function expand(first : excelintVector, second : excelintVector) : Array<excelintVector> {
    const [fcol, frow] = first;
    const [scol, srow] = second;
    let expanded : Array<excelintVector> = [];
    for (let i = fcol; i <= scol; i++) {
	for (let j = frow; j <= srow; j++) {
	    expanded.push([i, j, 0]);
	}
    }
    return expanded;
}

// import { values } from '@uifabric/utilities';

// Set to true to use the hard-coded example below.
const useExample = false;

// Process command-line arguments.
const args = require('yargs').argv;

if (args.help) {
    console.log('--input FILENAME             Input from FILENAME (.json file).');
    console.log('--formattingDiscount DISC    Set discount for formatting differences (default = 0).');
    process.exit(0);
}

// argument:
// input = filename. Default file is standard input.
let fname = '/dev/stdin';
if (args.input) {
    fname = args.input;
}

// argument:
// formattingDiscount = amount of impact of formatting on fix reporting (0-100%).
let formattingDiscount = 0;
if (args.formattingDiscount) {
    formattingDiscount = args.formattingDiscount;
}
// Ensure formatting discount is within range (0-100, inclusive).
if (formattingDiscount < 0) {
    formattingDiscount = 0;
}
if (formattingDiscount > 100) {
    formattingDiscount = 100;
}
Colorize.setFormattingDiscount(formattingDiscount);

//
// Ready to start processing.
//

let inp = null;

if (useExample) {
    // A simple example.
    inp = {
        workbookName: 'example',
        worksheets: [{
            sheetname: 'Sheet1',
            usedRangeAddress: 'Sheet1!E12:E21',
            formulas: [
                ['=D12'], ['=D13'],
                ['=D14'], ['=D15'],
                ['=D16'], ['=D17'],
                ['=D18'], ['=D19'],
                ['=D20'], ['=C21']
            ],
            values: [
                ['0'], ['0'],
                ['0'], ['0'],
                ['0'], ['0'],
                ['0'], ['0'],
                ['0'], ['0']
            ],
            styles: [
                [''], [''],
                [''], [''],
                [''], [''],
                [''], [''],
                [''], ['']
            ]
        }]
    };
} else {
    // Read from file.
    let content = fs.readFileSync(fname);
    inp = JSON.parse(content);
}

let annotated_bugs = fs.readFileSync('annotations-processed.json');
let bugs = JSON.parse(annotated_bugs);
    
let output = {
    'workbookName': path.basename(inp['workbookName']),
    'worksheets' : {}
}

for (let i = 0; i < inp.worksheets.length; i++) {
    const sheet = inp.worksheets[i];

    // Skip empty sheets.
    if ((sheet.formulas.length === 0) && (sheet.values.length === 0)) {
        continue;
    }

    const myTimer = new Timer('excelint');

    // Get suspicious cells and proposed fixes, among others.
    let [suspicious_cells, grouped_formulas, grouped_data, proposed_fixes]
        = Colorize.process_suspicious(sheet.usedRangeAddress, sheet.formulas, sheet.values);

    // Adjust the fixes based on font stuff. We should allow parameterization here for weighting (as for thresholding).
    // NB: origin_col and origin_row currently hard-coded at 0,0.

    proposed_fixes = Colorize.adjust_proposed_fixes(proposed_fixes, sheet.styles, 0, 0);

    // Adjust the proposed fixes for real (just adjusting the scores downwards by the formatting discount).
    let adjusted_fixes = [];
    // tslint:disable-next-line: forin
    for (let ind = 0; ind < proposed_fixes.length; ind++) {
        const f = proposed_fixes[ind];
        const [score, first, second, sameFormat] = f;
        let adjusted_score = -score;
        if (!sameFormat) {
            adjusted_score *= (100 - formattingDiscount) / 100;
        }
        adjusted_fixes.push([adjusted_score, first, second]);
    }

    const elapsed = myTimer.elapsedTime();

    const out = {
        // 'sheetName': sheet.sheetName,
        //        'suspiciousCells': suspicious_cells,
        //        'groupedFormulas': grouped_formulas,
        //        'groupedData': grouped_data,
        'proposedFixes': adjusted_fixes,
        'elapsedTimeSeconds': elapsed / 1e6
    };

    // Compute precision and recall of proposed fixes, if we have annotated ground truth.
    const workbookBasename = path.basename(inp['workbookName']);
    if (workbookBasename in bugs) {
	if (sheet.sheetName in bugs[workbookBasename]) {
//	    console.log(JSON.stringify(bugs[workbookBasename][sheet.sheetName]));
	    const trueBugs = bugs[workbookBasename][sheet.sheetName]["bugs"];
	    const totalTrueBugs = trueBugs.length;
	    // Build list of bugs.
//	    console.log("proposed fixes = " + JSON.stringify(out["proposedFixes"]));
	    let foundBugs : any = out["proposedFixes"].map(x => {
		//		console.log("x = " + JSON.stringify(x));
		if (x[0] > 0.20) { // threshold! FIXME
		    return expand(x[1][0], x[1][1]).concat(expand(x[2][0], x[2][1]));
		} else {
		    return [];
		}
	    });
	    foundBugs = foundBugs.flat(1);
//	    console.log("true bugs = " + JSON.stringify(trueBugs));
//	    console.log("found bugs = " + JSON.stringify(foundBugs));
	    const trueBugsJSON = trueBugs.map(x => JSON.stringify(x));
	    const foundBugsJSON = foundBugs.map(x => JSON.stringify(x));
	    const truePositives = trueBugsJSON.filter(value => foundBugsJSON.includes(value)).map(x => JSON.parse(x));
	    const falsePositives = foundBugsJSON.filter(value => !trueBugsJSON.includes(value)).map(x => JSON.parse(x));
	    const falseNegatives = trueBugsJSON.filter(value => !foundBugsJSON.includes(value)).map(x => JSON.parse(x));
	    if (foundBugs.length > 0) {
//		console.log("true positives = " + JSON.stringify(truePositives));
//		console.log("false positives = " + JSON.stringify(falsePositives));
		const precision = truePositives.length / (truePositives.length + falsePositives.length);
//		console.log("precision = " + precision);
		out["precision"] = precision;
	    }
	    if (trueBugs.length > 0) {
		const recall = truePositives.length / (falseNegatives.length + truePositives.length);
//		console.log("recall = " + recall);
		out["recall"] = recall;
	    }
//	    const totalFoundBugs = out["proposedFixes"].length; // FIXME NOT REALLY
//	    console.log("total true bugs = " + totalTrueBugs + ", totalFound = " + totalFoundBugs);
//	    console.log("DOH");
	}

    }

    output.worksheets[sheet.sheetName] = out;
    
}

console.log(JSON.stringify(output, null, '\t'));
