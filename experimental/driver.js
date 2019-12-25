"use strict";
exports.__esModule = true;
var infogain_1 = require("./infogain");
/*
console.log(InfoGain.normalized_entropy([25]));
console.log(InfoGain.normalized_entropy([25, 1]));
console.log(InfoGain.normalized_entropy([25, 1, 1, 1]));
console.log(InfoGain.salience([25, 1], 0));
console.log(InfoGain.salience([25, 1], 1));
*/
var input = [[1, 1, 1], [1, 2, 1], [1, 1, 1]];
input = [[5, 5, 5, 5, 5], [5, 5, 5, 100, 5], [5, 5, 5, 5, 5], [5, 5, 5, 5, 5], [5, 5, 5, 5, 5]];
var st = infogain_1.Stencil.stencil_computation(input, function (x, y) { return x ^ y; }, 1);
console.log('st = ' + JSON.stringify(st));
// Convert to histogram of counts.
var hist = infogain_1.InfoGain.to_histogram(st);
var keys = Array.from(hist.keys());
console.log(keys);
var values = Array.from(hist.values());
console.log(values);
for (var i = 0; i < keys.length; i++) {
    console.log('item = ' + JSON.stringify(keys[i]));
    console.log(infogain_1.InfoGain.salience(values, i));
}
