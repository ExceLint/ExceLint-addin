"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
var excelutils_1 = require("./excelutils");
var rectangleutils_1 = require("./rectangleutils");
var timer_1 = require("./timer");
var jsonclone_1 = require("./jsonclone");
var Colorize = /** @class */ (function () {
    function Colorize() {
    }
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
        //	console.log("***** PROCESS FORMULAS *****");
        var base_vector = JSON.stringify(excelutils_1.ExcelUtils.baseVector());
        var reducer = function (acc, curr) { return [acc[0] + curr[0], acc[1] + curr[1], acc[2] + curr[2]]; };
        var output = [];
        console.log("process_formulas: " + JSON.stringify(formulas));
        // Compute the vectors for all of the formulas.
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j].toString();
                //		console.log("checking [" + cell + "]...");
                // If it's a formula, process it.
                if ((cell.length > 0)) { // FIXME MAYBE  && (row[j][0] === '=')) {
                    //		    console.log("processing cell " + JSON.stringify(cell) + " in process_formulas");
                    var vec_array = excelutils_1.ExcelUtils.all_dependencies(i, j, origin_row + i, origin_col + j, formulas);
                    var adjustedX = j + origin_col + 1;
                    var adjustedY = i + origin_row + 1;
                    // 		    console.log("vec_array WAS = " + JSON.stringify(vec_array));
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
                            output.push([[adjustedX, adjustedY, 0], Colorize.distinguishedZeroHash]);
                        }
                        else {
                            var hash = this.hash_vector(vec);
                            var str = hash.toString();
                            //			    console.log("hash for " + adjustedX + ", " + adjustedY + " = " + str);
                            output.push([[adjustedX, adjustedY, 0], str]);
                        }
                    }
                }
            }
        }
        //	console.log(JSON.stringify(all_deps));
        return output;
    };
    // Returns all referenced data so it can be colored later.
    Colorize.color_all_data = function (refs) {
        var e_1, _a;
        var t = new timer_1.Timer("color_all_data");
        var referenced_data = [];
        try {
            for (var _b = __values(Object.keys(refs)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var refvec = _c.value;
                var rv = refvec.split(',');
                var row = Number(rv[0]);
                var col = Number(rv[1]);
                referenced_data.push([[row, col, 0], Colorize.distinguishedZeroHash]); // See comment at top of function declaration.
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        t.split("processed all data");
        return referenced_data;
    };
    // Take all values and return an array of each row and column.
    // Note that for now, the last value of each tuple is set to 1.
    Colorize.process_values = function (values, origin_col, origin_row) {
        var value_array = [];
        var t = new timer_1.Timer("process_values");
        for (var i = 0; i < values.length; i++) {
            var row = values[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j].toString();
                if ((cell.length > 0)) { // FIXME MAYBE  && (row[j][0] === '=')) {
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
        var e_2, _a, e_3, _b;
        // Separate into groups based on their string value.
        var groups = {};
        try {
            for (var list_1 = __values(list), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                var r = list_1_1.value;
                groups[r[1]] = groups[r[1]] || [];
                groups[r[1]].push(r[0]);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (list_1_1 && !list_1_1.done && (_a = list_1["return"])) _a.call(list_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        try {
            // Now sort them all.
            for (var _c = __values(Object.keys(groups)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var k = _d.value;
                //	console.log(k);
                groups[k].sort(sortfn);
                //	console.log(groups[k]);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c["return"])) _b.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        return groups;
    };
    // Group all ranges by their value.
    Colorize.group_ranges = function (groups, columnFirst) {
        var e_4, _a, e_5, _b;
        var output = {};
        var index0 = 0; // column
        var index1 = 1; // row
        if (!columnFirst) {
            index0 = 1; // row
            index1 = 0; // column
        }
        try {
            for (var _c = __values(Object.keys(groups)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var k = _d.value;
                output[k] = [];
                var prev = groups[k].shift();
                var last = prev;
                try {
                    for (var _e = __values(groups[k]), _f = _e.next(); !_f.done; _f = _e.next()) {
                        var v = _f.value;
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
                }
                catch (e_5_1) { e_5 = { error: e_5_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
                    }
                    finally { if (e_5) throw e_5.error; }
                }
                output[k].push([prev, last]);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return output;
    };
    Colorize.identify_groups = function (list) {
        var columnsort = function (a, b) { if (a[0] === b[0]) {
            return a[1] - b[1];
        }
        else {
            return a[0] - b[0];
        } };
        var id = this.identify_ranges(list, columnsort);
        var gr = this.group_ranges(id, true); // column-first
        // Now try to merge stuff with the same hash.
        var newGr1 = jsonclone_1.JSONclone.clone(gr);
        var mg = this.merge_groups(newGr1);
        return mg;
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
        var _a = __read(target, 2), t1 = _a[0], t2 = _a[1];
        var _b = __read(merge_with, 2), m1 = _b[0], m2 = _b[1];
        var n_target = rectangleutils_1.RectangleUtils.area([[t1[0], t1[1], 0], [t2[0], t2[1], 0]]);
        var n_merge_with = rectangleutils_1.RectangleUtils.area([[m1[0], m1[1], 0], [m2[0], m2[1], 0]]);
        var n_min = Math.min(n_target, n_merge_with);
        var n_max = Math.max(n_target, n_merge_with);
        var norm_min = Math.min(merge_with_norm, target_norm);
        var norm_max = Math.max(merge_with_norm, target_norm);
        var fix_distance = Math.abs(norm_max - norm_min) / this.Multiplier;
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
            var _a = __read(fixes[k][1], 2), f11 = _a[0], f12 = _a[1];
            var _b = __read(fixes[k][2], 2), f21 = _b[0], f22 = _b[1];
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
            var this_front_str = JSON.stringify(fixes[k][1]);
            var this_back_str = JSON.stringify(fixes[k][2]);
            if (!(this_front_str in back) && !(this_back_str in front)) {
                // No match. Just merge them.
                new_fixes.push(fixes[k]);
            }
            else {
                console.log("**** original score = " + original_score);
                if ((!merged[this_front_str]) && (this_front_str in back)) {
                    console.log("**** (1) merging " + this_front_str + " with " + JSON.stringify(back[this_front_str]));
                    // FIXME. This calculation may not make sense.			
                    var newscore = -original_score * JSON.parse(back[this_front_str][0]);
                    //			console.log("pushing " + JSON.stringify(fixes[k][1]) + " with " + JSON.stringify(back[this_front_str][1]));
                    var new_fix = [newscore, fixes[k][1], back[this_front_str][1]];
                    console.log("pushing " + JSON.stringify(new_fix));
                    new_fixes.push(new_fix);
                    merged[this_front_str] = true;
                    // FIXME? testing below. The idea is to not keep merging things (for now).
                    merged[this_back_str] = true;
                    continue;
                }
                if ((!merged[this_back_str]) && (this_back_str in front)) {
                    // this_back_str in front
                    console.log("**** (2) merging " + this_back_str + " with " + JSON.stringify(front[this_back_str]));
                    // FIXME. This calculation may not make sense.
                    var newscore = -original_score * JSON.parse(front[this_back_str][0]);
                    //			console.log("pushing " + JSON.stringify(fixes[k][1]) + " with " + JSON.stringify(front[this_back_str][1]));
                    var new_fix = [newscore, fixes[k][1], front[this_back_str][2]];
                    console.log("pushing " + JSON.stringify(new_fix));
                    new_fixes.push(new_fix);
                    merged[this_back_str] = true;
                    // FIXME? testing below.
                    merged[this_front_str] = true;
                }
            }
        }
        return new_fixes;
    };
    // Generate an array of proposed fixes (a score and the two ranges to merge).
    Colorize.generate_proposed_fixes = function (groups) {
        var e_6, _a, e_7, _b;
        var t = new timer_1.Timer("generate_proposed_fixes");
        var proposed_fixes = [];
        var already_proposed_pair = {};
        try {
            for (var _c = __values(Object.keys(groups)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var k1 = _d.value;
                // Look for possible fixes in OTHER groups.
                for (var i = 0; i < groups[k1].length; i++) {
                    var r1 = groups[k1][i];
                    var sr1 = JSON.stringify(r1);
                    try {
                        for (var _e = __values(Object.keys(groups)), _f = _e.next(); !_f.done; _f = _e.next()) {
                            var k2 = _f.value;
                            if (k1 === k2) {
                                continue;
                            }
                            for (var j = 0; j < groups[k2].length; j++) {
                                var r2 = groups[k2][j];
                                var sr2 = JSON.stringify(r2);
                                // Only add these if we have not already added them.
                                if (!(sr1 + sr2 in already_proposed_pair) && !(sr2 + sr1 in already_proposed_pair)) {
                                    // If both are compatible rectangles AND the regions include more than two cells, propose them as fixes.
                                    //			    console.log("checking " + JSON.stringify(sr1) + " and " + JSON.stringify(sr2));
                                    if (rectangleutils_1.RectangleUtils.is_mergeable(r1, r2) && (rectangleutils_1.RectangleUtils.area(r1) + rectangleutils_1.RectangleUtils.area(r2) > 2)) {
                                        already_proposed_pair[sr1 + sr2] = true;
                                        already_proposed_pair[sr2 + sr1] = true;
                                        ///								console.log("generate_proposed_fixes: could merge (" + k1 + ") " + JSON.stringify(groups[k1][i]) + " and (" + k2 + ") " + JSON.stringify(groups[k2][j]));
                                        var metric = this.fix_metric(parseFloat(k1), r1, parseFloat(k2), r2);
                                        // was Math.abs(parseFloat(k2) - parseFloat(k1))
                                        var new_fix = [metric, r1, r2];
                                        console.log("pushing new fix = " + JSON.stringify(new_fix));
                                        proposed_fixes.push(new_fix);
                                    }
                                }
                            }
                        }
                    }
                    catch (e_7_1) { e_7 = { error: e_7_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
                        }
                        finally { if (e_7) throw e_7.error; }
                    }
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_6) throw e_6.error; }
        }
        // First attribute is the norm of the vectors. Differencing
        // corresponds to earth-mover distance.  Other attributes are
        // the rectangles themselves. Sort by biggest entropy
        // reduction first.
        console.log("proposed fixes was = " + JSON.stringify(proposed_fixes));
        // FIXME currently disabled.
        // 	proposed_fixes = this.fix_proposed_fixes(proposed_fixes);
        proposed_fixes.sort(function (a, b) { return a[0] - b[0]; });
        //	console.log("proposed fixes = " + JSON.stringify(proposed_fixes));
        t.split("done.");
        return proposed_fixes;
    };
    Colorize.merge_groups = function (groups) {
        var e_8, _a;
        try {
            for (var _b = __values(Object.keys(groups)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var k = _c.value;
                var g = groups[k].slice();
                groups[k] = this.merge_individual_groups(g); // JSON.parse(JSON.stringify(groups[k])));
            }
        }
        catch (e_8_1) { e_8 = { error: e_8_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_8) throw e_8.error; }
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
                t.split("done, " + numIterations + " iterations.");
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
        var useL1norm = false;
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
            var baseX = 7;
            var baseY = 3;
            var v0 = vec[0] - baseX;
            v0 = v0 * v0;
            var v1 = vec[1] - baseY;
            v1 = v1 * v1;
            var v2 = vec[2];
            return this.Multiplier * Math.sqrt(v0 + v1 + v2);
        }
        //	return this.Multiplier * (Math.sqrt(v0 + v1) + v2);
    };
    // Color-blind friendly color palette.
    Colorize.palette = ["#ecaaae", "#74aff3", "#d8e9b2", "#deb1e0", "#9ec991", "#adbce9", "#e9c59a", "#71cdeb", "#bfbb8a", "#94d9df", "#91c7a8", "#b4efd3", "#80b6aa", "#9bd1c6"]; // removed "#73dad1", 
    // True iff this class been initialized.
    Colorize.initialized = false;
    // The array of colors (used to hash into).
    Colorize.color_list = [];
    // A multiplier for the hash function.
    Colorize.Multiplier = 1; // 103037;
    // A hash string indicating no dependencies.
    Colorize.distinguishedZeroHash = "0";
    return Colorize;
}());
exports.Colorize = Colorize;
//console.log(this.dependencies('$C$2:$E$5', 10, 10));
//console.log(this.dependencies('$A$123,A1:B$12,$A12:$B$14', 10, 10));
//console.log(this.hash_vector(this.dependencies('$C$2:$E$5', 10, 10)));
