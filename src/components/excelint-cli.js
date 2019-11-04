// Process Excel files (input from stdin or file as JSON) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com
'use strict';
exports.__esModule = true;
var fs = require('fs');
var colorize_1 = require("./colorize");
var timer_1 = require("./timer");
// import { values } from '@uifabric/utilities';
// Set to true to use the hard-coded example below.
var useExample = false;
// Process command-line arguments.
var args = require('yargs').argv;
if (args.help) {
    console.log('--input FILENAME             Input from FILENAME (.json file).');
    console.log('--formattingDiscount DISC    Set discount for formatting differences (default = 0).');
    process.exit(0);
}
// argument:
// input = filename. Default file is standard input.
var fname = '/dev/stdin';
if (args.input) {
    fname = args.input;
}
// argument:
// formattingDiscount = amount of impact of formatting on fix reporting (0-100%).
var formattingDiscount = 0;
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
colorize_1.Colorize.setFormattingDiscount(formattingDiscount);
//
// Ready to start processing.
//
var inp = null;
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
}
else {
    // Read from file.
    var content = fs.readFileSync(fname);
    inp = JSON.parse(content);
}
var output = {
    'workbookName': inp['workbookName'],
    'worksheets': []
};
for (var i = 0; i < inp.worksheets.length; i++) {
    var sheet = inp.worksheets[i];
    // Skip empty sheets.
    if ((sheet.formulas.length === 0) && (sheet.values.length === 0)) {
        continue;
    }
    var myTimer = new timer_1.Timer('excelint');
    // Get suspicious cells and proposed fixes, among others.
    var _a = colorize_1.Colorize.process_suspicious(sheet.usedRangeAddress, sheet.formulas, sheet.values), suspicious_cells = _a[0], grouped_formulas = _a[1], grouped_data = _a[2], proposed_fixes = _a[3];
    // Adjust the fixes based on font stuff. We should allow parameterization here for weighting (as for thresholding).
    // NB: origin_col and origin_row currently hard-coded at 0,0.
    proposed_fixes = colorize_1.Colorize.adjust_proposed_fixes(proposed_fixes, sheet.styles, 0, 0);
    // Adjust the proposed fixes for real (just adjusting the scores downwards by the formatting discount).
    var adjusted_fixes = [];
    // tslint:disable-next-line: forin
    for (var ind = 0; ind < proposed_fixes.length; ind++) {
        var f = proposed_fixes[ind];
        var score = f[0], first = f[1], second = f[2], sameFormat = f[3];
        var adjusted_score = -score;
        if (!sameFormat) {
            adjusted_score *= (100 - formattingDiscount) / 100;
        }
        adjusted_fixes.push([adjusted_score, first, second]);
    }
    var elapsed = myTimer.elapsedTime();
    var out = {
        'sheetName': sheet.sheetName,
        'suspiciousCells': suspicious_cells,
        //        'groupedFormulas': grouped_formulas,
        //        'groupedData': grouped_data,
        'proposedFixes': adjusted_fixes,
        'elapsedTimeSeconds': elapsed / 1e6
    };
    output.worksheets.push(out);
}
console.log(JSON.stringify(output, null, '\t'));
