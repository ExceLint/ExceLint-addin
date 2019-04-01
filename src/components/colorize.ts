import { rgb2hex, GroupedList } from 'office-ui-fabric-react';
import { ColorUtils } from './colorutils';
import { ExcelUtils } from './excelutils';
import { RectangleUtils } from './rectangleutils';
import { ExcelUtilities } from '@microsoft/office-js-helpers';

export class Colorize {

    private static rgb_ex = new RegExp('#([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])');

    private static initialized = false;
    private static color_list = [];
    private static light_color_list = [];
    private static light_color_dict = {};

    public static initialize() {
        if (!Colorize.initialized) {
            Colorize.make_light_color_versions();
            for (let i of Object.keys(Colorize.light_color_dict)) {
                Colorize.color_list.push(i);
                Colorize.light_color_list.push(Colorize.light_color_dict[i]);
            }
            Colorize.initialized = true;
        }
    }

    public static get_color(hashval: number): string {
        return Colorize.color_list[hashval % Colorize.color_list.length];
    }

    private static make_light_color_versions() {
        //		console.log('YO');
        for (let i = 0; i < 255; i += 7) {
            let rgb = ColorUtils.HSVtoRGB(i / 255.0, .5, .75);
            let [rs, gs, bs] = rgb.map((x) => { return Math.round(x).toString(16).padStart(2, '0'); });
            let str = '#' + rs + gs + bs;
            str = str.toUpperCase();
            Colorize.light_color_dict[str] = '';
        }
        for (let color in Colorize.light_color_dict) {
            let lightstr = Colorize.adjust_color(color, 2.0);
            let darkstr = color; // = Colorize.adjust_color(color, 0.25);
            //			console.log(str);
            //			console.log('Old RGB = ' + color + ', new = ' + str);
            delete Colorize.light_color_dict[color];
            Colorize.light_color_dict[darkstr] = lightstr;
        }

    }

    public static adjust_color(color: string, multiplier: number): string {
        let c = Colorize.rgb_ex.exec(color);
        let [r, g, b] = [parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16)];
        let [h, s, v] = ColorUtils.RGBtoHSV(r, g, b);
        v = multiplier * v;
        if (v <= 0.0) { v = 0.0; }
        if (v >= 1.0) { v = 0.99; }
        let rgb = ColorUtils.HSVtoRGB(h, s, v);
        let [rs, gs, bs] = rgb.map((x) => { return Math.round(x).toString(16).padStart(2, '0'); });
        let str = '#' + rs + gs + bs;
        str = str.toUpperCase();
        return str;
    }



    public static get_light_color_version(color: string): string {
        return Colorize.light_color_dict[color];
    }

    /*
      private static transpose(array) {
      array[0].map((col, i) => array.map(row => row[i]));
      }
    */

    public static process_formulas(formulas: Array<Array<string>>, origin_col: number, origin_row: number): Array<[[number, number], string]> {
        let output: Array<[[number, number], string]> = [];
        // Build up all of the columns of colors.
        for (let i = 0; i < formulas.length; i++) {
            let row = formulas[i];
            for (let j = 0; j < row.length; j++) {
                if ((row[j].length > 0) && (row[j][0] === '=')) {
                    let vec = ExcelUtils.dependencies(row[j], j + origin_col, i + origin_row);
                    let hash = Colorize.hash_vector(vec);
                    output.push([[j + origin_col + 1, i + origin_row + 1], hash.toString()]);
                }
            }
        }
        return output;
    }

    public static color_all_data(formulas: Array<Array<string>>, processed_formulas: Array<[[number, number], string]>, origin_col: number, origin_row: number) {
        //console.log('color_all_data');
        let refs = Colorize.generate_all_references(formulas, origin_col, origin_row);
        let data_color = {};
        let processed_data = [];

        // Generate all formula colors (as a dict).
        let formula_hash = {};
        for (let f of processed_formulas) {
            let formula_vec = f[0];
            formula_hash[formula_vec.join(',')] = f[1];
        }

        // Color all references based on the color of their referring formula.
        for (let refvec of Object.keys(refs)) {
            for (let r of refs[refvec]) {
                let hash = formula_hash[r.join(',')];
                if (!(hash === undefined)) {
                    let rv = JSON.parse('[' + refvec + ']');
                    let row = parseInt(rv[0], 10);
                    let col = parseInt(rv[1], 10);
                    let rj = [row, col].join(',');
                    if (!(rj in formula_hash)) {
                        if (!(rj in data_color)) {
                            processed_data.push([[row, col], hash]);
                            data_color[rj] = hash;
                        }
                    }
                }
            }
        }
        return processed_data;
    }


    private static hash(str: string): number {
        // From https://github.com/darkskyapp/string-hash
        let hash = 5381,
            i = str.length;

        while (i) {
            hash = (hash * 33) ^ str.charCodeAt(--i);
        }

        /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
        * integers. Since we want the results to be always positive, convert the
        * signed int to an unsigned by doing an unsigned bitshift. */
        return hash >>> 0;
    }

    // Take in a list of [[row, col], color] pairs and group them,
    // sorting them (e.g., by columns).
    private static identify_ranges(list: Array<[[number, number], string]>,
        sortfn?: (n1: [number, number], n2: [number, number]) => number)
        : { [val: string]: Array<[number, number]> } {
        // Separate into groups based on their string value.
        let groups = {};
        for (let r of list) {
            groups[r[1]] = groups[r[1]] || [];
            groups[r[1]].push(r[0]);
        }
        // Now sort them all.
        for (let k of Object.keys(groups)) {
            //	console.log(k);
            groups[k].sort(sortfn);
            //	console.log(groups[k]);
        }
        return groups;
    }

    private static group_ranges(groups: { [val: string]: Array<[number, number]> },
        columnFirst: boolean)
        : { [val: string]: Array<[[number, number], [number, number]]> } {
        let output = {};
        let index0 = 0; // column
        let index1 = 1; // row
        if (!columnFirst) {
            index0 = 1; // row
            index1 = 0; // column
        }
        for (let k of Object.keys(groups)) {
            output[k] = [];
            let prev = groups[k].shift();
            let last = prev;
            for (let v of groups[k]) {
                // Check if in the same column, adjacent row (if columnFirst; otherwise, vice versa).
                if ((v[index0] === last[index0]) && (v[index1] === last[index1] + 1)) {
                    last = v;
                } else {
                    output[k].push([prev, last]);
                    prev = v;
                    last = v;
                }
            }
            output[k].push([prev, last]);
        }
        return output;
    }

    public static identify_groups(list: Array<[[number, number], string]>): { [val: string]: Array<[[number, number], [number, number]]> } {
        let columnsort = (a: [number, number], b: [number, number]) => { if (a[0] === b[0]) { return a[1] - b[1]; } else { return a[0] - b[0]; } };
        let id = Colorize.identify_ranges(list, columnsort);
        let gr = Colorize.group_ranges(id, true); // column-first
        // Now try to merge stuff with the same hash.
        let newGr1 = JSON.parse(JSON.stringify(gr)); // deep copy
        let newGr2 = JSON.parse(JSON.stringify(gr)); // deep copy
        console.log('group');
        console.log(JSON.stringify(newGr1));
        let mg = Colorize.new_merge_groups(newGr1);
        //        let mr = Colorize.mergeable(newGr1);
        //        console.log('mergeable');
        //       console.log(JSON.stringify(mr));
        //       let mg = Colorize.merge_groups(newGr2, mr);
        console.log('new merge groups');
        console.log(JSON.stringify(mg));

        return mg;
    }


    public static new_merge_groups(groups: { [val: string]: Array<[[number, number], [number, number]]> })
        : { [val: string]: Array<[[number, number], [number, number]]> } {
        for (let k of Object.keys(groups)) {
            groups[k] = Colorize.merge_individual_groups(JSON.parse(JSON.stringify(groups[k])));
        }
        return groups;
    }

    public static merge_individual_groups(group: Array<[[number, number], [number, number]]>)
    : Array<[[number, number], [number, number]]> {
        let numIterations = 0;
        group = group.sort();
        console.log(JSON.stringify(group));
        while (true) {
	    console.log("iteration "+numIterations);
            let merged_one = false;
	    let deleted_rectangles = {};
            let updated_rectangles = [];
            let working_group = JSON.parse(JSON.stringify(group));
            while (working_group.length > 0) {
                let head = working_group.shift();
                for (let i = 0; i < working_group.length; i++) {
//                    console.log("comparing " + head + " and " + working_group[i]);
                    if (Colorize.merge_friendly(head, working_group[i])) {
                        console.log("friendly!" + head + " -- " + working_group[i]);
                        updated_rectangles.push(Colorize.merge_rectangles(head, working_group[i]));
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
	    for (let i = 0; i < group.length; i++) {
		if (!(JSON.stringify(group[i]) in deleted_rectangles)) {
		    updated_rectangles.push(group[i]);
		}
	    }
            updated_rectangles.sort();
//            console.log('updated rectangles = ' + JSON.stringify(updated_rectangles));
	    //            console.log('group = ' + JSON.stringify(group));
	    if (!merged_one) {
		console.log('updated rectangles = ' + JSON.stringify(updated_rectangles));
		return updated_rectangles;
	    }
            group = JSON.parse(JSON.stringify(updated_rectangles));
            numIterations++;
            if (numIterations > 20) {
                return [[[-1, -1], [-1, -1]]];
            }
        }
    }

    // True if combining A and B would result in a new rectangle.
    public static merge_friendly(A: [[number, number], [number, number]], B: [[number, number], [number, number]]): boolean {
	return RectangleUtils.mergeable(A, B);
    }

    // Return a merged version (both should be 'merge friendly').
    public static merge_rectangles(A: [[number, number], [number, number]],
        B: [[number, number], [number, number]])
    : [[number, number], [number, number]] {
	return RectangleUtils.bounding_box(A, B);
    }

    public static merge_groups(groups: { [val: string]: Array<[[number, number], [number, number]]> },
        merge_candidates: { [val: string]: Array<Array<[[number, number], [number, number]]>> })
        : { [val: string]: Array<[[number, number], [number, number]]> } {
        // Groups already passed as input to mergeable.
        // Merge_candidates generated by mergeable.
        // Go through all mergeable groups; for each, remove the corresponding two rectangles and add the merged one.
        let merged_rectangles: { [val: string]: Array<[[number, number], [number, number]]> } = {};
        let previous_merged_rectangles: { [val: string]: Array<[[number, number], [number, number]]> } = {};
        let numIterations = 0;
        while (true) {
            numIterations++;
            //	    console.log('iterating');
            previous_merged_rectangles = JSON.parse(JSON.stringify(merged_rectangles));
            for (let k of Object.keys(merge_candidates)) {
                let to_be_merged_rectangles = [];
                let removed = {};
                for (let range of merge_candidates[k]) {
                    let first: [[number, number], [number, number]] = range[0];
                    let second: [[number, number], [number, number]] = range[1];
                    // Add these to be removed later.
                    removed[JSON.stringify(first)] = true;
                    removed[JSON.stringify(second)] = true;
                    //console.log('1. marking for removal ' + JSON.stringify(first));
                    //console.log('2. marking for removal ' + JSON.stringify(second));
                    let merged = Colorize.merge_rectangles(first, second);
                    to_be_merged_rectangles.push(merged);
                }

                let newList = [];
                for (let i = 0; i < groups[k].length; i++) {
                    let v: [[number, number], [number, number]] = groups[k][i];
                    let str = JSON.stringify(v);
                    if (!(str in removed)) {
                        newList.push(groups[k][i]);
                    }
                }
                merged_rectangles[k] = newList;
                merged_rectangles[k].push(...to_be_merged_rectangles);
            }
            if (JSON.stringify(merged_rectangles) === JSON.stringify(previous_merged_rectangles)) {
                break;
            } else {
                //console.log(JSON.stringify(merged_rectangles));
                //console.log(JSON.stringify(previous_merged_rectangles));
            }
        }
        return merged_rectangles;
    }


    public static mergeable(grouped_ranges: { [val: string]: Array<[[number, number], [number, number]]> })
        : { [val: string]: Array<Array<[[number, number], [number, number]]>> } {
        // Input comes from group_ranges.
        let mergeable = {};
        for (let k of Object.keys(grouped_ranges)) {
            mergeable[k] = [];
            let r = grouped_ranges[k];
            while (r.length > 0) {
                let head = r.shift();
                let merge_candidates = r.filter((b) => { return Colorize.merge_friendly(head, b); });
                if (merge_candidates.length > 0) {
                    for (let c of merge_candidates) {
                        mergeable[k].push([head, c]);
                    }
                }
            }
        }
        return mergeable;
    }

    public static generate_all_references(formulas: Array<Array<string>>, origin_col: number, origin_row: number): { [dep: string]: Array<[number, number]> } {
        // Generate all references.
        let refs = {};
        for (let i = 0; i < formulas.length; i++) {
            let row = formulas[i];
            for (let j = 0; j < row.length; j++) {
                // console.log('origin_col = '+origin_col+', origin_row = ' + origin_row);
                let all_deps = ExcelUtils.all_cell_dependencies(row[j]); // , origin_col + j, origin_row + i);
                if (all_deps.length > 0) {
                    // console.log(all_deps);
                    let src = [origin_col + j, origin_row + i];
                    // console.log('src = ' + src);
                    for (let dep of all_deps) {
                        let dep2 = dep; // [dep[0]+origin_col, dep[1]+origin_row];
                        //				console.log('dep type = ' + typeof(dep));
                        //				console.log('dep = '+dep);
                        refs[dep2.join(',')] = refs[dep2.join(',')] || [];
                        refs[dep2.join(',')].push(src);
                        // console.log('refs[' + dep2.join(',') + '] = ' + JSON.stringify(refs[dep2.join(',')]));
                    }
                }
            }
        }
        return refs;
    }


    public static hash_vector(vec: Array<number>): number {
        // Return a hash of the given vector.
        let h = Colorize.hash(JSON.stringify(vec) + 'NONCE01');
        return h;
    }


}

//console.log(Colorize.dependencies('$C$2:$E$5', 10, 10));
//console.log(Colorize.dependencies('$A$123,A1:B$12,$A12:$B$14', 10, 10));
//console.log(Colorize.hash_vector(Colorize.dependencies('$C$2:$E$5', 10, 10)));
