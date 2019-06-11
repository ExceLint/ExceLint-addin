"use strict";
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
        if (!this.initialized) {
            this.make_light_color_versions();
            for (var _i = 0, _a = Object.keys(this.light_color_dict); _i < _a.length; _i++) {
                var i = _a[_i];
                this.color_list.push(i);
                this.light_color_list.push(this.light_color_dict[i]);
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
        var _a = colorutils_1.ColorUtils.HSVtoRGB(h, s, v), r = _a[0], g = _a[1], b = _a[2];
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
        var arr = ["#ecaaae", "#74aff3", "#d8e9b2", "#deb1e0", "#9ec991", "#adbce9", "#e9c59a", "#71cdeb", "#bfbb8a", "#94d9df", "#91c7a8", "#b4efd3", "#80b6aa", "#9bd1c6"]; // removed "#73dad1", 
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
            var _a = rgb.map(function (x) { return Math.round(x).toString(16).padStart(2, '0'); }), rs = _a[0], gs = _a[1], bs = _a[2];
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
        var lastHash = 0;
        var lastHashString = lastHash.toString();
        var output = [];
        // Build up all of the columns of colors.
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            //		    console.log("process_formulas: formulas[" + i + "] = " + JSON.stringify(row));
            for (var j = 0; j < row.length; j++) {
                if ((row[j].length > 0) && (row[j][0] === '=')) {
                    var cell = row[j];
                    //				console.log("process_formulas: i = " + i + ", j = " + j);
                    //				console.log("process_formulas: origin_col, row = " + origin_col + ", " + origin_row);
                    //				    console.log("process_formulas: row = " + JSON.stringify(cell));
                    var vec = excelutils_1.ExcelUtils.dependencies(cell, j + origin_col + 1, i + origin_row + 1);
                    if (vec[0] === 0 && vec[1] === 0) {
                        // No dependencies! Use a distinguished "0" value (always the same color?).
                        output.push([[j + origin_col + 1, i + origin_row + 1], "0"]);
                    }
                    else {
                        //				    console.log("process_formulas: vector = " + JSON.stringify(vec));
                        var hash = this.hash_vector(vec);
                        var str = "";
                        if (hash == lastHash) {
                        }
                        else {
                            lastHash = hash;
                            lastHashString = hash.toString();
                        }
                        str = lastHashString;
                        //				    console.log("process_formulas: hash of this vector = " + hash);
                        output.push([[j + origin_col + 1, i + origin_row + 1], str]);
                    }
                }
            }
        }
        return output;
    };
    //    public static color_all_data(formulas: Array<Array<string>>, processed_formulas: Array<[[number, number], string]>) {
    Colorize.color_all_data = function (refs) {
        var t = new timer_1.Timer("color_all_data");
        //console.log('color_all_data');
        //console.log("formula length = " + formulas.length);
        //console.log("processed formulas length = " + processed_formulas.length);
        // let refs = this.generate_all_references(formulas);
        //t.split("generated all references");
        //console.log("generated all references: length = " + Object.keys(refs).length);
        //	console.log("all refs = " + JSON.stringify(refs));
        var processed_data = [];
        for (var _i = 0, _a = Object.keys(refs); _i < _a.length; _i++) {
            var refvec = _a[_i];
            //	    let rv = JSON.parse('[' + refvec + ']');
            var rv = refvec.split(',');
            var row = Number(rv[0]);
            var col = Number(rv[1]);
            processed_data.push([[row, col], 1]);
        }
        t.split("processed all data");
        //	console.log("color_all_data: processed_data = " + JSON.stringify(processed_data));
        return processed_data;
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
            //	console.log(k);
            groups[k].sort(sortfn);
            //	console.log(groups[k]);
        }
        return groups;
    };
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
        var normalizedEntropy = prevEntropy / Math.log2(total);
        //	return newEntropy - prevEntropy;
        return normalizedEntropy;
    };
    Colorize.fix_metric = function (target_norm, target, merge_with_norm, merge_with) {
        var n_target = rectangleutils_1.RectangleUtils.area(target);
        var n_merge_with = rectangleutils_1.RectangleUtils.area(merge_with);
        var n_min = Math.min(n_target, n_merge_with);
        var n_max = Math.max(n_target, n_merge_with);
        var norm_min = Math.min(merge_with_norm, target_norm);
        var norm_max = Math.max(merge_with_norm, target_norm);
        var fix_distance = Math.abs(norm_max - norm_min) / this.Multiplier;
        var entropy_drop = this.entropydiff(n_min, n_max); // this.entropy(n_min / (n_min + n_max));
        var ranking = (1.0 - entropy_drop) / (fix_distance * n_min);
        return ranking / Math.log2(n_min + n_max);
    };
    Colorize.count_proposed_fixes = function (fixes) {
        var count = 0;
        for (var k in fixes) {
            //	    console.log("FIX FIX FIX fixes[k] = " + JSON.stringify(fixes[k][1]));
            count += rectangleutils_1.RectangleUtils.area(fixes[k][1]);
            count += rectangleutils_1.RectangleUtils.area(fixes[k][2]);
        }
        return count;
    };
    Colorize.generate_proposed_fixes = function (groups) {
        var proposed_fixes = [];
        var already_proposed_pair = {};
        for (var _i = 0, _a = Object.keys(groups); _i < _a.length; _i++) {
            var k1 = _a[_i];
            // Look for possible fixes in OTHER groups.
            for (var i = 0; i < groups[k1].length; i++) {
                var r1 = groups[k1][i];
                var sr1 = JSON.stringify(r1);
                for (var _b = 0, _c = Object.keys(groups); _b < _c.length; _b++) {
                    var k2 = _c[_b];
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
                                var metric = this.fix_metric(parseFloat(k1), r1, parseFloat(k2), r2);
                                // was Math.abs(parseFloat(k2) - parseFloat(k1))
                                proposed_fixes.push([metric, r1, r2]);
                            }
                        }
                    }
                }
            }
        }
        // First attribute is the Euclidean norm of the vectors. Differencing corresponds roughly to earth-mover distance.
        // Other attributes are the rectangles themselves. Sort by biggest entropy reduction first.
        proposed_fixes.sort(function (a, b) { return a[0] - b[0]; });
        return proposed_fixes;
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
                return [[[-1, -1], [-1, -1]]];
            }
        }
    };
    Colorize.generate_all_references = function (formulas) {
        // Generate all references.
        var refs = {};
        var counter = 0;
        for (var i = 0; i < formulas.length; i++) {
            var row = formulas[i];
            for (var j = 0; j < row.length; j++) {
                var cell = row[j];
                counter++;
                if (counter % 1000 == 0) {
                    console.log(counter + " references down");
                }
                // console.log('origin_col = '+origin_col+', origin_row = ' + origin_row);
                if (cell[0] === '=') {
                    var all_deps = excelutils_1.ExcelUtils.all_cell_dependencies(cell); // , origin_col + j, origin_row + i);
                    for (var _i = 0, all_deps_1 = all_deps; _i < all_deps_1.length; _i++) {
                        var dep = all_deps_1[_i];
                        var key = dep.join(',');
                        refs[key] = true; // refs[key] || [];
                        // NOTE: we are disabling pushing the src onto the list because we don't need it.
                        // refs[dep2.join(',')].push(src);
                    }
                }
            }
        }
        return refs;
    };
    Colorize.hash_vector = function (vec) {
        var baseX = 7;
        var baseY = 3;
        var v0 = vec[0] - baseX;
        v0 = v0 * v0;
        var v1 = vec[1] - baseY;
        v1 = v1 * v1;
        return this.Multiplier * Math.sqrt(v0 + v1);
        // Return a hash of the given vector.
        //	let h = Math.sqrt(vec.map(v => { return v * v; }).reduce((a, b) => { return a + b; }));
        //	console.log("hash of " + JSON.stringify(vec) + " = " + h);
        //		return h;
        //        let h = this.hash(JSON.stringify(vec) + 'NONCE01');
        //        return h;
    };
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
