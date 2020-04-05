let fs = require('fs');
let textdiff = require('text-diff');
let diff = new textdiff();

export class FixDiff {
    
    // Load the JSON file containing all the Excel functions.
    private fns = JSON.parse(fs.readFileSync('functions.json', 'utf-8'));
    // console.log(JSON.stringify(fns));

    // Build a map of Excel functions to crazy Unicode characters and back
    // again.  We do this so that diffs are in effect "token by token"
    // (e.g., so ROUND and RAND don't get a diff of "O|A" but are instead
    // considered entirely different).
    private fn2unicode = {};
    private unicode2fn = {};

    // Construct the arrays above.
    private initArrays() {
	let i = 0;
	for (let fnName of this.fns) {
	    const str = String.fromCharCode(256 + i);
	    this.fn2unicode[fnName] = str;
	    this.unicode2fn[str] = fnName;
	    i++;
	    // console.log(fnName + " " + this.fn2unicode[fnName] + " " + this.unicode2fn[this.fn2unicode[fnName]]);
	}
	
	// Sort the functions in reverse order by size (longest first). This
	// order will prevent accidentally tokenizing substrings of functions.
	this.fns.sort((a,b) => { if (a.length < b.length) { return 1; } if (a.length > b.length) { return -1; } else return 0; })
    }
    
    constructor() {
	this.initArrays();
	console.log(this.fns);
    }

    // Return the diffs (with formulas treated specially).
    public diffs(str1, str2) {
	// First, "tokenize" the strings.
	for (let i = 0; i < this.fns.length; i++) {
	    str1 = str1.replace(this.fns[i], this.fn2unicode[this.fns[i]]);
	    str2 = str2.replace(this.fns[i], this.fn2unicode[this.fns[i]]);
	}
	// Build up the diff.
	let theDiff = diff.main(str1, str2);
	console.log(theDiff);
	// Now de-tokenize the diff contents.
	for (let j = 0; j < theDiff.length; j++) {
	    for (let i = 0; i < this.fns.length; i++) {
		theDiff[j][1] = theDiff[j][1].replace(this.fn2unicode[this.fns[i]], this.fns[i]);
	    }
	}
	return theDiff;
    }
};

let nd = new FixDiff();

// Now try a diff.
let str1 = 'ROUND(A1)+12';
let str2 = 'ROUNDUP(A1)+12';

console.log(str1);
console.log(str2);

console.log(nd.diffs(str1, str2));