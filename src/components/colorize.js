"use strict";
exports.__esModule = true;
var excelutils_1 = require("./excelutils");
var rectangleutils_1 = require("./rectangleutils");
var timer_1 = require("./timer");
var jsonclone_1 = require("./jsonclone");
var groupme_1 = require("./groupme");
var infogain_1 = require("./infogain");
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
                    if (vec_array.length === 0) {
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
                            //			    console.log('hash for ' + adjustedX + ', ' + adjustedY + ' = ' + str);
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
        //	let t = new Timer('color_all_data');
        var referenced_data = [];
        for (var _i = 0, _a = Object.keys(refs); _i < _a.length; _i++) {
            var refvec = _a[_i];
            var rv = refvec.split(',');
            var row = Number(rv[0]);
            var col = Number(rv[1]);
            referenced_data.push([[row, col, 0], Colorize.distinguishedZeroHash]); // See comment at top of function declaration.
        }
        //	t.split('processed all data');
        return referenced_data;
    };
    // Take all values and return an array of each row and column.
    // Note that for now, the last value of each tuple is set to 1.
    Colorize.process_values = function (values, formulas, origin_col, origin_row) {
        var value_array = [];
        //	let t = new Timer('process_values');
        for (var i = 0; i < values.length; i++) {
            var row = values[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j].toString();
                // If the value is not from a formula, include it.
                if ((cell.length > 0) && ((formulas[i][j][0] !== '='))) {
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
        //	t.split('processed all values');
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
            //	    console.log('C) cols = ' + rows + ', rows = ' + cols + '; row = ' + row + ', col = ' + col);
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
    Colorize.stencilize = function (matrix) {
        var stencil = infogain_1.Stencil.stencil_computation(matrix, function (x, y) { return x * y; }, 1);
        return stencil;
    };
    Colorize.compute_stencil_probabilities = function (cols, rows, stencil) {
        console.log('compute_stencil_probabilities: stencil = ' + JSON.stringify(stencil));
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
                if (stencil[i][j] !== 0) {
                    totalNonzeroes += 1;
                }
            }
        }
        // Now iterate over the counts to compute probabilities.
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                probs[i][j] = counts[stencil[i][j]] / totalNonzeroes;
            }
        }
        //	    console.log('probs = ' + JSON.stringify(probs));
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
        return probs;
    };
    Colorize.generate_suspicious_cells = function (cols, rows, origin_col, origin_row, matrix, probs, threshold) {
        if (threshold === void 0) { threshold = 0.01; }
        var cells = [];
        var sumValues = 0;
        var countValues = 0;
        for (var i = 0; i < cols; i++) {
            for (var j = 0; j < rows; j++) {
                var adjustedX = j + origin_col + 1;
                var adjustedY = i + origin_row + 1;
                //		    console.log('examining ' + i + ' ' + j + ' = ' + matrix[i][j] + ' (' + adjustedX + ', ' + adjustedY + ')');
                if (probs[i][j] > 0) {
                    sumValues += matrix[i][j];
                    countValues += 1;
                    if (probs[i][j] <= threshold) {
                        // console.log('found one at ' + i + ' ' + j + ' = [' + matrix[i][j] + '] (' + adjustedX + ', ' + adjustedY + '): p = ' + probs[i][j]);
                        if (matrix[i][j] !== 0) {
                            // console.log('PUSHED!');
                            // Never push an empty cell.
                            cells.push([adjustedX, adjustedY, probs[i][j]]);
                        }
                    }
                }
            }
        }
        var avgValues = sumValues / countValues;
        cells.sort(function (a, b) { return Math.abs(b[2] - avgValues) - Math.abs(a[2] - avgValues); });
        console.log('cells = ' + JSON.stringify(cells));
        return cells;
    };
    Colorize.process_suspicious = function (usedRangeAddress, formulas, values) {
        if (false) {
            console.log('process_suspicious:');
            console.log(JSON.stringify(usedRangeAddress));
            console.log(JSON.stringify(formulas));
            console.log(JSON.stringify(values));
        }
        var t = new timer_1.Timer('process_suspicious');
        var _a = excelutils_1.ExcelUtils.extract_sheet_cell(usedRangeAddress), sheetName = _a[0], startCell = _a[1];
        var origin = excelutils_1.ExcelUtils.cell_dependency(startCell, 0, 0);
        var processed_formulas = [];
        if (formulas.length > this.formulasThreshold) {
            console.warn('Too many formulas to perform formula analysis.');
        }
        else {
            //	    t.split('about to process formulas');
            processed_formulas = Colorize.process_formulas(formulas, origin[0] - 1, origin[1] - 1);
            //	    t.split('processed formulas');
        }
        var useTimeouts = false;
        var referenced_data = [];
        var data_values = [];
        var cols = values.length;
        var rows = values[0].length;
        if (values.length > this.valuesThreshold) {
            console.warn('Too many values to perform reference analysis.');
        }
        else {
            // Compute references (to color referenced data).
            var refs = excelutils_1.ExcelUtils.generate_all_references(formulas, origin[0] - 1, origin[1] - 1);
            //	    t.split('generated all references');
            referenced_data = Colorize.color_all_data(refs);
            // console.log('referenced_data = ' + JSON.stringify(referenced_data));
            data_values = Colorize.process_values(values, formulas, origin[0] - 1, origin[1] - 1);
            // t.split('processed data');
        }
        var grouped_data = Colorize.identify_groups(referenced_data);
        //	t.split('identified groups');
        var grouped_formulas = Colorize.identify_groups(processed_formulas);
        //	t.split('grouped formulas');
        // Identify suspicious cells.
        var suspicious_cells = [];
        if (values.length < 10000) {
            // Disabled for now. FIXME
            //            suspicious_cells = Colorize.find_suspicious_cells(cols, rows, origin, formulas, processed_formulas, data_values, 1 - Colorize.getReportingThreshold() / 100); // Must be more rare than this fraction.
            suspicious_cells = Colorize.find_suspicious_cells(cols, rows, origin, formulas, processed_formulas, data_values, 1); // Must be more rare than this fraction.
        }
        var proposed_fixes = Colorize.generate_proposed_fixes(grouped_formulas);
        if (true) {
            console.log('results:');
            console.log(JSON.stringify(suspicious_cells));
            console.log(JSON.stringify(grouped_formulas));
            console.log(JSON.stringify(grouped_data));
            console.log(JSON.stringify(proposed_fixes));
        }
        return [suspicious_cells, grouped_formulas, grouped_data, proposed_fixes];
    };
    // Shannon entropy.
    Colorize.entropy = function (p) {
        return -p * Math.log2(p);
    };
    // Take two counts and compute the normalized entropy difference that would result if these were 'merged'.
    Colorize.entropydiff = function (oldcount1, oldcount2) {
        var total = oldcount1 + oldcount2;
        var prevEntropy = this.entropy(oldcount1 / total) + this.entropy(oldcount2 / total);
        var normalizedEntropy = prevEntropy / (Math.log2(total));
        return -normalizedEntropy;
    };
    // Compute the normalized distance from merging two ranges.
    Colorize.fix_metric = function (target_norm, target, merge_with_norm, merge_with) {
        //	console.log('fix_metric: ' + target_norm + ', ' + JSON.stringify(target) + ', ' + merge_with_norm + ', ' + JSON.stringify(merge_with));
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
        // tslint:disable-next-line: forin
        for (var k in fixes) {
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
        // tslint:disable-next-line: forin
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
        // tslint:disable-next-line: forin
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
                if ((!merged[this_front_str]) && (this_front_str in back)) {
                    // FIXME: does this score make sense? Verify mathematically.
                    var newscore = -original_score * JSON.parse(back[this_front_str][0]);
                    var new_fix = [newscore, fixes[k][1], back[this_front_str][1]];
                    new_fixes.push(new_fix);
                    merged[this_front_str] = true;
                    // FIXME? testing below. The idea is to not keep merging things (for now).
                    merged[this_back_str] = true;
                    continue;
                }
                if ((!merged[this_back_str]) && (this_back_str in front)) {
                    // this_back_str in front
                    //			console.log('**** (2) merging ' + this_back_str + ' with ' + JSON.stringify(front[this_back_str]));
                    // FIXME. This calculation may not make sense.
                    var newscore = -original_score * JSON.parse(front[this_back_str][0]);
                    //			console.log('pushing ' + JSON.stringify(fixes[k][1]) + ' with ' + JSON.stringify(front[this_back_str][1]));
                    var new_fix = [newscore, fixes[k][1], front[this_back_str][2]];
                    //			console.log('pushing ' + JSON.stringify(new_fix));
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
        //	let t = new Timer('generate_proposed_fixes');
        //	t.split('about to find.');
        var proposed_fixes_new = groupme_1.find_all_proposed_fixes(groups);
        //	t.split('sorting fixes.');
        proposed_fixes_new.sort(function (a, b) { return a[0] - b[0]; });
        //	t.split('done.');
        //	console.log(JSON.stringify(proposed_fixes_new));
        return proposed_fixes_new;
    };
    Colorize.merge_groups = function (groups) {
        for (var _i = 0, _a = Object.keys(groups); _i < _a.length; _i++) {
            var k = _a[_i];
            var g = groups[k].slice();
            groups[k] = this.merge_individual_groups(g);
        }
        return groups;
    };
    Colorize.merge_individual_groups = function (group) {
        var t = new timer_1.Timer('merge_individual_groups');
        var numIterations = 0;
        group = group.sort();
        while (true) {
            var merged_one = false;
            var deleted_rectangles = {};
            var updated_rectangles = [];
            var working_group = group.slice();
            while (working_group.length > 0) {
                var head = working_group.shift();
                for (var i = 0; i < working_group.length; i++) {
                    if (rectangleutils_1.RectangleUtils.is_mergeable(head, working_group[i])) {
                        var head_str = JSON.stringify(head);
                        var working_group_i_str = JSON.stringify(working_group[i]);
                        // NB: 12/7/19 New check below, used to be unconditional.
                        if ((!(head_str in deleted_rectangles)) && (!(working_group_i_str in deleted_rectangles))) {
                            updated_rectangles.push(rectangleutils_1.RectangleUtils.bounding_box(head, working_group[i]));
                            deleted_rectangles[head_str] = true;
                            deleted_rectangles[working_group_i_str] = true;
                            merged_one = true;
                            break; // was disabled
                        }
                    }
                }
            }
            for (var i = 0; i < group.length; i++) {
                if (!(JSON.stringify(group[i]) in deleted_rectangles)) {
                    updated_rectangles.push(group[i]);
                }
            }
            updated_rectangles.sort();
            if (!merged_one) {
                return updated_rectangles;
            }
            group = updated_rectangles.slice();
            numIterations++;
            if (numIterations > 2000) { // This is a hack to guarantee convergence.
                console.log('Too many iterations; abandoning this group.');
                t.split('done, ' + numIterations + ' iterations.');
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
    // Discount proposed fixes if they have different formats.
    Colorize.adjust_proposed_fixes = function (fixes, propertiesToGet, origin_col, origin_row) {
        var proposed_fixes = [];
        // tslint:disable-next-line: forin
        for (var k in fixes) {
            // Format of proposed fixes =, e.g., [-3.016844756293869, [[5,7],[5,11]],[[6,7],[6,11]]]
            // entropy, and two ranges:
            //    upper-left corner of range (column, row), lower-right corner of range (column, row)
            var score = fixes[k][0];
            // Get rid of scores below 0.01.
            if ((-score * 100) < 1) {
                // console.log('trimmed ' + (-score));
                continue;
            }
            // Sort the fixes.
            // This is a pain because if we don't pad appropriately, [1,9] is 'less than' [1,10]. (Seriously.)
            // So we make sure that numbers are always left padded with zeroes to make the number 10 digits long
            // (which is 1 more than Excel needs right now).
            var firstPadded = fixes[k][1].map(function (a) { return a.toString().padStart(10, '0'); });
            var secondPadded = fixes[k][2].map(function (a) { return a.toString().padStart(10, '0'); });
            var first = (firstPadded < secondPadded) ? fixes[k][1] : fixes[k][2];
            var second = (firstPadded < secondPadded) ? fixes[k][2] : fixes[k][1];
            var _a = first[0], ax1 = _a[0], ay1 = _a[1], _b = first[1], ax2 = _b[0], ay2 = _b[1];
            var _c = second[0], bx1 = _c[0], by1 = _c[1], _d = second[1], bx2 = _d[0], by2 = _d[1];
            var col0 = ax1 - origin_col - 1;
            var row0 = ay1 - origin_row - 1;
            var col1 = bx2 - origin_col - 1;
            var row1 = by2 - origin_row - 1;
            // Now check whether the formats are all the same or not.
            var sameFormats = true;
            var firstFormat = JSON.stringify(propertiesToGet[row0][col0]);
            for (var i = row0; i <= row1; i++) {
                for (var j = col0; j <= col1; j++) {
                    var str = JSON.stringify(propertiesToGet[i][j]);
                    if (str !== firstFormat) {
                        sameFormats = false;
                        break;
                    }
                }
            }
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
            var stencil = Colorize.stencilize(formula_matrix);
            console.log('after stencilize: stencil = ' + JSON.stringify(stencil));
            var probs = Colorize.compute_stencil_probabilities(cols, rows, stencil);
            console.log('probs = ' + JSON.stringify(probs));
            var candidateSuspiciousCells = Colorize.generate_suspicious_cells(cols, rows, origin[0] - 1, origin[1] - 1, formula_matrix, probs, threshold);
            // Prune any cell that is in fact a formula.
            if (typeof formulas !== 'undefined') {
                var totalFormulaWeight_1 = 0;
                var totalWeight_1 = 0;
                suspiciousCells = candidateSuspiciousCells.filter(function (c) {
                    var theFormula = formulas[c[1] - origin[1]][c[0] - origin[0]];
                    if ((theFormula.length < 1) || (theFormula[0] !== '=')) {
                        totalWeight_1 += c[2];
                        return true;
                    }
                    else {
                        // It's a formula: we will remove it, but also track how much it contributed to the probability distribution.
                        totalFormulaWeight_1 += c[2];
                        totalWeight_1 += c[2];
                        return false;
                    }
                });
                console.log('total formula weight = ' + totalFormulaWeight_1);
                console.log('total weight = ' + totalWeight_1);
                // Now we need to correct all the non-formulas to give them weight proportional to the case when the formulas are removed.
                var multiplier_1 = totalFormulaWeight_1 / totalWeight_1;
                console.log('after processing 1, suspiciousCells = ' + JSON.stringify(suspiciousCells));
                suspiciousCells = suspiciousCells.map(function (c) { return [c[0], c[1], c[2] * multiplier_1]; });
                console.log('after processing 2, suspiciousCells = ' + JSON.stringify(suspiciousCells));
                suspiciousCells = suspiciousCells.filter(function (c) { return c[2] <= threshold; });
                console.log('after processing 3, suspiciousCells = ' + JSON.stringify(suspiciousCells));
            }
            else {
                suspiciousCells = candidateSuspiciousCells;
            }
        }
        return suspiciousCells;
    };
    Colorize.reportingThreshold = 35; //  percent of bar
    Colorize.suspiciousCellsReportingThreshold = 85; //  percent of bar
    Colorize.formattingDiscount = 50; // percent of discount: 100% means different formats = not suspicious at all
    Colorize.formulasThreshold = 10000;
    Colorize.valuesThreshold = 10000;
    // Color-blind friendly color palette.
    Colorize.palette = ['#ecaaae', '#74aff3', '#d8e9b2', '#deb1e0', '#9ec991', '#adbce9', '#e9c59a', '#71cdeb', '#bfbb8a', '#94d9df', '#91c7a8', '#b4efd3', '#80b6aa', '#9bd1c6']; // removed '#73dad1'
    // True iff this class been initialized.
    Colorize.initialized = false;
    // The array of colors (used to hash into).
    Colorize.color_list = [];
    // A multiplier for the hash function.
    Colorize.Multiplier = 1; // 103037;
    // A hash string indicating no dependencies.
    Colorize.distinguishedZeroHash = '12345';
    return Colorize;
}());
exports.Colorize = Colorize;
