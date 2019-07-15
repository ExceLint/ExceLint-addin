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
var colorutils_1 = require("./colorutils");
var excelutils_1 = require("./excelutils");
var rectangleutils_1 = require("./rectangleutils");
var timer_1 = require("./timer");
var jsonclone_1 = require("./jsonclone");
var Colorize = /** @class */ (function () {
    function Colorize() {
    }
    Colorize.initialize = function () {
        var e_1, _a;
        if (!this.initialized) {
            this.make_light_color_versions();
            try {
                for (var _b = __values(Object.keys(this.light_color_dict)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var i = _c.value;
                    this.color_list.push(i);
                    this.light_color_list.push(this.light_color_dict[i]);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.initialized = true;
        }
    };
    Colorize.get_color = function (hashval) {
        var color = this.color_list[(hashval * 1) % this.color_list.length];
        //	console.log("get_color " + hashval + ", " + (hashval * 1) + " = " + color);
        return color;
    };
    Colorize.is_banned_color = function (h, s, v) {
        var ban_it = false;
        var _a = __read(colorutils_1.ColorUtils.HSVtoRGB(h, s, v), 3), r = _a[0], g = _a[1], b = _a[2];
        if ((r > 128) && (g < 128) && (b < 128)) {
            // Too red.
            ban_it = true;
        }
        if ((r < 192) && (g > 128) && (b < 192)) {
            // Too green.
            ban_it = true;
        }
        // Also avoid colors near '#eed202', safety yellow.
        var safety_r = 238;
        var safety_g = 210;
        var safety_b = 2;
        var threshold = 128;
        if ((Math.abs(r - safety_r) < threshold) && (Math.abs(g - safety_g) < threshold) && (Math.abs(b - safety_b) < threshold)) {
            ///			console.log("too close to safety yellow.");
            ban_it = true;
        }
        if (ban_it) {
            ///			console.log("Banned a color: " + r + ", " + g + ", " + b);
        }
        return ban_it;
    };
    Colorize.make_light_color_versions = function () {
        //	    console.log('building color map (make_light_color_versions)');
        var arr = Colorize.palette; // ["#ecaaae", "#74aff3", "#d8e9b2", "#deb1e0", "#9ec991", "#adbce9", "#e9c59a", "#71cdeb", "#bfbb8a", "#94d9df", "#91c7a8", "#b4efd3", "#80b6aa", "#9bd1c6"]; // removed "#73dad1", 
        //	    let arr = ['#8E0152','#C51B7D','#D01C8B','#DE77AE','#E9A3C9','#F1B6DA','#FDE0EF','#F7F7F7','#E6F5D0','#B8E186','#A1D76A','#7FBC41','#4DAC26','#4D9221','#276419'];
        for (var i = 0; i < arr.length; i++) {
            this.light_color_dict[arr[i]] = '';
        }
        return;
        for (var i = 0; i < 255; i += 9) {
            var h = i / 255.0;
            var s = 0.5;
            var v = 0.85;
            if (this.is_banned_color(h, s, v)) {
                continue;
            }
            var rgb = colorutils_1.ColorUtils.HSVtoRGB(h, s, v);
            var _a = __read(rgb.map(function (x) { return Math.round(x).toString(16).padStart(2, '0'); }), 3), rs = _a[0], gs = _a[1], bs = _a[2];
            var str = '#' + rs + gs + bs;
            str = str.toUpperCase();
            this.light_color_dict[str] = '';
        }
        for (var color in this.light_color_dict) {
            var lightstr = colorutils_1.ColorUtils.adjust_brightness(color, 4.0);
            var darkstr = color; // = this.adjust_color(color, 0.25);
            //			console.log(str);
            //			console.log('Old RGB = ' + color + ', new = ' + str);
            delete this.light_color_dict[color];
            this.light_color_dict[darkstr] = lightstr;
        }
    };
    Colorize.get_light_color_version = function (color) {
        return this.light_color_dict[color];
    };
    /*
      private static transpose(array) {
      array[0].map((col, i) => array.map(row => row[i]));
      }
    */
    Colorize.process_formulas = function (formulas, origin_col, origin_row) {
        console.log("***** PROCESS FORMULAS *****");
        var distinguishedZeroHash = "0";
        var base_vector = JSON.stringify(excelutils_1.ExcelUtils.baseVector());
        var reducer = function (acc, curr) { return [acc[0] + curr[0], acc[1] + curr[1], acc[2] + curr[2]]; };
        var output = [];
        // Compute the vectors for all of the formulas.
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                // If it's a formula, process it.
                if ((row[j].length > 0) && (row[j][0] === '=')) {
                    var cell = row[j];
                    var vec_array = excelutils_1.ExcelUtils.all_dependencies(i, j, origin_row + i, origin_col + j, formulas);
                    var adjustedX = j + origin_col + 1;
                    var adjustedY = i + origin_row + 1;
                    // 		    console.log("vec_array WAS = " + JSON.stringify(vec_array));
                    if (vec_array.length == 0) {
                        // No dependencies! Use a distinguished value.
                        output.push([[adjustedX, adjustedY, 0], distinguishedZeroHash]);
                    }
                    else {
                        var vec = vec_array.reduce(reducer);
                        if (JSON.stringify(vec) === base_vector) {
                            // No dependencies! Use a distinguished value.
                            output.push([[adjustedX, adjustedY, 0], distinguishedZeroHash]);
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
        //	console.log(JSON.stringify(all_deps));
        return output;
    };
    //    public static color_all_data(formulas: Array<Array<string>>, processed_formulas: Array<[excelintVector, string]>) {
    Colorize.color_all_data = function (refs) {
        var e_2, _a;
        var t = new timer_1.Timer("color_all_data");
        //console.log('color_all_data');
        //console.log("formula length = " + formulas.length);
        //console.log("processed formulas length = " + processed_formulas.length);
        // let refs = this.generate_all_references(formulas);
        //t.split("generated all references");
        //console.log("generated all references: length = " + Object.keys(refs).length);
        //	console.log("all refs = " + JSON.stringify(refs));
        var processed_data = [];
        try {
            for (var _b = __values(Object.keys(refs)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var refvec = _c.value;
                //	    let rv = JSON.parse('[' + refvec + ']');
                var rv = refvec.split(',');
                var row = Number(rv[0]);
                var col = Number(rv[1]);
                processed_data.push([[row, col], 1]);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        t.split("processed all data");
        //	console.log("color_all_data: processed_data = " + JSON.stringify(processed_data));
        return processed_data;
    };
    // Take in a list of [[row, col], color] pairs and group them,
    // sorting them (e.g., by columns).
    Colorize.identify_ranges = function (list, sortfn) {
        var e_3, _a, e_4, _b;
        // Separate into groups based on their string value.
        var groups = {};
        try {
            for (var list_1 = __values(list), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
                var r = list_1_1.value;
                groups[r[1]] = groups[r[1]] || [];
                groups[r[1]].push(r[0]);
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (list_1_1 && !list_1_1.done && (_a = list_1["return"])) _a.call(list_1);
            }
            finally { if (e_3) throw e_3.error; }
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
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_b = _c["return"])) _b.call(_c);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return groups;
    };
    Colorize.group_ranges = function (groups, columnFirst) {
        var e_5, _a, e_6, _b;
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
                catch (e_6_1) { e_6 = { error: e_6_1 }; }
                finally {
                    try {
                        if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
                    }
                    finally { if (e_6) throw e_6.error; }
                }
                output[k].push([prev, last]);
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_5) throw e_5.error; }
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
        //	    let newGr1 = _.clone(gr);
        //let newGr1 = lodash.clone(gr);
        var newGr1 = jsonclone_1.JSONclone.clone(gr);
        //	    let newGr1 = JSON.parse(JSON.stringify(gr)); // deep copy
        //        let newGr2 = JSON.parse(JSON.stringify(gr)); // deep copy
        //        console.log('group');
        //        console.log(JSON.stringify(newGr1));
        var mg = this.merge_groups(newGr1);
        //        let mr = this.mergeable(newGr1);
        //        console.log('mergeable');
        //       console.log(JSON.stringify(mr));
        //       let mg = this.merge_groups(newGr2, mr);
        //        console.log('new merge groups');
        //        console.log(JSON.stringify(mg));
        //this.generate_proposed_fixes(mg);
        return mg;
    };
    Colorize.entropy = function (p) {
        return -p * Math.log2(p);
    };
    Colorize.entropydiff = function (oldcount1, oldcount2) {
        var total = oldcount1 + oldcount2;
        var prevEntropy = this.entropy(oldcount1 / total) + this.entropy(oldcount2 / total);
        //	const newEntropy = this.entropy(oldcount1 + oldcount2);
        //	const normalizedEntropy = prevEntropy / (total * Math.log2(total));
        var normalizedEntropy = prevEntropy / (Math.log2(total));
        //	return newEntropy - prevEntropy;
        // return prevEntropy; // FIXME ? a test, non normalized
        return -normalizedEntropy;
    };
    Colorize.fix_metric = function (target_norm, target, merge_with_norm, merge_with, sheetDiagonal, sheetArea) {
        var _a = __read(target, 2), t1 = _a[0], t2 = _a[1];
        var _b = __read(merge_with, 2), m1 = _b[0], m2 = _b[1];
        var n_target = rectangleutils_1.RectangleUtils.area([[t1[0], t1[1]], [t2[0], t2[1]]]);
        var n_merge_with = rectangleutils_1.RectangleUtils.area([[m1[0], m1[1]], [m2[0], m2[1]]]);
        var n_min = Math.min(n_target, n_merge_with);
        var n_max = Math.max(n_target, n_merge_with);
        var norm_min = Math.min(merge_with_norm, target_norm);
        var norm_max = Math.max(merge_with_norm, target_norm);
        var fix_distance = Math.abs(norm_max - norm_min) / this.Multiplier;
        var entropy_drop = this.entropydiff(n_min, n_max); // negative
        console.log("entropy drop = " + entropy_drop);
        //	let ranking = (1.0 + entropy_drop); // ONLY COUNT ENTROPY (between 0 and 1)
        var ranking = (1.0 + entropy_drop) / (fix_distance * n_min); // ENTROPY WEIGHTED BY FIX DISTANCE
        //	let ranking = -(1.0 - entropy_drop) / ((fix_distance * n_min) / sheetDiagonal);
        sheetArea = sheetArea;
        sheetDiagonal = sheetDiagonal;
        // Updating based on size formula.
        console.log("fix distance = " + fix_distance + " for " + JSON.stringify(target) + " and " + JSON.stringify(merge_with));
        console.log("ranking was " + ranking);
        //	ranking = -(n_max / ranking); // negating to sort in reverse order.
        ranking = -ranking; // negating to sort in reverse order.
        console.log("ranking now " + ranking);
        return ranking;
    };
    Colorize.count_proposed_fixes = function (fixes) {
        var count = 0;
        for (var k in fixes) {
            //	    console.log("FIX FIX FIX fixes[k] = " + JSON.stringify(fixes[k][1]));
            var _a = __read(fixes[k][1], 2), f11 = _a[0], f12 = _a[1];
            var _b = __read(fixes[k][2], 2), f21 = _b[0], f22 = _b[1];
            count += rectangleutils_1.RectangleUtils.diagonal([[f11[0], f11[1]], [f12[0], f12[1]]]);
            count += rectangleutils_1.RectangleUtils.diagonal([[f21[0], f21[1]], [f22[0], f22[1]]]);
        }
        return count;
    };
    Colorize.generate_proposed_fixes = function (groups, diagonal, area) {
        var e_7, _a, e_8, _b;
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
                                    if (rectangleutils_1.RectangleUtils.is_mergeable(r1, r2) && (rectangleutils_1.RectangleUtils.area(r1) + rectangleutils_1.RectangleUtils.area(r2) > 2)) {
                                        already_proposed_pair[sr1 + sr2] = true;
                                        already_proposed_pair[sr2 + sr1] = true;
                                        ///								console.log("generate_proposed_fixes: could merge (" + k1 + ") " + JSON.stringify(groups[k1][i]) + " and (" + k2 + ") " + JSON.stringify(groups[k2][j]));
                                        var metric = this.fix_metric(parseFloat(k1), r1, parseFloat(k2), r2, diagonal, area);
                                        // was Math.abs(parseFloat(k2) - parseFloat(k1))
                                        proposed_fixes.push([metric, r1, r2]);
                                    }
                                }
                            }
                        }
                    }
                    catch (e_8_1) { e_8 = { error: e_8_1 }; }
                    finally {
                        try {
                            if (_f && !_f.done && (_b = _e["return"])) _b.call(_e);
                        }
                        finally { if (e_8) throw e_8.error; }
                    }
                }
            }
        }
        catch (e_7_1) { e_7 = { error: e_7_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
            }
            finally { if (e_7) throw e_7.error; }
        }
        // First attribute is the Euclidean norm of the vectors. Differencing corresponds roughly to earth-mover distance.
        // Other attributes are the rectangles themselves. Sort by biggest entropy reduction first.
        proposed_fixes.sort(function (a, b) { return a[0] - b[0]; });
        return proposed_fixes;
    };
    Colorize.merge_groups = function (groups) {
        var e_9, _a;
        try {
            for (var _b = __values(Object.keys(groups)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var k = _c.value;
                var g = groups[k].slice();
                groups[k] = this.merge_individual_groups(g); // JSON.parse(JSON.stringify(groups[k])));
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return groups;
    };
    Colorize.merge_individual_groups = function (group) {
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
                return updated_rectangles;
            }
            group = updated_rectangles.slice(); // JSON.parse(JSON.stringify(updated_rectangles));
            numIterations++;
            if (numIterations > 20) {
                return [[[-1, -1, 0], [-1, -1, 0]]];
            }
        }
    };
    Colorize.hash_vector = function (vec) {
        var baseX = 0; // 7;
        var baseY = 0; // 3;
        var v0 = Math.abs(vec[0] - baseX);
        //	v0 = v0 * v0;
        var v1 = Math.abs(vec[1] - baseY);
        //	v1 = v1 * v1;
        var v2 = vec[2];
        return this.Multiplier * (v0 + v1 + v2);
        //	return this.Multiplier * (Math.sqrt(v0 + v1) + v2);
        // Return a hash of the given vector.
        //	let h = Math.sqrt(vec.map(v => { return v * v; }).reduce((a, b) => { return a + b; }));
        //	console.log("hash of " + JSON.stringify(vec) + " = " + h);
        //		return h;
        //        let h = this.hash(JSON.stringify(vec) + 'NONCE01');
        //        return h;
    };
    Colorize.palette = ["#ecaaae", "#74aff3", "#d8e9b2", "#deb1e0", "#9ec991", "#adbce9", "#e9c59a", "#71cdeb", "#bfbb8a", "#94d9df", "#91c7a8", "#b4efd3", "#80b6aa", "#9bd1c6"]; // removed "#73dad1", 
    Colorize.initialized = false;
    Colorize.color_list = [];
    Colorize.light_color_list = [];
    Colorize.light_color_dict = {};
    Colorize.Multiplier = 103038;
    return Colorize;
}());
exports.Colorize = Colorize;
//console.log(this.dependencies('$C$2:$E$5', 10, 10));
//console.log(this.dependencies('$A$123,A1:B$12,$A12:$B$14', 10, 10));
//console.log(this.hash_vector(this.dependencies('$C$2:$E$5', 10, 10)));
