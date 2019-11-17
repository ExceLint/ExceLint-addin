// Process Excel files (input from stdin or file as JSON) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com
'use strict';
exports.__esModule = true;
var fs = require('fs');
var path = require('path');
var colorize_1 = require("./colorize");
var timer_1 = require("./timer");
function expand(first, second) {
    var fcol = first[0], frow = first[1];
    var scol = second[0], srow = second[1];
    var expanded = [];
    for (var i = fcol; i <= scol; i++) {
        for (var j = frow; j <= srow; j++) {
            expanded.push([i, j, 0]);
        }
    }
    return expanded;
}
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
var annotated_bugs = fs.readFileSync('annotations-processed.json');
var bugs = JSON.parse(annotated_bugs);
var output = {
    'workbookName': path.basename(inp['workbookName']),
    'worksheets': {}
};
var _loop_1 = function (i) {
    var sheet = inp.worksheets[i];
    // Skip empty sheets.
    if ((sheet.formulas.length === 0) && (sheet.values.length === 0)) {
        return "continue";
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
        // 'sheetName': sheet.sheetName,
        //        'suspiciousCells': suspicious_cells,
        //        'groupedFormulas': grouped_formulas,
        //        'groupedData': grouped_data,
        'proposedFixes': adjusted_fixes,
        'elapsedTimeSeconds': elapsed / 1e6
    };
    // Compute precision and recall of proposed fixes, if we have annotated ground truth.
    var workbookBasename = path.basename(inp['workbookName']);
    if (workbookBasename in bugs) {
        if (sheet.sheetName in bugs[workbookBasename]) {
            //	    console.log(JSON.stringify(bugs[workbookBasename][sheet.sheetName]));
            var trueBugs = bugs[workbookBasename][sheet.sheetName]["bugs"];
            var totalTrueBugs = trueBugs.length;
            // Build list of bugs.
            //	    console.log("proposed fixes = " + JSON.stringify(out["proposedFixes"]));
            var foundBugs = out["proposedFixes"].map(function (x) {
                //		console.log("x = " + JSON.stringify(x));
                if (x[0] > 0.20) { // threshold! FIXME
                    return expand(x[1][0], x[1][1]).concat(expand(x[2][0], x[2][1]));
                }
                else {
                    return [];
                }
            });
            foundBugs = foundBugs.flat(1);
            //	    console.log("true bugs = " + JSON.stringify(trueBugs));
            //	    console.log("found bugs = " + JSON.stringify(foundBugs));
            var trueBugsJSON_1 = trueBugs.map(function (x) { return JSON.stringify(x); });
            var foundBugsJSON_1 = foundBugs.map(function (x) { return JSON.stringify(x); });
            var truePositives = trueBugsJSON_1.filter(function (value) { return foundBugsJSON_1.includes(value); }).map(function (x) { return JSON.parse(x); });
            var falsePositives = foundBugsJSON_1.filter(function (value) { return !trueBugsJSON_1.includes(value); }).map(function (x) { return JSON.parse(x); });
            var falseNegatives = trueBugsJSON_1.filter(function (value) { return !foundBugsJSON_1.includes(value); }).map(function (x) { return JSON.parse(x); });
            if (foundBugs.length > 0) {
                //		console.log("true positives = " + JSON.stringify(truePositives));
                //		console.log("false positives = " + JSON.stringify(falsePositives));
                var precision = truePositives.length / (truePositives.length + falsePositives.length);
                //		console.log("precision = " + precision);
                out["precision"] = precision;
            }
            if (trueBugs.length > 0) {
                var recall = truePositives.length / (falseNegatives.length + truePositives.length);
                //		console.log("recall = " + recall);
                out["recall"] = recall;
            }
            //	    const totalFoundBugs = out["proposedFixes"].length; // FIXME NOT REALLY
            //	    console.log("total true bugs = " + totalTrueBugs + ", totalFound = " + totalFoundBugs);
            //	    console.log("DOH");
        }
    }
    output.worksheets[sheet.sheetName] = out;
};
for (var i = 0; i < inp.worksheets.length; i++) {
    _loop_1(i);
}
console.log(JSON.stringify(output, null, '\t'));
