export class Colorize {

    // Matchers for all kinds of Excel expressions.
    private static general_re = '\\$?[A-Z]+\\$?\\d+'; // column and row number, optionally with $
    private static sheet_re = '[^\\!]+';
    private static sheet_plus_cell = new RegExp('('+Colorize.sheet_re+')\\!('+Colorize.general_re+')');
    private static sheet_plus_range = new RegExp('('+Colorize.sheet_re+')\\!('+Colorize.general_re+'):('+Colorize.general_re+')');
    private static single_dep = new RegExp('('+Colorize.general_re+')');
    private static range_pair = new RegExp('('+Colorize.general_re+'):('+Colorize.general_re+')', 'g');
    private static cell_both_relative = new RegExp('[^\\$]?([A-Z]+)(\\d+)');
    private static cell_col_absolute = new RegExp('\\$([A-Z]+)[^\\$\\d]?(\\d+)');
    private static cell_row_absolute = new RegExp('[^\\$]?([A-Z]+)\\$(\\d+)');
    private static cell_both_absolute = new RegExp('\\$([A-Z]+)\\$(\\d+)');

    private static color_list = ["pink", "blue", "seagreen", "green", "darkturquoise", "darkgray", "darksalmon", "mediumvioletred" ];
    private static light_color_list = ["LightPink", "LightBlue", "LightYellow", "LightGreen", "LightSkyBlue", "LightGray", "LightSalmon", "PaleVioletRed" ];
    private static light_color_dict = { "pink" : "LightPink",
					"blue" : "LightBlue",
					"seagreen" : "LightSeaGreen",
					"green" : "LightGreen",
					"darkturquoise" : "PaleTurquoise",
					"darkgray" : "LightGray",
					"darksalmon" : "LightSalmon",
				        "mediumvioletred" : "PaleVioletRed" };
    
    public static get_color(hashval: number) : string {
	return Colorize.color_list[hashval % Colorize.color_list.length];
    }

    public static get_light_color_version(color: string) : string {
	return Colorize.light_color_dict[color];
//	return Colorize.light_color_list[hashval % Colorize.color_list.length];
    }

/*
    private static transpose(array) {
	array[0].map((col, i) => array.map(row => row[i]));
    }
*/
    
    public static process_formulas(formulas: Array<Array<string>>, origin_col : number, origin_row : number) : Array<[[number, number], string]> {
	let output : Array<[[number, number], string]> = [];
	// Build up all of the columns of colors.
	for (let i = 0; i < formulas.length; i++) {
	    let row = formulas[i];
	    for (let j = 0; j < row.length; j++) {
		//	console.log("checking "+row[j]);
		//	console.log("char 0 = " + row[j][0]);
		if ((row[j].length > 0) && (row[j][0] === "=")) {
//		    console.log("FOUND ONE formulas["+i+","+j+"] = " + row[j]);
		    let vec = Colorize.dependencies(row[j], j + origin_col, i + origin_row);
		    //console.log(vec);
		    let hash =Colorize.hash_vector(vec);
		    //console.log(hash);
		    let color = Colorize.get_color(hash);
		    //console.log(color);
		    //		    let dict = { "format" : { "fill" : { "color" : color } } };
//		    let cell = Colorize.column_index_to_name(j + origin_col + 1)+(i + origin_row + 1);
		    //		    output.push([i, j, color]);
		    output.push([[j + origin_col + 1, i + origin_row + 1], color]);
		}
	    }
	}
	
	return output;
    }

      
    public static process_data(data: Array<Array<string>>, processed_formulas: Array<[[number, number], string]>, origin_col : number, origin_row : number) : Array<[[number, number], string]> {
	// Take the processed formulas and convert them into a dict (colors).
	let output : Array<[[number, number], string]> = [];
	let colors = {};
	for (let t of processed_formulas) {
	    let [vec, color] = t;
	    colors[JSON.stringify(vec)] = color;
	}
	// Now generate references for the data.
	// For now, this is all just for timing.
	for (let i = 0; i < data.length; i++) {
	    let row = data[i];
	    for (let j = 0; j < row.length; j++) {
		// We need to process references to this data.
		// Instead, we will just color everything one color: yellow.
		output.push([[j + origin_col + 1, i + origin_row + 1], "yellow"]);
	    }
	}
	
	return output;
    }


    private static hash(str: string) : number {
	// From https://github.com/darkskyapp/string-hash
	var hash = 5381,
	i = str.length;
	
	while(i) {
	    hash = (hash * 33) ^ str.charCodeAt(--i);
	}

	/* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
	 * integers. Since we want the results to be always positive, convert the
	 * signed int to an unsigned by doing an unsigned bitshift. */
	return hash >>> 0;
    }
    
    private static rgbFromHSV(h,s,v) : Array<number> {
	// From https://gist.github.com/mjackson/5311256#gistcomment-2789005
	/**
	 * I: An array of three elements hue (h) ∈ [0, 360], and saturation (s) and value (v) which are ∈ [0, 1]
	 * O: An array of red (r), green (g), blue (b), all ∈ [0, 255]
	 * Derived from https://en.wikipedia.org/wiki/HSL_and_HSV
	 * This stackexchange was the clearest derivation I found to reimplement https://cs.stackexchange.com/questions/64549/convert-hsv-to-rgb-colors
	 */

	let hprime = h / 60;
	const c = v * s;
	const x = c * (1 - Math.abs(hprime % 2 - 1)); 
	const m = v - c;
	let r, g, b;
	if (!hprime) {r = 0; g = 0; b = 0; }
	if (hprime >= 0 && hprime < 1) { r = c; g = x; b = 0}
	if (hprime >= 1 && hprime < 2) { r = x; g = c; b = 0}
	if (hprime >= 2 && hprime < 3) { r = 0; g = c; b = x}
	if (hprime >= 3 && hprime < 4) { r = 0; g = x; b = c}
	if (hprime >= 4 && hprime < 5) { r = x; g = 0; b = c}
	if (hprime >= 5 && hprime < 6) { r = c; g = 0; b = x}
	
	r = Math.round( (r + m)* 255);
	g = Math.round( (g + m)* 255);
	b = Math.round( (b + m)* 255);

	return [r, g, b]
    }
    
    
    // Convert an Excel column name (a string of alphabetical charcaters) into a number.
    public static column_name_to_index(name: string) : number {
	if (name.length === 1) { // optimizing for the overwhelmingly common case
	    return name[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
	}
	let value = 0;
	let reversed_name = name.split("").reverse();
	for (let i of reversed_name) {
	    value *= 26;
	    value = (i.charCodeAt(0) - 'A'.charCodeAt(0)) + 1;
	}
	return value;
    }

    public static column_index_to_name(index: number) : string {
	let str = "";
	while (index > 0) {
	    str += String.fromCharCode((index - 1) % 26 + 65); // 65 = 'A'
	    index = Math.floor(index / 26);
	}
	return str.split("").reverse().join("");
    }

// Take in a list of [[row, col], color] pairs and group them,
// sorting them by columns.

    public static identify_ranges<T>(list : Array<[T, string]>, sortfn? : (n1: T, n2: T) => number ) : { [val : string] : Array<T> }
    {
	let groups = {};
	for (let r of list) {
	    groups[r[1]] = groups[r[1]] || [];
	    groups[r[1]].push(r[0]);
	}
	for (let k of Object.keys(groups)) {
	    //	console.log(k);
	    groups[k].sort(sortfn);
	    //	console.log(groups[k]);
	}
	return groups;
    }

    public static group_ranges<T>(groups : { [val : string] : Array<T> }) : { [val : string] : Array<Array<T>> }
    {
	let output = {};
	for (let k of Object.keys(groups)) {
	    output[k] = [];
	    let prev = groups[k].shift();
	    let last = prev;
	    for (let v of groups[k]) {
		if ((v[0] === last[0]) && (v[1] === last[1] + 1)) { // same column, adjacent row
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
    

    // Returns a vector (x, y) corresponding to the column and row of the computed dependency.
    public static cell_dependency(cell: string, origin_col: number, origin_row: number) : [number, number] {
	{
	    let r = Colorize.cell_col_absolute.exec(cell);
	    if (r) {
		//	    console.log(JSON.stringify(r));
		let col = Colorize.column_name_to_index(r[1]);
		let row = parseInt(r[2]);
		//	    console.log("absolute col: " + col + ", row: " + row);
		return [col, row - origin_row];
	    }
	}

	{
	    let r = Colorize.cell_both_relative.exec(cell);
	    if (r) {
		//	    console.log("both_relative");
		let col = Colorize.column_name_to_index(r[1]);
		let row = parseInt(r[2]);
		return [col - origin_col, row - origin_row];
	    }
	}

	{
	    let r = Colorize.cell_row_absolute.exec(cell);
	    if (r) {
		//	    console.log("row_absolute");
		let col = Colorize.column_name_to_index(r[1]);
		let row = parseInt(r[2]);
		return [col - origin_col, row];
	    }
	}

	{
	    let r = Colorize.cell_both_absolute.exec(cell);
	    if (r) {
		//	    console.log("both_absolute");
		let col = Colorize.column_name_to_index(r[1]);
		let row = parseInt(r[2]);
		return [col, row];
	    }
	}
	
	throw new Error('We should never get here.');
	return [0, 0];
    }


    public static all_cell_dependencies(range: string) /* , origin_col: number, origin_row: number) */ : Array<[number, number]> {
	
	let found_pair = null;
	let all_vectors : Array<[number, number]> = [];
	
	/// FIX ME - should we count the same range multiple times? Or just once?
	
	// First, get all the range pairs out.
	while (found_pair = Colorize.range_pair.exec(range)) {
	    if (found_pair) {
//		console.log("all_cell_dependencies --> " + found_pair);
		let first_cell = found_pair[1];
//		console.log(" first_cell = " + first_cell);
		let first_vec = Colorize.cell_dependency(first_cell, 0, 0);
//		console.log(" first_vec = " + JSON.stringify(first_vec));
		let last_cell = found_pair[2];
//		console.log(" last_cell = " + last_cell);
		let last_vec = Colorize.cell_dependency(last_cell, 0, 0);
//		console.log(" last_vec = " + JSON.stringify(last_vec));

		// First_vec is the upper-left hand side of a rectangle.
		// Last_vec is the lower-right hand side of a rectangle.

		// Generate all vectors.
		let length = last_vec[0] - first_vec[0] + 1;
		let width = last_vec[1] - first_vec[1] + 1;
		for (let x = 0; x < length; x++) {
		    for (let y = 0; y < width; y++) {
			// console.log(" pushing " + (x + first_vec[0]) + ", " + (y + first_vec[1]));
			// console.log(" (x = " + x + ", y = " + y);
			all_vectors.push([x + first_vec[0], y + first_vec[1]]);
		    }
		}
		
		// Wipe out the matched contents of range.
		let newRange = range.replace(found_pair[0], '_'.repeat(found_pair[0].length));
		range = newRange;
	    }
	}

	// Now look for singletons.
	let singleton = null;
	while (singleton = Colorize.single_dep.exec(range)) {
	    if (singleton) {
//		console.log("SINGLETON");
//		console.log("singleton[1] = " + singleton[1]);
		//	    console.log(found_pair);
		let first_cell = singleton[1];
//		console.log(first_cell);
		let vec = Colorize.cell_dependency(first_cell, 0, 0);
		all_vectors.push(vec);
		// Wipe out the matched contents of range.
		let newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
		range = newRange;
	    }
	}

	return all_vectors;

    }
    
    public static dependencies(range: string, origin_col: number, origin_row: number) : Array<number> {

	let base_vector = [0, 0];
	
	let found_pair = null;

	/// FIX ME - should we count the same range multiple times? Or just once?
	
	// First, get all the range pairs out.
	while (found_pair = Colorize.range_pair.exec(range)) {
	    if (found_pair) {
		//	    console.log(found_pair);
		let first_cell = found_pair[1];
//		console.log(first_cell);
		let first_vec = Colorize.cell_dependency(first_cell, origin_col, origin_row);
		let last_cell = found_pair[2];
//		console.log(last_cell);
		let last_vec = Colorize.cell_dependency(last_cell, origin_col, origin_row);

		// First_vec is the upper-left hand side of a rectangle.
		// Last_vec is the lower-right hand side of a rectangle.
		// Compute the appropriate vectors to be added.

		// e.g., [3, 2] --> [5, 5] ==
		//          [3, 2], [3, 3], [3, 4], [3, 5]
		//          [4, 2], [4, 3], [4, 4], [4, 5]
		//          [5, 2], [5, 3], [5, 4], [5, 5]
		// 
		// vector to be added is [4 * (3 + 4 + 5), 3 * (2 + 3 + 4 + 5) ]
		//  = [48, 42]

		let sum_x = 0;
		let sum_y = 0;
		let width = last_vec[1] - first_vec[1] + 1;   // 4
		sum_x = width * ((last_vec[0]*(last_vec[0]+1))/2 - ((first_vec[0]-1)*((first_vec[0]-1)+1))/2);
		let length = last_vec[0] - first_vec[0] + 1;   // 3
		sum_y = length * ((last_vec[1]*(last_vec[1]+1))/2 - ((first_vec[1]-1)*((first_vec[1]-1)+1))/2);

		base_vector[0] += sum_x;
		base_vector[1] += sum_y;
		
		// Wipe out the matched contents of range.
		let newRange = range.replace(found_pair[0], '_'.repeat(found_pair[0].length));
		range = newRange;
	    }
	}

	// Now look for singletons.
	let singleton = null;
	while (singleton = Colorize.single_dep.exec(range)) {
	    if (singleton) {
		//	    console.log(found_pair);
		let first_cell = singleton[1];
//		console.log(first_cell);
		let vec = Colorize.cell_dependency(first_cell, origin_col, origin_row);
		base_vector[0] += vec[0];
		base_vector[1] += vec[1];
		// Wipe out the matched contents of range.
		let newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
		range = newRange;
	    }
	}

	return base_vector;

    }

    public static generate_all_references(formulas: Array<Array<string>>, origin_col : number, origin_row : number) : { [ dep: string ] : Array<[number, number]> } {
	// Generate all references.
	let refs = {};
	for (let i = 0; i < formulas.length; i++) {
	    let row = formulas[i];
	    for (let j = 0; j < row.length; j++) {
		// console.log("origin_col = "+origin_col+", origin_row = " + origin_row);
		let all_deps = Colorize.all_cell_dependencies(row[j]); // , origin_col + j, origin_row + i);
		if (all_deps.length > 0) {
		    // console.log(all_deps);
		    let src = [origin_col+j, origin_row+i];
		    // console.log("src = " + src);
		    for (let dep of all_deps) {
			let dep2 = dep; // [dep[0]+origin_col, dep[1]+origin_row];
			//				console.log("dep type = " + typeof(dep));
			//				console.log("dep = "+dep);
			refs[dep2.join(",")] = refs[dep2.join(",")] || [];
			refs[dep2.join(",")].push(src);
			// console.log("refs[" + dep2.join(",") + "] = " + JSON.stringify(refs[dep2.join(",")]));
		    }
		}
	    }
	}
	return refs;
    }
    
    
    public static extract_sheet_cell(str: string) : Array<string> {
	let matched = Colorize.sheet_plus_cell.exec(str);
	if (matched) {
	    return [matched[1], matched[2], matched[3]];
	}
	return ["", "", ""];
    }
    
    public static extract_sheet_range(str: string) : Array<string> {
	let matched = Colorize.sheet_plus_range.exec(str);
	if (matched) {
	    return [matched[1], matched[2], matched[3]];
	}
	return ["", "", ""];
    }
    
    public static hash_vector(vec: Array<number>) : number {
	return Colorize.hash(JSON.stringify(vec));
    }
    

}

//console.log(Colorize.dependencies('$C$2:$E$5', 10, 10));
//console.log(Colorize.dependencies('$A$123,A1:B$12,$A12:$B$14', 10, 10));
//console.log(Colorize.hash_vector(Colorize.dependencies('$C$2:$E$5', 10, 10)));
