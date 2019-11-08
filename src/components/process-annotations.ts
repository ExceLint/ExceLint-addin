'use strict';
const fs = require('fs');
import { ExcelUtils } from './excelutils';

const fname = 'annotations.json';
const content = fs.readFileSync(fname);
let inp = JSON.parse(content);
let out = {}

const formulaErrors = { "ref" : true,
			"refi" : true,
			"calc" : true };

for (let i = 0; i < inp.length; i++) {
    const workbookName = inp[i]["Workbook"];
    if (!(workbookName in out)) {
	out[workbookName] = {};
    }
    const sheetName = inp[i]["Worksheet"];
    if (!(sheetName in out[workbookName])) {
	out[workbookName][sheetName] = {
	    "bugs" : []
	};
    }
    if (inp[i]["BugKind"] in formulaErrors) {
	// Add it, converting to (row, col, ...) format.
	const addr = inp[i]["Address"];
	const cell_dep = ExcelUtils.cell_dependency(addr, 0, 0);
	out[workbookName][sheetName]["bugs"].push(cell_dep);
	out[workbookName][sheetName]["bugs"].sort();
    }
}

console.log(JSON.stringify(out, null, 2));
