// Process Excel files (input from stdin or file as JSON) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com

'use strict';
let fs = require('fs');
let path = require('path');
import { Colorize } from './colorize';
import { Timer } from './timer';
import { string } from 'prop-types';

type excelintVector = [number, number, number];

// Convert a rectangle into a list of indices.
function expand(first: excelintVector, second: excelintVector): Array<excelintVector> {
    const [fcol, frow] = first;
    const [scol, srow] = second;
    let expanded: Array<excelintVector> = [];
    for (let i = fcol; i <= scol; i++) {
        for (let j = frow; j <= srow; j++) {
            expanded.push([i, j, 0]);
        }
    }
    return expanded;
}

// Set to true to use the hard-coded example below.
const useExample = false;

const usageString = 'Usage: $0 <command> [options]';
const defaultFormattingDiscount = Colorize.getFormattingDiscount();
const defaultReportingThreshold = Colorize.getReportingThreshold();

// Process command-line arguments.
const args = require('yargs')
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

let allFiles = [];

if (args.directory) {
    // Load up all files to process.
    allFiles = fs.readdirSync(args.directory).filter((x: string) => x.endsWith('.json'));
}
console.log(JSON.stringify(allFiles));

// argument:
// input = filename. Default file is standard input.
let fname = '/dev/stdin';
if (args.input) {
    fname = args.input;
    allFiles = [fname];
}

// argument:
// formattingDiscount = amount of impact of formatting on fix reporting (0-100%).
let formattingDiscount = defaultFormattingDiscount;
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
Colorize.setFormattingDiscount(formattingDiscount);


// As above, but for reporting threshold.
let reportingThreshold = defaultReportingThreshold;
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
Colorize.setReportingThreshold(reportingThreshold);

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
}

let annotated_bugs = fs.readFileSync('annotations-processed.json');
let bugs = JSON.parse(annotated_bugs);

let base = '';
if (args.directory) {
    base = args.directory + '/';
}

let parameters = [];
if (args.sweep) {
    const step = 10;
    for (let i = 0; i <= 100; i += step) {
        for (let j = 0; j <= 100; j += step) {
            parameters.push([i, j]);
        }
    }
} else {
    parameters = [[formattingDiscount, reportingThreshold]];
}

let f1scores = [];

for (let parms of parameters) {
    formattingDiscount = parms[0];
    Colorize.setFormattingDiscount(formattingDiscount);
    reportingThreshold = parms[1];
    Colorize.setReportingThreshold(reportingThreshold);

    let scores = [];

    for (let fname of allFiles) {
        console.log('fname = ' + fname);
        // Read from file.
        let content = fs.readFileSync(base + fname);
        inp = JSON.parse(content);

        let output = {
            'workbookName': path.basename(inp['workbookName']),
            'worksheets': {}
        };

        for (let i = 0; i < inp.worksheets.length; i++) {
            const sheet = inp.worksheets[i];

            // Skip empty sheets.
            if ((sheet.formulas.length === 0) && (sheet.values.length === 0)) {
                continue;
            }

            // Get rid of multiple exclamation points in the used range address,
            // as these interfere with later regexp parsing.
            let usedRangeAddress = sheet.usedRangeAddress;
            usedRangeAddress = usedRangeAddress.replace(/!(!+)/, '!');

            const myTimer = new Timer('excelint');

            // Get suspicious cells and proposed fixes, among others.
            let [suspicious_cells, grouped_formulas, grouped_data, proposed_fixes]
                = Colorize.process_suspicious(usedRangeAddress, sheet.formulas, sheet.values);

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
                if (adjusted_score * 100 >= reportingThreshold) {
                    adjusted_fixes.push([adjusted_score, first, second]);
                }
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
                    const trueBugs = bugs[workbookBasename][sheet.sheetName]['bugs'];
                    const totalTrueBugs = trueBugs.length;
                    // Build list of bugs.
                    let foundBugs: any = out['proposedFixes'].map(x => {
                        if (x[0] >= (reportingThreshold / 100)) {
                            return expand(x[1][0], x[1][1]).concat(expand(x[2][0], x[2][1]));
                        } else {
                            return [];
                        }
                    });
                    foundBugs = foundBugs.flat(1);
                    const trueBugsJSON = trueBugs.map(x => JSON.stringify(x));
                    const foundBugsJSON = foundBugs.map(x => JSON.stringify(x));
                    const truePositives = trueBugsJSON.filter(value => foundBugsJSON.includes(value)).map(x => JSON.parse(x));
                    const falsePositives = foundBugsJSON.filter(value => !trueBugsJSON.includes(value)).map(x => JSON.parse(x));
                    const falseNegatives = trueBugsJSON.filter(value => !foundBugsJSON.includes(value)).map(x => JSON.parse(x));
                    let precision = 0;
                    let recall = 0;
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
                        const f1score = (2 * precision * recall) / (precision + recall);
                        scores.push(f1score);
                    }
                }
            }
            output.worksheets[sheet.sheetName] = out;
        }
        if (!args.suppressOutput) {
            console.log(JSON.stringify(output, null, '\t'));
        }
    }
    let averageScores = 0;
    if (scores.length > 0) {
        averageScores = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
    f1scores.push([formattingDiscount, reportingThreshold, averageScores]);
}
f1scores.sort((a, b) => { if (a[2] < b[2]) { return -1; }; if (a[2] > b[2]) { return 1; } return 0; });
// Now find the lowest threshold with the highest F1 score.
const maxScore = f1scores.reduce((a, b) => { if (a[2] > b[2]) { return a[2]; } else { return b[2]; } });
console.log('maxScore = ' + maxScore);
// Find the first one with the max.
const firstMax = f1scores.find(item => { return item[2] === maxScore; });
console.log('first max = ' + firstMax);
console.log(JSON.stringify(f1scores));
