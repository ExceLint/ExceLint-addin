// Process Excel files (input from stdin or file as JSON) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com

'use strict';
let fs = require('fs');
import { Colorize } from './colorize';
import { Timer } from './timer';

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

let output = {
    'workbookName': inp['workbookName'],
    'worksheets': []
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
        'sheetName': sheet.sheetName,
        //        'suspiciousCells': suspicious_cells,
        //        'groupedFormulas': grouped_formulas,
        //        'groupedData': grouped_data,
        'proposedFixes': adjusted_fixes,
        'elapsedTimeSeconds': elapsed / 1e6
    };

    output.worksheets.push(out);
}

console.log(JSON.stringify(output, null, '\t'));
