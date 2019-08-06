"use strict";
exports.__esModule = true;
function binsearch_helper(arr, start, end, v, comparator) {
    //    console.log("binsearch_helper: " + start + ", " + end + ", comparing against " + v);
    if (start >= end) {
        return -1; // not found
    }
    var midpoint = Math.floor((start + end) / 2);
    //    console.log("midpoint = " + midpoint);
    // Find the earliest matching index.
    var comparison = comparator(arr[midpoint], v);
    //    if ((arr[midpoint] === v) && ((midpoint === 0) || (arr[midpoint-1] != v))) {
    if (comparison === 0) {
        //	console.log("A");
        // Found it. Is it the earliest one?
        if ((midpoint === 0) || (comparator(arr[midpoint - 1], v) != 0)) {
            return midpoint;
        }
    }
    if (comparison < 0) {
        //	console.log("B");
        return binsearch_helper(arr, midpoint + 1, end, v, comparator);
    }
    else {
        //	console.log("C");
        return binsearch_helper(arr, start, midpoint - 1, v, comparator);
    }
}
// Find the index of the earliest occurrence of v in arr using binary search.
// Return -1 if not found.
function binsearch(arr, v, comparator) {
    if (comparator === void 0) { comparator = undefined; }
    if (typeof comparator === "undefined") {
        //	console.log("undefined");
        comparator = (function (a, b) {
            console.log("Comparing " + JSON.stringify(a) + " to " + JSON.stringify(b));
            if (a === b) {
                return 0;
            }
            if (a < b) {
                return -1;
            }
            return 1;
        });
    }
    return binsearch_helper(arr, 0, arr.length, v, comparator);
}
exports.binsearch = binsearch;
