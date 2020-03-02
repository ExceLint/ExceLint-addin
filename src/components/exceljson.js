'use strict';
exports.__esModule = true;
var xlsx = require('xlsx');
var sha224 = require('crypto-js/sha224');
var base64 = require('crypto-js/enc-base64');
var ExcelJSON = /** @class */ (function () {
    function ExcelJSON() {
    }
    ExcelJSON.processWorksheet = function (sheet, selection) {
        var ref = "A1:A1"; // for empty sheets.
        if ("!ref" in sheet) {
            // Not empty.
            ref = sheet["!ref"];
        }
        var decodedRange = xlsx.utils.decode_range(ref);
        var startColumn = 0; // decodedRange['s']['c'];
        var startRow = 0; // decodedRange['s']['r'];
        var endColumn = decodedRange['e']['c'];
        var endRow = decodedRange['e']['r'];
        var rows = [];
        for (var r = startRow; r <= endRow; r++) {
            var row = [];
            for (var c = startColumn; c <= endColumn; c++) {
                var cell = xlsx.utils.encode_cell({ 'c': c, 'r': r });
                var cellValue = sheet[cell];
                // console.log(cell + ': ' + JSON.stringify(cellValue));
                var cellValueStr = "";
                if (cellValue) {
                    switch (selection) {
                        case ExcelJSON.selections.FORMULAS:
                            if (!cellValue['f']) {
                                cellValueStr = "";
                            }
                            else {
                                cellValueStr = "=" + cellValue['f'];
                            }
                            break;
                        case ExcelJSON.selections.VALUES:
                            // Numeric values.
                            if (cellValue['t'] === 'n') {
                                if (('z' in cellValue) && cellValue['z'] && (cellValue['z'].endsWith('yy'))) {
                                    // ad hoc date matching.
                                    // skip dates.
                                }
                                else {
                                    cellValueStr = JSON.stringify(cellValue['v']);
                                }
                            }
                            break;
                        case ExcelJSON.selections.STYLES:
                            if (cellValue['s']) {
                                // Encode the style as a hash (and just keep the first 10 characters).
                                var styleString = JSON.stringify(cellValue['s']);
                                var str = base64.stringify(sha224(styleString));
                                cellValueStr = str.slice(0, 10);
                            }
                            break;
                    }
                }
                row.push(cellValueStr);
            }
            rows.push(row);
        }
        return rows;
    };
    ExcelJSON.processWorkbook = function (base, filename) {
        var f = xlsx.readFile(base + filename, { "cellStyles": true });
        //console.log(JSON.stringify(f, null, 4));
        var output = {};
        output["workbookName"] = filename;
        output["worksheets"] = [];
        var sheetNames = f.SheetNames;
        var sheets = f.Sheets;
        for (var _i = 0, sheetNames_1 = sheetNames; _i < sheetNames_1.length; _i++) {
            var sheetName = sheetNames_1[_i];
            if (!sheets[sheetName]) {
                // Weird edge case here.
                continue;
            }
            console.warn('  processing ' + filename + '!' + sheetName);
            // Try to parse the ref to see if it's a pair (e.g., A1:B10) or a singleton (e.g., C9).
            // If the latter, make it into a pair (e.g., C9:C9).
            var ref = void 0;
            if ("!ref" in sheets[sheetName]) {
                ref = sheets[sheetName]["!ref"];
            }
            else {
                // Empty sheet.
                ref = "A1:A1";
            }
            var result = ExcelJSON.pair_re.exec(ref); // ExcelJSON.pair_re.exec(ref);
            if (result) {
                // It's a pair; we're fine.
                // ACTUALLY to work around a bug downstream, we start everything at A1.
                // This sucks but it works.
                ref = "A1:" + result[2];
            }
            else {
                // Singleton. Make it a pair.
                ref = ref + ":" + ref;
            }
            var sheetRange = sheetName + "!" + ref;
            output["worksheets"].push({
                "sheetName": sheetName,
                "usedRangeAddress": sheetRange,
                "formulas": ExcelJSON.processWorksheet(sheets[sheetName], ExcelJSON.selections.FORMULAS),
                "values": ExcelJSON.processWorksheet(sheets[sheetName], ExcelJSON.selections.VALUES),
                "styles": ExcelJSON.processWorksheet(sheets[sheetName], ExcelJSON.selections.STYLES)
            });
        }
        return output;
    };
    ExcelJSON.general_re = '\\$?[A-Z][A-Z]?\\$?\\d+'; // column and row number, optionally with $
    ExcelJSON.pair_re = new RegExp('(' + ExcelJSON.general_re + '):(' + ExcelJSON.general_re + ')');
    ExcelJSON.singleton_re = new RegExp(ExcelJSON.general_re);
    return ExcelJSON;
}());
exports.ExcelJSON = ExcelJSON;
;
(function (ExcelJSON) {
    var selections;
    (function (selections) {
        selections[selections["FORMULAS"] = 0] = "FORMULAS";
        selections[selections["VALUES"] = 1] = "VALUES";
        selections[selections["STYLES"] = 2] = "STYLES";
    })(selections = ExcelJSON.selections || (ExcelJSON.selections = {}));
    ;
})(ExcelJSON = exports.ExcelJSON || (exports.ExcelJSON = {}));
exports.ExcelJSON = ExcelJSON;
