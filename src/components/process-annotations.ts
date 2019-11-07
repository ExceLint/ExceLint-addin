'use strict';
const fs = require('fs');

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
	// Add it.
	// Convert address to column number, row number.
	// FIXME
	out[workbookName][sheetName]["bugs"].push(inp[i]["Address"]);
	out[workbookName][sheetName]["bugs"].sort();
    }
}

console.log(JSON.stringify(out, null, 2));
