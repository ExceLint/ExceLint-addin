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
function test_binsearch() {
    // Random testing that checks if binary search is working properly.
    var iterations = 10000;
    var maxTestArrayLength = 400;
    var failures = 0;
    for (var i = 0; i < iterations; i++) {
        var arr = [];
        var len = Math.floor(Math.random() * maxTestArrayLength);
        for (var j = 0; j < len; j++) {
            arr.push(j);
            while ((j < len) && (Math.random() < 0.5)) {
                arr.push(j);
                j++;
            }
        }
        arr.sort(function (a, b) { return a - b; });
        //	console.log(arr);
        // Search for items in the array.
        for (var j = 0; j < len; j++) {
            var ind = binsearch(arr, arr[j]);
            if ((ind === -1) ||
                (arr[ind] != arr[j]) ||
                (ind > j)) {
                // Check to make sure this is the earliest.
                if (arr[ind - 1] === arr[j]) {
                    failures++;
                    console.log("Failure: " + JSON.stringify(arr) + ", ind = " + ind + ", j = " + j);
                }
            }
        }
        // Search for items NOT in the array (with exceedingly high probability).
        for (var j = 0; j < len; j++) {
            var val = Math.random();
            var ind = binsearch(arr, val);
            if (ind !== -1) {
                failures++;
                console.log("Found an item which should almost certainly not be there: " + val);
                console.log(JSON.stringify(arr));
            }
        }
    }
    var passPercentage = 100.0 * ((2 * iterations - failures) / (2 * iterations));
    console.log("Passed = " + passPercentage + " percent.");
    return passPercentage;
}
exports.test_binsearch = test_binsearch;
