'use strict';
exports.__esModule = true;
var exceljson_1 = require("./exceljson");
var fs = require('fs');
// Process command-line arguments.
var usageString = 'Usage: $0 <command> [options]';
var args = require('yargs')
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
var files = [];
if (args.input) {
    files.push(args.input);
}
var base = '';
if (args.directory) {
    // Load up all files to process.
    files = fs.readdirSync(args.directory).filter(function (x) { return x.endsWith('.xls') || x.endsWith('.xlsx'); });
    base = args.directory + '/';
}
var outputs = [];
for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
    var filename = files_1[_i];
    console.warn('processing ' + filename);
    var output = exceljson_1.ExcelJSON.processWorkbook(base, filename);
    var outputFile = (base + filename).replace('.xlsx', '.json').replace('.xls', '.json');
    fs.writeFileSync(outputFile, JSON.stringify(output));
    //    console.log(JSON.stringify(output));
    //    outputs.push(output);
}
