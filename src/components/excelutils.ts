// excel-utils

import * as sjcl from 'sjcl';
import { RectangleUtils } from './rectangleutils.js';

export class ExcelUtils {
    // Matchers for all kinds of Excel expressions.
    private static general_re = '\\$?[A-Z][A-Z]?\\$?\\d+' ; // column and row number, optionally with $
    private static sheet_re = '[^\\!]+';
    private static sheet_plus_cell = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + ')');
    private static sheet_plus_range = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')');
    private static single_dep = new RegExp('(' + ExcelUtils.general_re + ')');
    private static range_pair = new RegExp('(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')', 'g');
    private static cell_both_relative = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)(\\d+)');
    private static cell_col_absolute = new RegExp('\\$([A-Z][A-Z]?)[^\\$\\d]?(\\d+)');
    private static cell_row_absolute = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)\\$(\\d+)');
    private static cell_both_absolute = new RegExp('\\$([A-Z][A-Z]?)\\$(\\d+)');

    // We need to filter out all formulas with numbers so they don't mess with our dependency regexps.
    private static formulas_with_numbers = new RegExp('/ATAN2|BIN2DEC|BIN2HEX|BIN2OCT|DAYS360|DEC2BIN|DEC2HEX|DEC2OCT|HEX2BIN|HEX2DEC|HEX2OCT|IMLOG2|IMLOG10|LOG10|OCT2BIN|OCT2DEC|OCT2HEX|SUNX2MY2|SUMX2PY2|SUMXMY2|T.DIST.2T|T.INV.2T/', 'g');
    // Same with sheet name references.
    private static formulas_with_quoted_sheetnames = new RegExp("'[^\']*'\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    private static formulas_with_unquoted_sheetnames = new RegExp("[A-Za-z0-9]+\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    
    // Convert the UID string into a hashed version using SHA256, truncated to a max length.
    public static hash_sheet(uid: string, maxlen: number = 31) : string {
	// We can't just use the UID because it is too long to be a sheet name in Excel (limit is 31 characters).
	return (sjcl.codec.base32.fromBits(sjcl.hash.sha256.hash(uid)).slice(0,maxlen));
    }
    

    public static get_rectangle(proposed_fixes: any, current_fix: number) : any {
	if (!proposed_fixes) {
	    return null;
	}
	if (proposed_fixes.length > 0) {
	    // console.log("proposed_fixes = " + JSON.stringify(proposed_fixes));
	    // console.log("current fix = " + current_fix);
	    let r = RectangleUtils.bounding_box(proposed_fixes[current_fix][1], proposed_fixes[current_fix][2]);
	    // console.log("r = " + JSON.stringify(r));
	    // convert to sheet notation
	    let col0 = ExcelUtils.column_index_to_name(r[0][0]);
	    let row0 = r[0][1].toString();
	    let col1 = ExcelUtils.column_index_to_name(r[1][0]);
	    let row1 = r[1][1].toString();
	    return [col0, row0, col1, row1];
	} else {
	    return null;
	}
    }

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
            index = Math.floor((index - 1) / 26);
        }
        return str.split('').reverse().join('');
    }

    // Returns a vector (x, y) corresponding to the column and row of the computed dependency.
    public static cell_dependency(cell: string, origin_col: number, origin_row: number): [number, number] {
        {
            let r = ExcelUtils.cell_both_absolute.exec(cell);
            if (r) {
                //console.log('both_absolute');
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
		//console.log("parsed " + JSON.stringify([col, row]));
                return [col, row];
            }
	}
	
        {
            let r = ExcelUtils.cell_col_absolute.exec(cell);
            if (r) {
                //console.log("cell col absolute only " + JSON.stringify(r));
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
                //	    console.log('absolute col: ' + col + ', row: ' + row);
                return [col, row - origin_row];
            }
        }

        {
            let r = ExcelUtils.cell_row_absolute.exec(cell);
            if (r) {
                //console.log('row_absolute');
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
                return [col - origin_col, row];
            }
        }

        {
            let r = ExcelUtils.cell_both_relative.exec(cell);
            if (r) {
                //console.log('both_relative: r[1] = ' + r[1] + ', r[2] = ' + r[2]);
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
//		console.log('both relative col: ' + col + ', row: ' + row);
                return [col - origin_col, row - origin_row];
            }
        }

	// console.log("cell is "+cell);
        throw new Error('We should never get here.');
        return [0, 0];
    }

    public static extract_sheet_cell(str: string): Array<string> {
//	console.log("extract_sheet_cell " + str);
        let matched = ExcelUtils.sheet_plus_cell.exec(str);
        if (matched) {
//	    console.log("extract_sheet_cell matched " + str);
	    // There is only one thing to match for this pattern: we convert it into a range.
            return [matched[1], matched[2], matched[2]];
        }
//	console.log("extract_sheet_cell failed for "+str);
        return ['', '', ''];
    }

    public static extract_sheet_range(str: string): Array<string> {
        let matched = ExcelUtils.sheet_plus_range.exec(str);
        if (matched) {
//	    console.log("extract_sheet_range matched " + str);
            return [matched[1], matched[2], matched[3]];
        }
//	console.log("extract_sheet_range failed to match " + str);
	return ExcelUtils.extract_sheet_cell(str);
    }

    private static all_cell_dependencies(range: string, origin_col: number, origin_row: number): Array<[number, number]> {

//	console.log("looking for dependencies in " + range);
        let found_pair = null;
        let all_vectors: Array<[number, number]> = [];

	if (typeof(range) !== 'string') {
	    return null;
	}

	range = range.replace(this.formulas_with_numbers,'_'); // kind of a hack for now
	range = range.replace(this.formulas_with_quoted_sheetnames,'_'); // kind of a hack for now
	range = range.replace(this.formulas_with_unquoted_sheetnames,'_');
	
        /// FIX ME - should we count the same range multiple times? Or just once?

        // First, get all the range pairs out.
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                //		console.log('all_cell_dependencies --> ' + found_pair);
                let first_cell = found_pair[1];
                //		console.log(' first_cell = ' + first_cell);
                let first_vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                //		console.log(' first_vec = ' + JSON.stringify(first_vec));
                let last_cell = found_pair[2];
                //		console.log(' last_cell = ' + last_cell);
                let last_vec = ExcelUtils.cell_dependency(last_cell, origin_col, origin_row);
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
                range = range.replace(found_pair[0], '_');
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
//                console.log(first_cell);
                let vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                all_vectors.push(vec);
                // Wipe out the matched contents of range.
                range = range.replace(singleton[0], '_');
            }
        }
        //console.log(JSON.stringify(all_vectors));
        return all_vectors;
    }

    public static baseVector() : Array<number> {
	return [0, 0];
    }
    
    public static dependencies(range: string, origin_col: number, origin_row: number): Array<number> {
	// Return an array of dependencies from the range string.
	// NOTE: we will count the same dependencies every time they appear.
	
        let base_vector = ExcelUtils.baseVector();

        let found_pair = null;

	// Get rid of any formulas with numbers (e.g., ATAN2) to avoid confusion.
	range = range.replace(this.formulas_with_numbers,'_');

	// Get rid of formulas with sheetnames, since we (for now) ignore references across sheets.
	range = range.replace(this.formulas_with_unquoted_sheetnames,'_');
	range = range.replace(this.formulas_with_quoted_sheetnames,'_');

        // First, get all the range pairs out.
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
		// Get the upper-left hand and lower-right hand sides of the rectangle formed by the range.

                // First_vec is the upper-left hand side of a rectangle.
                // Last_vec is the lower-right hand side of a rectangle.
                let first_cell = found_pair[1];
                let first_vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                let last_cell = found_pair[2];
                let last_vec = ExcelUtils.cell_dependency(last_cell, origin_col, origin_row);
		
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
                range = range.replace(found_pair[0], '_');
            }
        }

        // Now look for singletons.
        let singleton = null;
        while (singleton = ExcelUtils.single_dep.exec(range)) {
            if (singleton) {
                let first_cell = singleton[1];
                let vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                base_vector[0] += vec[0];
                base_vector[1] += vec[1];
                // Wipe out the matched contents of range.
                range = range.replace(singleton[0], '_');
            }
        }

        return base_vector;

    }
    
    public static all_dependencies(row: number, col: number, origin_row: number, origin_col: number, formulas: Array<Array<string>>) : Array<[number, number]> {
	let deps = [];
	// Discard references to cells outside the formula range.
	if ((row >= formulas.length)
	    || (col >= formulas[0].length)
	    || (row < 0)
	    || (col < 0))
	{
	    return [];
	}
	// Check if this cell is a formula.
	const cell = formulas[row][col];
	if ((cell.length > 1) && (cell[0] === "=")) {
	    // It is. Compute the dependencies.
	    deps = ExcelUtils.all_cell_dependencies(cell, origin_col, origin_row);
	}
	return deps;
    }
    

    public static generate_all_references(formulas: Array<Array<string>>, origin_col: number, origin_row: number): { [dep: string]: Array<[number, number]> } {
	let refs = {};
	let counter = 0;
//	let all_deps = {};
//	console.log(JSON.stringify(formulas));
	for (let i = 0; i < formulas.length; i++) {
	    let row = formulas[i];
	    for (let j = 0; j < row.length; j++) {
		let cell = row[j];
		counter++;
		if (counter % 1000 == 0) {
		    console.log(counter + " references down");
		}

		// console.log('origin_col = '+origin_col+', origin_row = ' + origin_row);
		if (cell[0] === '=') { // It's a formula.
//		    let direct_refs = ExcelUtils.all_cell_dependencies(cell, origin_col + j, origin_row + i);
		    let direct_refs = ExcelUtils.all_cell_dependencies(cell, 0, 0); // origin_col, origin_row);
//		    console.log("direct refs for " + i + ", " + j + " [origin_row=" + origin_row + ", origin_col=" + origin_col + "] (" + cell +") = " + JSON.stringify(direct_refs));
//		    let transitive_deps = ExcelUtils.transitive_closure(i, j, origin_row, origin_col, formulas, all_deps);
//		    console.log("TRANSITIVE CLOSURE FOR " + i + ", " + j + " = " + JSON.stringify(transitive_deps));
//		    all_deps[index] = transitive_deps; //
		    for (let dep of direct_refs) { // direct_refs) {
			let key = dep.join(',');
			refs[key] = true; // refs[key] || [];
			// NOTE: we are disabling pushing the src onto the list because we don't need it.
			// refs[dep2.join(',')].push(src);
		    }
		}
	    }
	}
    	return refs;
    }

}
