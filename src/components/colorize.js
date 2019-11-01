"use strict";
exports.__esModule = true;
var excelutils_1 = require("./excelutils");
var rectangleutils_1 = require("./rectangleutils");
var timer_1 = require("./timer");
var jsonclone_1 = require("./jsonclone");
var groupme_1 = require("./groupme");
var Colorize = /** @class */ (function () {
    function Colorize() {
    }
    Colorize.setReportingThreshold = function (value) {
        Colorize.reportingThreshold = value;
    };
    Colorize.getReportingThreshold = function () {
        return Colorize.reportingThreshold;
    };
    Colorize.setFormattingDiscount = function (value) {
        Colorize.formattingDiscount = value;
    };
    Colorize.getFormattingDiscount = function () {
        return Colorize.formattingDiscount;
    };
    Colorize.initialize = function () {
        if (!this.initialized) {
            // Create the color palette array.
            var arr = Colorize.palette;
            for (var i = 0; i < arr.length; i++) {
                this.color_list.push(arr[i]);
            }
            this.initialized = true;
        }
    };
    // Get the color corresponding to a hash value.
    Colorize.get_color = function (hashval) {
        var color = this.color_list[(hashval * 1) % this.color_list.length];
        return color;
    };
    // Generate dependence vectors and their hash for all formulas.
    Colorize.process_formulas = function (formulas, origin_col, origin_row) {
        var base_vector = JSON.stringify(excelutils_1.ExcelUtils.baseVector());
        var reducer = function (acc, curr) { return [acc[0] + curr[0], acc[1] + curr[1], acc[2] + curr[2]]; };
        var output = [];
        // Compute the vectors for all of the formulas.
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j].toString();
                // If it's a formula, process it.
                if ((cell.length > 0)) { // FIXME MAYBE  && (row[j][0] === '=')) {
                    var vec_array = excelutils_1.ExcelUtils.all_dependencies(i, j, origin_row + i, origin_col + j, formulas);
                    var adjustedX = j + origin_col + 1;
                    var adjustedY = i + origin_row + 1;
                    if (vec_array.length == 0) {
                        if (cell[0] === '=') {
                            // It's a formula but it has no dependencies (i.e., it just has constants). Use a distinguished value.
                            output.push([[adjustedX, adjustedY, 0], Colorize.distinguishedZeroHash]);
                        }
                    }
                    else {
                        var vec = vec_array.reduce(reducer);
                        if (JSON.stringify(vec) === base_vector) {
                            // No dependencies! Use a distinguished value.
                            // FIXME RESTORE THIS output.push([[adjustedX, adjustedY, 0], Colorize.distinguishedZeroHash]);
                            output.push([[adjustedX, adjustedY, 0], vec.toString()]);
                        }
                        else {
                            var hash = this.hash_vector(vec);
                            var str = hash.toString();
                            console.log("hash for " + adjustedX + ", " + adjustedY + " = " + str);
                            output.push([[adjustedX, adjustedY, 0], str]);
                        }
                    }
                }
            }
        }
        return output;
    };
    // Returns all referenced data so it can be colored later.
    Colorize.color_all_data = function (refs) {
        var t = new timer_1.Timer("color_all_data");
        var referenced_data = [];
        for (var _i = 0, _a = Object.keys(refs); _i < _a.length; _i++) {
            var refvec = _a[_i];
            var rv = refvec.split(',');
            var row = Number(rv[0]);
            var col = Number(rv[1]);
            referenced_data.push([[row, col, 0], Colorize.distinguishedZeroHash]); // See comment at top of function declaration.
        }
        t.split("processed all data");
        return referenced_data;
    };
    // Take all values and return an array of each row and column.
    // Note that for now, the last value of each tuple is set to 1.
    Colorize.process_values = function (values, formulas, origin_col, origin_row) {
        var value_array = [];
        var t = new timer_1.Timer("process_values");
        for (var i = 0; i < values.length; i++) {
            var row = values[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j].toString();
                // If the value is not from a formula, include it.
                if ((cell.length > 0) && ((formulas[i][j][0] != "="))) {
                    var cellAsNumber = Number(cell).toString();
                    if (cellAsNumber === cell) {
                        // It's a number. Add it.
                        var adjustedX = j + origin_col + 1;
                        var adjustedY = i + origin_row + 1;
                        value_array.push([[adjustedX, adjustedY, 1], Colorize.distinguishedZeroHash]); // See comment at top of function declaration.
                    }
                }
            }
        }
        t.split("processed all values");
        return value_array;
    };
    // Take in a list of [[row, col], color] pairs and group them,
    // sorting them (e.g., by columns).
    Colorize.identify_ranges = function (list, sortfn) {
        // Separate into groups based on their string value.
        var groups = {};
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var r = list_1[_i];
            groups[r[1]] = groups[r[1]] || [];
            groups[r[1]].push(r[0]);
        }
        // Now sort them all.
        for (var _a = 0, _b = Object.keys(groups); _a < _b.length; _a++) {
            var k = _b[_a];
            groups[k].sort(sortfn);
        }
        return groups;
    };
    // Group all ranges by their value.
    Colorize.group_ranges = function (groups, columnFirst) {
        var output = {};
        var index0 = 0; // column
        var index1 = 1; // row
        if (!columnFirst) {
            index0 = 1; // row
            index1 = 0; // column
        }
        for (var _i = 0, _a = Object.keys(groups); _i < _a.length; _i++) {
            var k = _a[_i];
            output[k] = [];
            var prev = groups[k].shift();
            var last = prev;
            for (var _b = 0, _c = groups[k]; _b < _c.length; _b++) {
                var v = _c[_b];
                // Check if in the same column, adjacent row (if columnFirst; otherwise, vice versa).
                if ((v[index0] === last[index0]) && (v[index1] === last[index1] + 1)) {
                    last = v;
                }
                else {
                    output[k].push([prev, last]);
                    prev = v;
                    last = v;
                }
            }
            output[k].push([prev, last]);
        }
        return output;
    };
    Colorize.identify_groups = function (theList) {
        var columnsort = function (a, b) { if (a[0] === b[0]) {
            return a[1] - b[1];
        }
        else {
            return a[0] - b[0];
        } };
        var id = this.identify_ranges(theList, columnsort);
        var gr = this.group_ranges(id, true); // column-first
        // Now try to merge stuff with the same hash.
        var newGr1 = jsonclone_1.JSONclone.clone(gr);
        var mg = this.merge_groups(newGr1);
        return mg;
    };
    Colorize.processed_to_matrix = function (cols, rows, origin_col, origin_row, processed) {
        // Invert the hash table.
        // First, initialize a zero-filled matrix.
        var matrix = new Array(cols);
        for (var i = 0; i < cols; i++) {
            matrix[i] = new Array(rows).fill(0);
        }
        // Now iterate through the processed formulas and update the matrix.
        for (var _i = 0, processed_1 = processed; _i < processed_1.length; _i++) {
            var item = processed_1[_i];
            var _a = item[0], col = _a[0], row = _a[1], isConstant = _a[2], val = item[1];
            // Yes, I know this is confusing. Will fix later.
            //	    console.log("C) cols = " + rows + ", rows = " + cols + "; row = " + row + ", col = " + col);
            var adjustedX = row - origin_row - 1;
            var adjustedY = col - origin_col - 1;
            var value = Number(Colorize.distinguishedZeroHash);
            if (isConstant === 1) {
                // That means it was a constant.
                // Set to a fixed value (as above).
            }
            else {
                value = Number(val);
            }
            matrix[adjustedX][adjustedY] = value;
        }
        return matrix;
    };
    Colorize.stencilize = function (cols, rows, matrix) {
        console.log("cols = " + cols + ", rows = " + rows);
        //	    console.log("matrix = " + JSON.stringify(matrix));
        var stencil = new Array(cols);
        for (var i = 0; i < cols; i++) {
            stencil[i] = new Array(rows).fill(0);
        }
        // Middle (common-case)
        var winMM = function (i, j) {
            console.log("MM: " + i + ", " + j);
            return [matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i + 1][j - 1],
                matrix[i - 1][j], matrix[i][j], matrix[i + 1][j],
                matrix[i - 1][j + 1], matrix[i][j + 1], matrix[i + 1][j + 1]];
        };
        /// Literal corner cases.
        var winTL = function (i, j) {
            console.log("TL");
            return [matrix[i + 1][j + 1], matrix[i][j + 1], matrix[i + 1][j + 1],
                matrix[i + 1][j], matrix[i][j], matrix[i + 1][j],
                matrix[i + 1][j + 1], matrix[i][j + 1], matrix[i + 1][j + 1]];
        };
        var winBL = function (i, j) {
            console.log("BL");
            return [matrix[i + 1][j - 1], matrix[i][j - 1], matrix[i + 1][j - 1],
                matrix[i + 1][j], matrix[i][j], matrix[i + 1][j],
                matrix[i + 1][j - 1], matrix[i][j - 1], matrix[i + 1][j - 1]];
        };
        var winTR = function (i, j) {
            console.log("TR");
            return [matrix[i - 1][j + 1], matrix[i][j + 1], matrix[i - 1][j + 1],
                matrix[i - 1][j], matrix[i][j], matrix[i - 1][j],
                matrix[i - 1][j + 1], matrix[i][j + 1], matrix[i - 1][j + 1]];
        };
        var winBR = function (i, j) {
            console.log("BR");
            return [matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j - 1],
                matrix[i - 1][j], matrix[i][j], matrix[i - 1][j],
                matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j - 1]];
        };
        /// Literal edge cases
        var winT = function (i, j) {
            console.log("T");
            return [matrix[i + 1][j + 1], matrix[i][j + 1], matrix[i + 1][j + 1],
                matrix[i + 1][j], matrix[i][j], matrix[i + 1][j],
                matrix[i + 1][j + 1], matrix[i][j + 1], matrix[i + 1][j + 1]];
        };
        var winR = function (i, j) {
            console.log("R: " + i + ", " + j);
            return [matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j - 1],
                matrix[i - 1][j], matrix[i][j], matrix[i - 1][j],
                matrix[i - 1][j + 1], matrix[i][j + 1], matrix[i - 1][j + 1]];
        };
        var winL = function (i, j) {
            console.log("L");
            return [matrix[i + 1][j - 1], matrix[i][j - 1], matrix[i + 1][j - 1],
                matrix[i + 1][j], matrix[i][j], matrix[i + 1][j],
                matrix[i + 1][j + 1], matrix[i][j + 1], matrix[i + 1][j + 1]];
        };
        var winB = function (i, j) {
            console.log("B");
            return [matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j - 1],
                matrix[i - 1][j], matrix[i][j], matrix[i - 1][j],
                matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j - 1]];
        };
        var stencilFunction = function (win, i, j) {
            var theWin = win(j, i); // NOTE reversal!
            if (theWin.reduce(function (total, a) { return (a === null) || (Boolean(total)); }, false)) {
                // There's a null.
                console.log("busted: " + JSON.stringify(win(i, j)));
            }
            var sum = theWin.reduce(function (total, a) { return total + a; }, 0);
            var nonzeros = theWin.reduce(function (total, a) { if (Number(a) > 0) {
                return total + 1;
            }
            else {
                return total;
            } }, 0);
            if (nonzeros > 0) {
                var mean = sum / nonzeros;
                //			const variance = win.reduce((total, a) => total + (a - mean) * (a - mean));
                //			let counts = {};
                //			win.forEach(el => counts[el] = 1  + (counts[el] || 0));
                //			delete counts[0];
                // stencil[i][j] = Object.keys(counts).length; // variance; //  mean;
                stencil[i][j] = mean;
            }
            // Avoid math issues by rounding so we only use the first two significant digits past the decimal point.
            stencil[i][j] = Math.round(stencil[i][j] * 100) / 100;
        };
        var win;
        var win_counts = {};
        //	    for (let i = 0; i < cols; i++) {
        //		for (let j = 0; j < rows; j++) {
        for (var i = 1; i < cols - 1; i++) {
            for (var j = 1; j < rows - 1; j++) {
                win = null;
                switch (i) {
                    case 0:
                        switch (j) {
                            case 0:
                                win = winTL;
                                win_counts["TL"] = 1 + (win_counts["TL"] || 0);
                                break;
                            case rows - 1:
                                win = winTR;
                                win_counts["TR"] = 1 + (win_counts["TR"] || 0);
                                break;
                            default:
                                win = winT;
                                win_counts["T"] = 1 + (win_counts["T"] || 0);
                                break;
                        }
                        break;
                    case cols - 1:
                        switch (j) {
                            case 0:
                                win = winBL;
                                win_counts["BL"] = 1 + (win_counts["BL"] || 0);
                                break;
                            case rows - 1:
                                win = winBR;
                                win_counts["BR"] = 1 + (win_counts["BR"] || 0);
                                break;
                            default:
                                win = winB;
                                win_counts["B"] = 1 + (win_counts["B"] || 0);
                                break;
                        }
                        break;
                    default:
                        switch (j) {
                            case 0:
                                win = winL;
                                win_counts["L"] = 1 + (win_counts["L"] || 0);
                                break;
                            case rows - 1:
                                win = winR;
                                win_counts["R"] = 1 + (win_counts["R"] || 0);
                                break;
                            default:
                                win = winMM;
                                win_counts["MM"] = 1 + (win_counts["MM"] || 0);
                                break;
                        }
                }
                stencilFunction(win, i, j);
                //		    if (win === winR) {
                //			console.log(JSON.stringify(win(i,j)));
                //			console.log("stencil[" + i + "][" + j + "] = " + stencil[i][j]);
                //		    }
            }
        }
        console.log(JSON.stringify(win_counts));
        //	    console.log("Stencil = " + JSON.stringify(stencil));
        return stencil;
    };
    Colorize.compute_stencil_probabilities = function (cols, rows, stencil) {
        var probs = new Array(cols);
        for (var i = 0; i < cols; i++) {
            probs[i] = new Array(rows).fill(0);
        }
        // Generate the counts.
        var totalNonzeroes = 0;
        var counts = {};
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                counts[stencil[i][j]] = (counts[stencil[i][j]] + 1) || 1;
                if (stencil[i][j] != 0) {
                    totalNonzeroes += 1;
                }
            }
        }
        console.log("counts = " + JSON.stringify(counts));
        //	    console.log("**********************total non-zeroes = " + totalNonzeroes);
        // Now iterate over the counts to compute probabilities.
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                probs[i][j] = counts[stencil[i][j]] / totalNonzeroes;
            }
        }
        //	    console.log("probs = " + JSON.stringify(probs));
        var totalEntropy = 0;
        var total = 0;
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                if (stencil[i][j] > 0) {
                    total += counts[stencil[i][j]];
                }
            }
        }
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                if (counts[stencil[i][j]] > 0) {
                    totalEntropy += this.entropy(counts[stencil[i][j]] / total);
                }
            }
        }
        var normalizedEntropy = totalEntropy / Math.log2(totalNonzeroes);
        // Now discount the probabilities by weighing them by the normalized total entropy.
        if (false) {
            for (var i = 0; i < cols; i++) {
                for (var j = 0; j < rows; j++) {
                    probs[i][j] *= normalizedEntropy;
                    //			totalEntropy += this.entropy(probs[i][j]);
                }
            }
        }
        //	    console.log("new probs = " + JSON.stringify(probs));
        console.log("total probability = " + total);
        console.log("total entropy = " + totalEntropy);
        console.log("normalized entropy = " + normalizedEntropy);
        return probs;
    };
    Colorize.generate_suspicious_cells = function (cols, rows, origin_col, origin_row, matrix, probs, threshold) {
        if (threshold === void 0) { threshold = 0.01; }
        console.log("threshold = " + threshold);
        var cells = [];
        var sumValues = 0;
        var countValues = 0;
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                var adjustedX = j + origin_col + 1;
                var adjustedY = i + origin_row + 1;
                //		    console.log("examining " + i + " " + j + " = " + matrix[i][j] + " (" + adjustedX + ", " + adjustedY + ")");
                if (probs[i][j] > 0) {
                    sumValues += matrix[i][j];
                    countValues += 1;
                    if (probs[i][j] <= threshold) {
                        console.log("found one at " + i + " " + j + " = [" + matrix[i][j] + "] (" + adjustedX + ", " + adjustedY + "): p = " + probs[i][j]);
                        if (matrix[i][j] != 0) {
                            console.log("PUSHED!");
                            // Never push an empty cell.
                            cells.push([adjustedX, adjustedY, probs[i][j]]);
                        }
                    }
                }
            }
        }
        var avgValues = sumValues / countValues;
        console.log("avg values = " + avgValues);
        cells.sort(function (a, b) { return Math.abs(b[2] - avgValues) - Math.abs(a[2] - avgValues); });
        //	    console.log("cells = " + JSON.stringify(cells));
        return cells;
    };
    Colorize.process_suspicious = function (usedRangeAddress, formulas, values) {
        console.log("process_suspicious:");
        console.log(JSON.stringify(usedRangeAddress));
        console.log(JSON.stringify(formulas));
        console.log(JSON.stringify(values));
        var t = new timer_1.Timer("process_suspicious");
        var _a = excelutils_1.ExcelUtils.extract_sheet_cell(usedRangeAddress), sheetName = _a[0], startCell = _a[1];
        var origin = excelutils_1.ExcelUtils.cell_dependency(startCell, 0, 0);
        t.split("computed cell dependency for start");
        var processed_formulas = [];
        if (formulas.length > this.formulasThreshold) {
            console.log("Too many formulas to perform formula analysis.");
        }
        else {
            t.split("about to process formulas");
            processed_formulas = Colorize.process_formulas(formulas, origin[0] - 1, origin[1] - 1);
            t.split("processed formulas");
        }
        var useTimeouts = false;
        var referenced_data = [];
        var data_values = [];
        var cols = values.length;
        var rows = values[0].length;
        if (values.length > this.valuesThreshold) {
            console.log("Too many values to perform reference analysis.");
        }
        else {
            // Compute references (to color referenced data).
            var refs = excelutils_1.ExcelUtils.generate_all_references(formulas, origin[0] - 1, origin[1] - 1);
            t.split("generated all references");
            //		    console.log("refs = " + JSON.stringify(refs));
            referenced_data = Colorize.color_all_data(refs);
            // console.log("referenced_data = " + JSON.stringify(referenced_data));
            data_values = Colorize.process_values(values, formulas, origin[0] - 1, origin[1] - 1);
            t.split("processed data");
        }
        var grouped_data = Colorize.identify_groups(referenced_data);
        t.split("identified groups");
        var grouped_formulas = Colorize.identify_groups(processed_formulas);
        t.split("grouped formulas");
        // Identify suspicious cells.
        var suspicious_cells = [];
        if (values.length < 10000) {
            suspicious_cells = Colorize.find_suspicious_cells(cols, rows, origin, formulas, processed_formulas, data_values, 1 - Colorize.getReportingThreshold() / 100); // Must be more rare than this fraction.
        }
        var proposed_fixes = Colorize.generate_proposed_fixes(grouped_formulas);
        console.log("results:");
        console.log(JSON.stringify(suspicious_cells));
        console.log(JSON.stringify(grouped_formulas));
        console.log(JSON.stringify(grouped_data));
        console.log(JSON.stringify(proposed_fixes));
        return [suspicious_cells, grouped_formulas, grouped_data, proposed_fixes];
        ////// to here, should be clear without timeouts.
    };
    // Shannon entropy.
    Colorize.entropy = function (p) {
        return -p * Math.log2(p);
    };
    // Take two counts and compute the normalized entropy difference that would result if these were "merged".
    Colorize.entropydiff = function (oldcount1, oldcount2) {
        var total = oldcount1 + oldcount2;
        var prevEntropy = this.entropy(oldcount1 / total) + this.entropy(oldcount2 / total);
        var normalizedEntropy = prevEntropy / (Math.log2(total));
        return -normalizedEntropy;
    };
    // Compute the normalized distance from merging two ranges.
    Colorize.fix_metric = function (target_norm, target, merge_with_norm, merge_with) {
        //	console.log("fix_metric: " + target_norm + ", " + JSON.stringify(target) + ", " + merge_with_norm + ", " + JSON.stringify(merge_with));
        var t1 = target[0], t2 = target[1];
        var m1 = merge_with[0], m2 = merge_with[1];
        var n_target = rectangleutils_1.RectangleUtils.area([[t1[0], t1[1], 0], [t2[0], t2[1], 0]]);
        var n_merge_with = rectangleutils_1.RectangleUtils.area([[m1[0], m1[1], 0], [m2[0], m2[1], 0]]);
        var n_min = Math.min(n_target, n_merge_with);
        var n_max = Math.max(n_target, n_merge_with);
        var norm_min = Math.min(merge_with_norm, target_norm);
        var norm_max = Math.max(merge_with_norm, target_norm);
        var fix_distance = Math.abs(norm_max - norm_min) / this.Multiplier;
        // Ensure that the minimum fix is at least one (we need this if we don't use the L1 norm).
        if (fix_distance < 1.0) {
            fix_distance = 1.0;
        }
        var entropy_drop = this.entropydiff(n_min, n_max); // negative
        var ranking = (1.0 + entropy_drop) / (fix_distance * n_min); // ENTROPY WEIGHTED BY FIX DISTANCE
        ranking = -ranking; // negating to sort in reverse order.
        return ranking;
    };
    // Iterate through the size of proposed fixes.
    Colorize.count_proposed_fixes = function (fixes) {
        var count = 0;
        for (var k in fixes) {
            //	    console.log("FIX FIX FIX fixes[k] = " + JSON.stringify(fixes[k][1]));
            var _a = fixes[k][1], f11 = _a[0], f12 = _a[1];
            var _b = fixes[k][2], f21 = _b[0], f22 = _b[1];
            count += rectangleutils_1.RectangleUtils.diagonal([[f11[0], f11[1], 0], [f12[0], f12[1], 0]]);
            count += rectangleutils_1.RectangleUtils.diagonal([[f21[0], f21[1], 0], [f22[0], f22[1], 0]]);
        }
        return count;
    };
    // Try to merge fixes into larger groups.
    Colorize.fix_proposed_fixes = function (fixes) {
        // example: [[-0.8729568798082977,[[4,23],[13,23]],[[3,23,0],[3,23,0]]],[-0.6890824929174288,[[4,6],[7,6]],[[3,6,0],[3,6,0]]],[-0.5943609377704335,[[4,10],[6,10]],[[3,10,0],[3,10,0]]],[-0.42061983571430495,[[3,27],[4,27]],[[5,27,0],[5,27,0]]],[-0.42061983571430495,[[4,14],[5,14]],[[3,14,0],[3,14,0]]],[-0.42061983571430495,[[6,27],[7,27]],[[5,27,0],[5,27,0]]]]
        var count = 0;
        // Search for fixes where the same coordinate pair appears in the front and in the back.
        var front = {};
        var back = {};
        // Build up the front and back dictionaries.
        for (var k in fixes) {
            // Sort the fixes so the smaller array (further up and
            // to the left) always comes first.
            if (fixes[k][1] > fixes[k][2]) {
                var tmp = fixes[k][1];
                fixes[k][1] = fixes[k][2];
                fixes[k][2] = tmp;
            }
            // Now add them.
            front[JSON.stringify(fixes[k][1])] = fixes[k];
            back[JSON.stringify(fixes[k][2])] = fixes[k];
        }
        // Now iterate through one, looking for hits on the other.
        var new_fixes = [];
        var merged = {};
        for (var k in fixes) {
            var original_score = fixes[k][0];
            if (-original_score < (Colorize.reportingThreshold / 100)) {
                continue;
            }
            var this_front_str = JSON.stringify(fixes[k][1]);
            var this_back_str = JSON.stringify(fixes[k][2]);
            if (!(this_front_str in back) && !(this_back_str in front)) {
                // No match. Just merge them.
                new_fixes.push(fixes[k]);
            }
            else {
                //		    console.log("**** original score = " + original_score);
                if ((!merged[this_front_str]) && (this_front_str in back)) {
                    //			console.log("**** (1) merging " + this_front_str + " with " + JSON.stringify(back[this_front_str]));
                    // FIXME. This calculation may not make sense.			
                    var newscore = -original_score * JSON.parse(back[this_front_str][0]);
                    //			console.log("pushing " + JSON.stringify(fixes[k][1]) + " with " + JSON.stringify(back[this_front_str][1]));
                    var new_fix = [newscore, fixes[k][1], back[this_front_str][1]];
                    //			console.log("pushing " + JSON.stringify(new_fix));
                    new_fixes.push(new_fix);
                    merged[this_front_str] = true;
                    // FIXME? testing below. The idea is to not keep merging things (for now).
                    merged[this_back_str] = true;
                    continue;
                }
                if ((!merged[this_back_str]) && (this_back_str in front)) {
                    // this_back_str in front
                    //			console.log("**** (2) merging " + this_back_str + " with " + JSON.stringify(front[this_back_str]));
                    // FIXME. This calculation may not make sense.
                    var newscore = -original_score * JSON.parse(front[this_back_str][0]);
                    //			console.log("pushing " + JSON.stringify(fixes[k][1]) + " with " + JSON.stringify(front[this_back_str][1]));
                    var new_fix = [newscore, fixes[k][1], front[this_back_str][2]];
                    //			console.log("pushing " + JSON.stringify(new_fix));
                    new_fixes.push(new_fix);
                    merged[this_back_str] = true;
                    // FIXME? testing below.
                    merged[this_front_str] = true;
                }
            }
        }
        return new_fixes;
    };
    Colorize.generate_proposed_fixes = function (groups) {
        var t = new timer_1.Timer("generate_proposed_fixes");
        t.split("about to find.");
        var proposed_fixes_new = groupme_1.find_all_proposed_fixes(groups);
        t.split("sorting fixes.");
        proposed_fixes_new.sort(function (a, b) { return a[0] - b[0]; });
        t.split("done.");
        //	console.log(JSON.stringify(proposed_fixes_new));
        return proposed_fixes_new;
    };
    Colorize.merge_groups = function (groups) {
        for (var _i = 0, _a = Object.keys(groups); _i < _a.length; _i++) {
            var k = _a[_i];
            var g = groups[k].slice();
            groups[k] = this.merge_individual_groups(g); // JSON.parse(JSON.stringify(groups[k])));
        }
        return groups;
    };
    Colorize.merge_individual_groups = function (group) {
        var t = new timer_1.Timer("merge_individual_groups");
        var numIterations = 0;
        group = group.sort();
        //        console.log(JSON.stringify(group));
        while (true) {
            // console.log("iteration "+numIterations);
            var merged_one = false;
            var deleted_rectangles = {};
            var updated_rectangles = [];
            var working_group = group.slice(); // JSON.parse(JSON.stringify(group));
            while (working_group.length > 0) {
                var head = working_group.shift();
                for (var i = 0; i < working_group.length; i++) {
                    //                    console.log("comparing " + head + " and " + working_group[i]);
                    if (rectangleutils_1.RectangleUtils.is_mergeable(head, working_group[i])) {
                        //console.log("friendly!" + head + " -- " + working_group[i]);
                        updated_rectangles.push(rectangleutils_1.RectangleUtils.bounding_box(head, working_group[i]));
                        deleted_rectangles[JSON.stringify(head)] = true;
                        deleted_rectangles[JSON.stringify(working_group[i])] = true;
                        merged_one = true;
                        break;
                    }
                }
                //                if (!merged_one) {
                //                    updated_rectangles.push(head);
                //                }
            }
            for (var i = 0; i < group.length; i++) {
                if (!(JSON.stringify(group[i]) in deleted_rectangles)) {
                    updated_rectangles.push(group[i]);
                }
            }
            updated_rectangles.sort();
            // console.log('updated rectangles = ' + JSON.stringify(updated_rectangles));
            //            console.log('group = ' + JSON.stringify(group));
            if (!merged_one) {
                // console.log('updated rectangles = ' + JSON.stringify(updated_rectangles));
                //		    t.split("done, " + numIterations + " iterations.");
                return updated_rectangles;
            }
            group = updated_rectangles.slice(); // JSON.parse(JSON.stringify(updated_rectangles));
            numIterations++;
            if (numIterations > 2000) { // This is hack to guarantee convergence.
                console.log("Too many iterations; abandoning this group.");
                t.split("done, " + numIterations + " iterations.");
                return [[[-1, -1, 0], [-1, -1, 0]]];
            }
        }
    };
    Colorize.hash_vector = function (vec) {
        var useL1norm = true; // false;
        if (useL1norm) {
            var baseX = 0; // 7;
            var baseY = 0; // 3;
            var v0 = Math.abs(vec[0] - baseX);
            //	v0 = v0 * v0;
            var v1 = Math.abs(vec[1] - baseY);
            //	v1 = v1 * v1;
            var v2 = vec[2];
            return this.Multiplier * (v0 + v1 + v2);
        }
        else {
            var baseX = -7; // was 7
            var baseY = -3; // was 3
            var v0 = vec[0] - baseX;
            v0 = v0 * v0;
            var v1 = vec[1] - baseY;
            v1 = v1 * v1;
            var v2 = vec[2];
            return this.Multiplier * Math.sqrt(v0 + v1 + v2);
        }
        //	return this.Multiplier * (Math.sqrt(v0 + v1) + v2);
    };
    Colorize.adjust_proposed_fixes = function (fixes, propertiesToGet, origin_col, origin_row) {
        var proposed_fixes = [];
        for (var k in fixes) {
            // Format of proposed fixes =, e.g., [-3.016844756293869, [[5,7],[5,11]],[[6,7],[6,11]]]
            // entropy, and two ranges:
            //    upper-left corner of range (column, row), lower-right corner of range (column, row)
            //	    console.log("fix = " + JSON.stringify(fixes[k]));
            var score = fixes[k][0];
            // EDB: DISABLE PRUNING HERE
            // Skip fixes whose score is already below the threshold.
            //	    if (-score < (Colorize.getReportingThreshold() / 100)) {
            //		console.log("too low: " + (-score));
            //		continue;
            //	    }
            // Sort the fixes.
            // This is a pain because if we don't pad appropriately, [1,9] is "less than" [1,10]. (Seriously.)
            // So we make sure that numbers are always left padded with zeroes to make the number 10 digits long
            // (which is 1 more than Excel needs right now).
            var firstPadded = fixes[k][1].map(function (a) { return a.toString().padStart(10, '0'); });
            var secondPadded = fixes[k][2].map(function (a) { return a.toString().padStart(10, '0'); });
            var first = (firstPadded < secondPadded) ? fixes[k][1] : fixes[k][2];
            var second = (firstPadded < secondPadded) ? fixes[k][2] : fixes[k][1];
            var _a = first[0], ax1 = _a[0], ay1 = _a[1], _b = first[1], ax2 = _b[0], ay2 = _b[1];
            var _c = second[0], bx1 = _c[0], by1 = _c[1], _d = second[1], bx2 = _d[0], by2 = _d[1];
            var col0 = ax1 - origin_col - 1; // ExcelUtils.column_index_to_name(ax1);
            var row0 = ay1 - origin_row - 1; //.toString();
            var col1 = bx2 - origin_col - 1; // ExcelUtils.column_index_to_name(bx2);
            var row1 = by2 - origin_row - 1; // .toString();
            //	    console.log("length = " + propertiesToGet.value.length);
            //	    console.log("width = " + propertiesToGet.value[0].length);
            var sameFormats = true;
            var firstFormat = JSON.stringify(propertiesToGet.value[row0][col0]);
            //	    console.log(firstFormat);
            //	    console.log(JSON.stringify(fixes));
            for (var i = row0; i <= row1; i++) {
                for (var j = col0; j <= col1; j++) {
                    //		    		    console.log("checking " + i + ", " + j);
                    var str = JSON.stringify(propertiesToGet.value[i][j]);
                    //		    console.log(str);
                    if (str !== firstFormat) {
                        sameFormats = false;
                        break;
                    }
                }
            }
            //	    const sameFormats = propertiesToGet.value.every((val,_,arr) => { return val.every((v,_,__) => { return JSON.stringify(v) === JSON.stringify(arr[0][0]); }); })
            //	    console.log("sameFormats? " + sameFormats);
            proposed_fixes.push([score, first, second, sameFormats]);
        }
        return proposed_fixes;
    };
    Colorize.find_suspicious_cells = function (cols, rows, origin, formulas, processed_formulas, data_values, threshold) {
        var suspiciousCells;
        {
            data_values = data_values;
            var formula_matrix = Colorize.processed_to_matrix(cols, rows, origin[0] - 1, origin[1] - 1, 
            //								processed_formulas);
            processed_formulas.concat(data_values));
            //									processed_formulas);
            console.log("formula_matrix = " + JSON.stringify(formula_matrix));
            console.log("processed_formulas = " + JSON.stringify(processed_formulas));
            console.log("data_values = " + JSON.stringify(data_values));
            var stencil = Colorize.stencilize(cols, rows, formula_matrix);
            console.log("stencilized formula_matrix = " + JSON.stringify(stencil));
            var probs = Colorize.compute_stencil_probabilities(cols, rows, stencil);
            console.log("probabilities = " + JSON.stringify(probs));
            var candidateSuspiciousCells = Colorize.generate_suspicious_cells(cols, rows, origin[0] - 1, origin[1] - 1, formula_matrix, probs, threshold);
            console.log("suspicious cells before = " + JSON.stringify(candidateSuspiciousCells));
            // Prune any cell that is in fact a formula.
            if (typeof formulas !== 'undefined') {
                var totalFormulaWeight_1 = 0;
                suspiciousCells = candidateSuspiciousCells.filter(function (c) {
                    var theFormula = formulas[c[1] - origin[1]][c[0] - origin[0]];
                    console.log("Checking theFormula = " + JSON.stringify(theFormula) + " for cell " + JSON.stringify(c));
                    if ((theFormula.length < 1) || (theFormula[0] != '=')) {
                        return true;
                    }
                    else {
                        // It's a formula: we will remove it, but also track how much it contributed to the probability distribution.
                        console.log("REMOVING " + JSON.stringify(c));
                        totalFormulaWeight_1 += c[2];
                        return false;
                    }
                });
                console.log("total formula weight = " + totalFormulaWeight_1);
                // Now we need to correct all the non-formulas to give them weight proportional to the case when the formulas are removed.
                var multiplier_1 = 1 / (1 - totalFormulaWeight_1);
                console.log("before thresholding: suspicious cells = " + JSON.stringify(suspiciousCells));
                suspiciousCells = suspiciousCells.map(function (c) { return [c[0], c[1], c[2] * multiplier_1]; });
                suspiciousCells = suspiciousCells.filter(function (c) { return c[2] <= threshold; });
            }
            else {
                suspiciousCells = candidateSuspiciousCells;
            }
            console.log("suspicious cells after = " + JSON.stringify(suspiciousCells));
        }
        return suspiciousCells;
    };
    Colorize.reportingThreshold = 35; //  percent of bar
    Colorize.suspiciousCellsReportingThreshold = 85; //  percent of bar
    Colorize.formattingDiscount = 50; // percent of discount: 100% means different formats = not suspicious at all
    Colorize.formulasThreshold = 10000;
    Colorize.valuesThreshold = 10000;
    // Color-blind friendly color palette.
    Colorize.palette = ["#ecaaae", "#74aff3", "#d8e9b2", "#deb1e0", "#9ec991", "#adbce9", "#e9c59a", "#71cdeb", "#bfbb8a", "#94d9df", "#91c7a8", "#b4efd3", "#80b6aa", "#9bd1c6"]; // removed "#73dad1", 
    // True iff this class been initialized.
    Colorize.initialized = false;
    // The array of colors (used to hash into).
    Colorize.color_list = [];
    // A multiplier for the hash function.
    Colorize.Multiplier = 1; // 103037;
    // A hash string indicating no dependencies.
    Colorize.distinguishedZeroHash = "12345";
    return Colorize;
}());
exports.Colorize = Colorize;
//console.log(this.dependencies('$C$2:$E$5', 10, 10));
//console.log(this.dependencies('$A$123,A1:B$12,$A12:$B$14', 10, 10));
//console.log(this.hash_vector(this.dependencies('$C$2:$E$5', 10, 10)));
