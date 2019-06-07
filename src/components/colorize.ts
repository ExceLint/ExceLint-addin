import { rgb2hex, GroupedList } from 'office-ui-fabric-react';
import { ColorUtils } from './colorutils';
import { ExcelUtils } from './excelutils';
import { RectangleUtils } from './rectangleutils';
import { ExcelUtilities } from '@microsoft/office-js-helpers';

export class Colorize {

	private static initialized = false;
	private static color_list = [];
	private static light_color_list = [];
    private static light_color_dict = {};
    private static Multiplier = 103038;

	public static initialize() {
		if (!this.initialized) {
			this.make_light_color_versions();
			for (let i of Object.keys(this.light_color_dict)) {
				this.color_list.push(i);
				this.light_color_list.push(this.light_color_dict[i]);
			}
			this.initialized = true;
		}
	}

    public static get_color(hashval: number): string {
	let color = this.color_list[(hashval * 1) % this.color_list.length];
//	console.log("get_color " + hashval + ", " + (hashval * 1) + " = " + color);
	return color;
    }

	private static is_banned_color(h: number, s: number, v: number): boolean {
		let ban_it = false;
		let [r, g, b] = ColorUtils.HSVtoRGB(h, s, v);
		if ((r > 128) && (g < 128) && (b < 128)) {
			// Too red.
			ban_it = true;
		}
		if ((r < 192) && (g > 128) && (b < 192)) {
			// Too green.
			ban_it = true;
		}
		// Also avoid colors near '#eed202', safety yellow.
		const safety_r = 238;
		const safety_g = 210;
		const safety_b = 2;
		const threshold = 128;
		if ((Math.abs(r - safety_r) < threshold) && (Math.abs(g - safety_g) < threshold) && (Math.abs(b - safety_b) < threshold)) {
///			console.log("too close to safety yellow.");
			ban_it = true;
		}
		if (ban_it) {
///			console.log("Banned a color: " + r + ", " + g + ", " + b);
		}
		return ban_it;
	}

	private static make_light_color_versions() {
//	    console.log('building color map (make_light_color_versions)');
	    let arr = ["#ecaaae", "#74aff3", "#d8e9b2", "#deb1e0", "#9ec991", "#adbce9", "#e9c59a", "#71cdeb", "#bfbb8a", "#94d9df", "#91c7a8", "#b4efd3", "#80b6aa", "#9bd1c6"]; // removed "#73dad1", 
//	    let arr = ['#8E0152','#C51B7D','#D01C8B','#DE77AE','#E9A3C9','#F1B6DA','#FDE0EF','#F7F7F7','#E6F5D0','#B8E186','#A1D76A','#7FBC41','#4DAC26','#4D9221','#276419'];
	    for (let i = 0; i < arr.length; i++) {
		this.light_color_dict[arr[i]] = '';
	    }
	    return;
	    
		for (let i = 0; i < 255; i += 9) {
			let h = i / 255.0;
			let s = 0.5;
			let v = 0.85;
			if (this.is_banned_color(h, s, v)) {
				continue;
			}
			let rgb = ColorUtils.HSVtoRGB(h, s, v);
			let [rs, gs, bs] = rgb.map((x) => { return Math.round(x).toString(16).padStart(2, '0'); });
			let str = '#' + rs + gs + bs;
			str = str.toUpperCase();
			this.light_color_dict[str] = '';
		}
		for (let color in this.light_color_dict) {
			let lightstr = ColorUtils.adjust_brightness(color, 4.0);
			let darkstr = color; // = this.adjust_color(color, 0.25);
			//			console.log(str);
			//			console.log('Old RGB = ' + color + ', new = ' + str);
			delete this.light_color_dict[color];
			this.light_color_dict[darkstr] = lightstr;
		}

	}

	public static get_light_color_version(color: string): string {
		return this.light_color_dict[color];
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
//		    console.log("process_formulas: formulas[" + i + "] = " + JSON.stringify(row));
			for (let j = 0; j < row.length; j++) {
			    if ((row[j].length > 0) && (row[j][0] === '=')) {
				let cell = row[j];
				
				
//				console.log("process_formulas: i = " + i + ", j = " + j);
//				console.log("process_formulas: origin_col, row = " + origin_col + ", " + origin_row);
//				    console.log("process_formulas: row = " + JSON.stringify(cell));
				let vec = ExcelUtils.dependencies(cell, j + origin_col + 1, i + origin_row + 1);
				if (vec.join(',') === '0,0') {
				    // No dependencies! Use a distinguished "0" value (always the same color?).
				    output.push([[j + origin_col + 1, i + origin_row + 1], "0"]);
				} else {
//				    console.log("process_formulas: vector = " + JSON.stringify(vec));
				    let hash = this.hash_vector(vec);
//				    console.log("process_formulas: hash of this vector = " + hash);
				    output.push([[j + origin_col + 1, i + origin_row + 1], hash.toString()]);
				}
				}
			}
		}
		return output;
	}

	public static color_all_data(formulas: Array<Array<string>>, processed_formulas: Array<[[number, number], string]>, origin_col: number, origin_row: number) {
	    //console.log('color_all_data');
	    console.log("formula length = " + formulas.length);
	    console.log("processed formulas length = " + processed_formulas.length);
	    let refs = this.generate_all_references(formulas, origin_col, origin_row);
	    console.log("generated all references: length = " + Object.keys(refs).length);
	    {
		// Compute full length of refs.
		let l = 0;
		for (let k of Object.keys(refs)) {
		    l += refs[k].length;
		}
		console.log("full length of references = " + l);
	    }
	    //console.log("color_all_data: refs = " + JSON.stringify(refs));
	    let data_color = {};
	    let processed_data = [];
	    
	    // Generate all formula colors (as a dict).
	    let formula_hash = {};
	    for (let f of processed_formulas) {
		let formula_vec = f[0];
		formula_hash[formula_vec.join(',')] = f[1];
	    }
//	    console.log("color_all_data: formula_hash = " + JSON.stringify(formula_hash));

	    let counter = 0;
		// Color all references based on the color of their referring formula.
	    for (let refvec of Object.keys(refs)) {
//		console.log("color_all_data: refvec = " + refvec);
		for (let r of refs[refvec]) {
		    counter += 1;
		    if (counter % 1000 == 0) {
			console.log("count = " + counter);
		    }
//		    console.log("color_all_data: r = " + r);
		    let r1 = [r[0] + 1, r[1] + 1];
//		    console.log("color_all_data: r1 = " + r1);
		    let hash = formula_hash[r1.join(',')];
		    if (!(hash === undefined)) {
			let rv = JSON.parse('[' + refvec + ']');
			let row = parseInt(rv[0], 10);
			let col = parseInt(rv[1], 10);
//			console.log("color_all_data: row = " + (row) + ", col = " + (col));
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
//	    console.log("color_all_data: processed_data = " + JSON.stringify(processed_data));
	    return processed_data;
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
		let id = this.identify_ranges(list, columnsort);
		let gr = this.group_ranges(id, true); // column-first
		// Now try to merge stuff with the same hash.
		let newGr1 = JSON.parse(JSON.stringify(gr)); // deep copy
		//        let newGr2 = JSON.parse(JSON.stringify(gr)); // deep copy
		//        console.log('group');
		//        console.log(JSON.stringify(newGr1));
		let mg = this.merge_groups(newGr1);
		//        let mr = this.mergeable(newGr1);
		//        console.log('mergeable');
		//       console.log(JSON.stringify(mr));
		//       let mg = this.merge_groups(newGr2, mr);
		//        console.log('new merge groups');
		//        console.log(JSON.stringify(mg));
		//this.generate_proposed_fixes(mg);
		return mg;
	}

	public static entropy(p: number): number {
		return -p * Math.log2(p);
	}

	public static entropydiff(oldcount1, oldcount2) {
		const prevEntropy = this.entropy(oldcount1) + this.entropy(oldcount2);
		const newEntropy = this.entropy(oldcount1 + oldcount2);
		return newEntropy - prevEntropy;
	}

    public static fix_metric(target_norm: number,
			     target: [[number, number], [number, number]],
			     merge_with_norm: number,
			     merge_with: [[number, number], [number, number]]): number
    {
	
	let n_target = RectangleUtils.area(target);
 	let n_merge_with = RectangleUtils.area(merge_with);
	let n_min = Math.min(n_target, n_merge_with);
	let n_max = Math.max(n_target, n_merge_with);
	let norm_min = Math.min(merge_with_norm, target_norm);
 	let norm_max = Math.max(merge_with_norm, target_norm);
	let fix_distance = Math.abs(norm_max - norm_min) / this.Multiplier;
	let entropy_drop = this.entropydiff(n_min, n_max); // this.entropy(n_min / (n_min + n_max));
	let ranking = entropy_drop / (fix_distance * n_min);
	// Was this:
	//return ranking;
	//	return NORMALIZED ranking
	return ranking / Math.log2(n_min + n_max);
    }

    public static count_proposed_fixes(fixes: Array<[number, [[number, number], [number, number]], [[number, number], [number, number]]]>) : number
    {
	let count = 0;
	for (let k in fixes) {
//	    console.log("FIX FIX FIX fixes[k] = " + JSON.stringify(fixes[k][1]));
	    count += RectangleUtils.area(fixes[k][1]);
	    count += RectangleUtils.area(fixes[k][2]);
	}
	return count;
    }
    
    public static generate_proposed_fixes(groups: { [val: string]: Array<[[number, number], [number, number]]> }):
    Array<[number, [[number, number], [number, number]], [[number, number], [number, number]]]> {
	let proposed_fixes = [];
	let already_proposed_pair = {};
	
	for (let k1 of Object.keys(groups)) {
	    // Look for possible fixes in OTHER groups.
	    for (let i = 0; i < groups[k1].length; i++) {
		let r1 = groups[k1][i];
		let sr1 = JSON.stringify(r1);
		for (let k2 of Object.keys(groups)) {
		    if (k1 === k2) {
			continue;
		    }
		    for (let j = 0; j < groups[k2].length; j++) {
			let r2 = groups[k2][j];
			let sr2 = JSON.stringify(r2);
			// Only add these if we have not already added them.
			if (!(sr1 + sr2 in already_proposed_pair) && !(sr2 + sr1 in already_proposed_pair)) {
			    // If both are compatible rectangles AND the regions include more than two cells, propose them as fixes.
			    if (RectangleUtils.is_mergeable(r1, r2) && (RectangleUtils.area(r1) + RectangleUtils.area(r2) > 2)) {
				already_proposed_pair[sr1 + sr2] = true;
				already_proposed_pair[sr2 + sr1] = true;
				///								console.log("generate_proposed_fixes: could merge (" + k1 + ") " + JSON.stringify(groups[k1][i]) + " and (" + k2 + ") " + JSON.stringify(groups[k2][j]));
				let metric = this.fix_metric(parseFloat(k1), r1, parseFloat(k2), r2);
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
	proposed_fixes.sort((a, b) => { return a[0] - b[0]; });
	
	return proposed_fixes;
    }

	public static merge_groups(groups: { [val: string]: Array<[[number, number], [number, number]]> })
		: { [val: string]: Array<[[number, number], [number, number]]> } {
		for (let k of Object.keys(groups)) {
			groups[k] = this.merge_individual_groups(JSON.parse(JSON.stringify(groups[k])));
		}
		return groups;
	}

	public static merge_individual_groups(group: Array<[[number, number], [number, number]]>)
		: Array<[[number, number], [number, number]]> {
		let numIterations = 0;
		group = group.sort();
		//        console.log(JSON.stringify(group));
		while (true) {
			// console.log("iteration "+numIterations);
			let merged_one = false;
			let deleted_rectangles = {};
			let updated_rectangles = [];
			let working_group = JSON.parse(JSON.stringify(group));
			while (working_group.length > 0) {
				let head = working_group.shift();
				for (let i = 0; i < working_group.length; i++) {
					//                    console.log("comparing " + head + " and " + working_group[i]);
					if (RectangleUtils.is_mergeable(head, working_group[i])) {
						//console.log("friendly!" + head + " -- " + working_group[i]);
						updated_rectangles.push(RectangleUtils.bounding_box(head, working_group[i]));
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
			// console.log('updated rectangles = ' + JSON.stringify(updated_rectangles));
			//            console.log('group = ' + JSON.stringify(group));
			if (!merged_one) {
				// console.log('updated rectangles = ' + JSON.stringify(updated_rectangles));
				return updated_rectangles;
			}
			group = JSON.parse(JSON.stringify(updated_rectangles));
			numIterations++;
			if (numIterations > 20) {
				return [[[-1, -1], [-1, -1]]];
			}
		}
	}

	public static generate_all_references(formulas: Array<Array<string>>, origin_col: number, origin_row: number): { [dep: string]: Array<[number, number]> } {
		// Generate all references.
		let refs = {};
		for (let i = 0; i < formulas.length; i++) {
			let row = formulas[i];
		    for (let j = 0; j < row.length; j++) {
			    // console.log('origin_col = '+origin_col+', origin_row = ' + origin_row);
			    if (row[j][0] === '=') {
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
		}
		return refs;
	}


    public static hash_vector(vec: Array<number>): number {
	let baseX = 7;
	let baseY = 3;
	let v0 = vec[0] - baseX;
	v0 = v0 * v0;
	let v1 = vec[1] - baseY;
	v1 = v1 * v1;
	return this.Multiplier * Math.sqrt(v0 + v1);
	// Return a hash of the given vector.
//	let h = Math.sqrt(vec.map(v => { return v * v; }).reduce((a, b) => { return a + b; }));
		//	console.log("hash of " + JSON.stringify(vec) + " = " + h);
//		return h;
		//        let h = this.hash(JSON.stringify(vec) + 'NONCE01');
		//        return h;
	}


}

//console.log(this.dependencies('$C$2:$E$5', 10, 10));
//console.log(this.dependencies('$A$123,A1:B$12,$A12:$B$14', 10, 10));
//console.log(this.hash_vector(this.dependencies('$C$2:$E$5', 10, 10)));
