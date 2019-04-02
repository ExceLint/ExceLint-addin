// excel-utils

export class ExcelUtils {
	// Matchers for all kinds of Excel expressions.
	private static general_re = '\\$?[A-Z]+\\$?\\d+'; // column and row number, optionally with $
	private static sheet_re = '[^\\!]+';
	private static sheet_plus_cell = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + ')');
	private static sheet_plus_range = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')');
	private static single_dep = new RegExp('(' + ExcelUtils.general_re + ')');
	private static range_pair = new RegExp('(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')', 'g');
	private static cell_both_relative = new RegExp('[^\\$A-Z]?([A-Z]+)(\\d+)');
	private static cell_col_absolute = new RegExp('\\$([A-Z]+)[^\\$\\d]?(\\d+)');
	private static cell_row_absolute = new RegExp('[^\\$A-Z]?([A-Z]+)\\$(\\d+)');
	private static cell_both_absolute = new RegExp('\\$([A-Z]+)\\$(\\d+)');

	// Convert an Excel column name (a string of alphabetical charcaters) into a number.
    public static column_name_to_index(name: string): number {
		if (name.length === 1) { // optimizing for the overwhelmingly common case
			return name[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1;
		}
		let value = 0;
	let split_name = name.split('');
	for (let i of split_name) {
	    value *= 26;
	    value += (i.charCodeAt(0) - 'A'.charCodeAt(0)) + 1;
	}
		return value;
	}

	// Convert a column number to a name (as in, 3 => 'C').
	public static column_index_to_name(index: number): string {
		let str = '';
		while (index > 0) {
			str += String.fromCharCode((index - 1) % 26 + 65); // 65 = 'A'
			index = Math.floor(index / 26);
		}
		return str.split('').reverse().join('');
	}

	// Returns a vector (x, y) corresponding to the column and row of the computed dependency.
    public static cell_dependency(cell: string, origin_col: number, origin_row: number): [number, number] {
		{
			let r = ExcelUtils.cell_col_absolute.exec(cell);
			if (r) {
				//	    console.log(JSON.stringify(r));
				let col = ExcelUtils.column_name_to_index(r[1]);
				let row = parseInt(r[2], 10);
			    //	    console.log('absolute col: ' + col + ', row: ' + row);
				return [col, row - origin_row];
			}
		}

		{
			let r = ExcelUtils.cell_both_relative.exec(cell);
		    if (r) {
//			console.log("r = " + JSON.stringify(r));
//			    	    console.log('both_relative: r[1] = ' + r[1]);
				let col = ExcelUtils.column_name_to_index(r[1]);
				let row = parseInt(r[2], 10);
//			    	    console.log('both relative col: ' + col + ', row: ' + row);
				return [col - origin_col, row - origin_row];
			}
		}

		{
			let r = ExcelUtils.cell_row_absolute.exec(cell);
			if (r) {
				//	    console.log('row_absolute');
				let col = ExcelUtils.column_name_to_index(r[1]);
				let row = parseInt(r[2], 10);
				return [col - origin_col, row];
			}
		}

		{
			let r = ExcelUtils.cell_both_absolute.exec(cell);
			if (r) {
				//	    console.log('both_absolute');
				let col = ExcelUtils.column_name_to_index(r[1]);
				let row = parseInt(r[2], 10);
				return [col, row];
			}
		}

		throw new Error('We should never get here.');
		return [0, 0];
	}

	public static extract_sheet_cell(str: string): Array<string> {
		let matched = ExcelUtils.sheet_plus_cell.exec(str);
		if (matched) {
			return [matched[1], matched[2], matched[3]];
		}
		return ['', '', ''];
	}

	public static extract_sheet_range(str: string): Array<string> {
		let matched = ExcelUtils.sheet_plus_range.exec(str);
		if (matched) {
			return [matched[1], matched[2], matched[3]];
		}
		return ['', '', ''];
	}

	public static all_cell_dependencies(range: string) /* , origin_col: number, origin_row: number) */: Array<[number, number]> {

		let found_pair = null;
		let all_vectors: Array<[number, number]> = [];

		/// FIX ME - should we count the same range multiple times? Or just once?

		// First, get all the range pairs out.
		while (found_pair = ExcelUtils.range_pair.exec(range)) {
			if (found_pair) {
				//		console.log('all_cell_dependencies --> ' + found_pair);
				let first_cell = found_pair[1];
				//		console.log(' first_cell = ' + first_cell);
				let first_vec = ExcelUtils.cell_dependency(first_cell, 0, 0);
				//		console.log(' first_vec = ' + JSON.stringify(first_vec));
				let last_cell = found_pair[2];
				//		console.log(' last_cell = ' + last_cell);
				let last_vec = ExcelUtils.cell_dependency(last_cell, 0, 0);
				//		console.log(' last_vec = ' + JSON.stringify(last_vec));

				// First_vec is the upper-left hand side of a rectangle.
				// Last_vec is the lower-right hand side of a rectangle.

				// Generate all vectors.
				let length = last_vec[0] - first_vec[0] + 1;
				let width = last_vec[1] - first_vec[1] + 1;
				for (let x = 0; x < length; x++) {
					for (let y = 0; y < width; y++) {
						// console.log(' pushing ' + (x + first_vec[0]) + ', ' + (y + first_vec[1]));
						// console.log(' (x = ' + x + ', y = ' + y);
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
		while (singleton = ExcelUtils.single_dep.exec(range)) {
			if (singleton) {
				//		console.log('SINGLETON');
				//		console.log('singleton[1] = ' + singleton[1]);
				//	    console.log(found_pair);
				let first_cell = singleton[1];
				//		console.log(first_cell);
				let vec = ExcelUtils.cell_dependency(first_cell, 0, 0);
				all_vectors.push(vec);
				// Wipe out the matched contents of range.
				let newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
				range = newRange;
			}
		}
		console.log(JSON.stringify(all_vectors));
		return all_vectors;

	}

	public static dependencies(range: string, origin_col: number, origin_row: number): Array<number> {

		let base_vector = [0, 0];

		let found_pair = null;

		/// FIX ME - should we count the same range multiple times? Or just once?

		// First, get all the range pairs out.
		while (found_pair = ExcelUtils.range_pair.exec(range)) {
			if (found_pair) {
				//	    console.log(found_pair);
				let first_cell = found_pair[1];
				//		console.log(first_cell);
				let first_vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
				let last_cell = found_pair[2];
				//		console.log(last_cell);
				let last_vec = ExcelUtils.cell_dependency(last_cell, origin_col, origin_row);

				// First_vec is the upper-left hand side of a rectangle.
				// Last_vec is the lower-right hand side of a rectangle.
				// Compute the appropriate vectors to be added.

				// e.g., [3, 2] --> [5, 5] ===
				//          [3, 2], [3, 3], [3, 4], [3, 5]
				//          [4, 2], [4, 3], [4, 4], [4, 5]
				//          [5, 2], [5, 3], [5, 4], [5, 5]
				//
				// vector to be added is [4 * (3 + 4 + 5), 3 * (2 + 3 + 4 + 5) ]
				//  = [48, 42]

				let sum_x = 0;
				let sum_y = 0;
				let width = last_vec[1] - first_vec[1] + 1;   // 4
				sum_x = width * ((last_vec[0] * (last_vec[0] + 1)) / 2 - ((first_vec[0] - 1) * ((first_vec[0] - 1) + 1)) / 2);
				let length = last_vec[0] - first_vec[0] + 1;   // 3
				sum_y = length * ((last_vec[1] * (last_vec[1] + 1)) / 2 - ((first_vec[1] - 1) * ((first_vec[1] - 1) + 1)) / 2);

				base_vector[0] += sum_x;
				base_vector[1] += sum_y;

				// Wipe out the matched contents of range.
				let newRange = range.replace(found_pair[0], '_'.repeat(found_pair[0].length));
				range = newRange;
			}
		}

		// Now look for singletons.
		let singleton = null;
		while (singleton = ExcelUtils.single_dep.exec(range)) {
			if (singleton) {
				//	    console.log(found_pair);
				let first_cell = singleton[1];
				//		console.log(first_cell);
				let vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
				base_vector[0] += vec[0];
				base_vector[1] += vec[1];
				// Wipe out the matched contents of range.
				let newRange = range.replace(singleton[0], '_'.repeat(singleton[0].length));
				range = newRange;
			}
		}

		return base_vector;

	}



}
