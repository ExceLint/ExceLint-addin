// Process Excel files (input from stdin or file as JSON) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com
'use strict';
exports.__esModule = true;
var fs = require('fs');
var path = require('path');
var colorize_1 = require("./colorize");
var timer_1 = require("./timer");
// Convert a rectangle into a list of indices.
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
// Set to true to use the hard-coded example below.
var useExample = false;
var usageString = 'Usage: $0 <command> [options]';
var defaultFormattingDiscount = colorize_1.Colorize.getFormattingDiscount();
var defaultReportingThreshold = colorize_1.Colorize.getReportingThreshold();
// Process command-line arguments.
var args = require('yargs')
    .usage(usageString)
    .command('input', 'Input from FILENAME (.json file).')
    .alias('i', 'input')
    .nargs('input', 1)
    .command('directory', 'Read from a directory of files (all ending in .json).')
    .alias('d', 'directory')
    .command('formattingDiscount', 'Set discount for formatting differences (default = ' + defaultFormattingDiscount + ').')
    .command('reportingThreshold', 'Set the threshold % for reporting suspicious formulas (default = ' + defaultReportingThreshold + ').')
    .command('suppressOutput', 'Don\'t output the processed JSON input to stdout.')
    .command('sweep', 'Perform a parameter sweep and report the best settings overall.')
    .help('h')
    .alias('h', 'help')
    .argv;
if (args.help) {
    process.exit(0);
}
var allFiles = [];
if (args.directory) {
    // Load up all files to process.
    allFiles = fs.readdirSync(args.directory).filter(function (x) { return x.endsWith('.json'); });
}
console.log(JSON.stringify(allFiles));
// argument:
// input = filename. Default file is standard input.
var fname = '/dev/stdin';
if (args.input) {
    fname = args.input;
    allFiles = [fname];
}
// argument:
// formattingDiscount = amount of impact of formatting on fix reporting (0-100%).
var formattingDiscount = defaultFormattingDiscount;
if ('formattingDiscount' in args) {
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
// As above, but for reporting threshold.
var reportingThreshold = defaultReportingThreshold;
if ('reportingThreshold' in args) {
    reportingThreshold = args.reportingThreshold;
}
// Ensure formatting discount is within range (0-100, inclusive).
if (reportingThreshold < 0) {
    reportingThreshold = 0;
}
if (reportingThreshold > 100) {
    reportingThreshold = 100;
}
colorize_1.Colorize.setReportingThreshold(reportingThreshold);
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
var annotated_bugs = fs.readFileSync('annotations-processed.json');
var bugs = JSON.parse(annotated_bugs);
var base = '';
if (args.directory) {
    base = args.directory + '/';
}
var parameters = [];
if (args.sweep) {
    var step = 10;
    for (var i = 0; i <= 100; i += step) {
        for (var j = 0; j <= 100; j += step) {
            parameters.push([i, j]);
        }
    }
}
else {
    parameters = [[formattingDiscount, reportingThreshold]];
}
var f1scores = [];
for (var _i = 0, parameters_1 = parameters; _i < parameters_1.length; _i++) {
    var parms = parameters_1[_i];
    formattingDiscount = parms[0];
    colorize_1.Colorize.setFormattingDiscount(formattingDiscount);
    reportingThreshold = parms[1];
    colorize_1.Colorize.setReportingThreshold(reportingThreshold);
    var scores = [];
    for (var _a = 0, allFiles_1 = allFiles; _a < allFiles_1.length; _a++) {
        var fname_1 = allFiles_1[_a];
        console.log('fname = ' + fname_1);
        // Read from file.
        var content = fs.readFileSync(base + fname_1);
        inp = JSON.parse(content);
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
            // Get rid of multiple exclamation points in the used range address,
            // as these interfere with later regexp parsing.
            var usedRangeAddress = sheet.usedRangeAddress;
            usedRangeAddress = usedRangeAddress.replace(/!(!+)/, '!');
            var myTimer = new timer_1.Timer('excelint');
            // Get suspicious cells and proposed fixes, among others.
            var _a = colorize_1.Colorize.process_suspicious(usedRangeAddress, sheet.formulas, sheet.values), suspicious_cells = _a[0], grouped_formulas = _a[1], grouped_data = _a[2], proposed_fixes = _a[3];
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
                if (adjusted_score * 100 >= reportingThreshold) {
                    adjusted_fixes.push([adjusted_score, first, second]);
                }
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
                    var trueBugs = bugs[workbookBasename][sheet.sheetName]['bugs'];
                    var totalTrueBugs = trueBugs.length;
                    // Build list of bugs.
                    var foundBugs = out['proposedFixes'].map(function (x) {
                        if (x[0] >= (reportingThreshold / 100)) {
                            return expand(x[1][0], x[1][1]).concat(expand(x[2][0], x[2][1]));
                        }
                        else {
                            return [];
                        }
                    });
                    foundBugs = foundBugs.flat(1);
                    var trueBugsJSON_1 = trueBugs.map(function (x) { return JSON.stringify(x); });
                    var foundBugsJSON_1 = foundBugs.map(function (x) { return JSON.stringify(x); });
                    var truePositives = trueBugsJSON_1.filter(function (value) { return foundBugsJSON_1.includes(value); }).map(function (x) { return JSON.parse(x); });
                    var falsePositives = foundBugsJSON_1.filter(function (value) { return !trueBugsJSON_1.includes(value); }).map(function (x) { return JSON.parse(x); });
                    var falseNegatives = trueBugsJSON_1.filter(function (value) { return !foundBugsJSON_1.includes(value); }).map(function (x) { return JSON.parse(x); });
                    var precision = 0;
                    var recall = 0;
                    if (foundBugs.length > 0) {
                        precision = truePositives.length / (truePositives.length + falsePositives.length);
                        out['precision'] = precision;
                    }
                    if (trueBugs.length > 0) {
                        recall = truePositives.length / (falseNegatives.length + truePositives.length);
                        out['recall'] = recall;
                    }
                    if (precision + recall > 0) {
                        // F1 score: https://en.wikipedia.org/wiki/F1_score
                        var f1score = (2 * precision * recall) / (precision + recall);
                        scores.push(f1score);
                    }
                }
            }
            output.worksheets[sheet.sheetName] = out;
        };
        for (var i = 0; i < inp.worksheets.length; i++) {
            _loop_1(i);
        }
        if (!args.suppressOutput) {
            console.log(JSON.stringify(output, null, '\t'));
        }
    }
    var averageScores = 0;
    if (scores.length > 0) {
        averageScores = scores.reduce(function (a, b) { return a + b; }, 0) / scores.length;
    }
    f1scores.push([formattingDiscount, reportingThreshold, averageScores]);
}
f1scores.sort(function (a, b) { if (a[2] < b[2]) {
    return -1;
} ; if (a[2] > b[2]) {
    return 1;
} return 0; });
// Now find the lowest threshold with the highest F1 score.
var maxScore = f1scores.reduce(function (a, b) { if (a[2] > b[2]) {
    return a[2];
}
else {
    return b[2];
} });
console.log('maxScore = ' + maxScore);
// Find the first one with the max.
var firstMax = f1scores.find(function (item) { return item[2] === maxScore; });
console.log('first max = ' + firstMax);
console.log(JSON.stringify(f1scores));
