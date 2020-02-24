'use strict';

import { ExcelJSON } from './exceljson';
const fs = require('fs');

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
    console.warn('processing ' + filename);
    let output = ExcelJSON.processWorkbook(base, filename);
    const outputFile = (base + filename).replace('.xlsx', '.json').replace('.xls', '.json');
    fs.writeFileSync(outputFile, JSON.stringify(output));
//    console.log(JSON.stringify(output));
//    outputs.push(output);
}
// Pretty-print
// console.log(JSON.stringify(outputs, null, 4));
//console.log(JSON.stringify(outputs));

