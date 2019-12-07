// excel-utils

import * as sjcl from 'sjcl';
import { RectangleUtils } from './rectangleutils';

export class ExcelUtils {
    // Matchers for all kinds of Excel expressions.
    private static general_re = '\\$?[A-Z][A-Z]?\\$?\\d+'; // column and row number, optionally with $
    private static sheet_re = '[^\\!]+';
    private static sheet_plus_cell = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + ')');
    private static sheet_plus_range = new RegExp('(' + ExcelUtils.sheet_re + ')\\!(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')');
    private static single_dep = new RegExp('(' + ExcelUtils.general_re + ')');
    private static range_pair = new RegExp('(' + ExcelUtils.general_re + '):(' + ExcelUtils.general_re + ')', 'g');
    private static number_dep = new RegExp('([0-9]+\.?[0-9]*)');
    private static cell_both_relative = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)(\\d+)');
    private static cell_col_absolute = new RegExp('\\$([A-Z][A-Z]?)[^\\$\\d]?(\\d+)');
    private static cell_row_absolute = new RegExp('[^\\$A-Z]?([A-Z][A-Z]?)\\$(\\d+)');
    private static cell_both_absolute = new RegExp('\\$([A-Z][A-Z]?)\\$(\\d+)');

    // We need to filter out all formulas with numbers so they don't mess with our dependency regexps.
    private static formulas_with_numbers = new RegExp('/ATAN2|BIN2DEC|BIN2HEX|BIN2OCT|DAYS360|DEC2BIN|DEC2HEX|DEC2OCT|HEX2BIN|HEX2DEC|HEX2OCT|IMLOG2|IMLOG10|LOG10|OCT2BIN|OCT2DEC|OCT2HEX|SUNX2MY2|SUMX2PY2|SUMXMY2|T.DIST.2T|T.INV.2T/', 'g');
    // Same with sheet name references.
    private static formulas_with_quoted_sheetnames = new RegExp("'[^\']*'\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    private static formulas_with_unquoted_sheetnames = new RegExp("[A-Za-z0-9]+\!" + '\\$?[A-Z][A-Z]?\\$?\\d+', 'g');
    private static originalSheetSuffix: string = '_EL';

    // Get the saved formats for this sheet (by its unique identifier).
    public static saved_original_sheetname(id: string): string {
        return this.hash_sheet(id, 28) + this.originalSheetSuffix;
    }


    // Convert the UID string into a hashed version using SHA256, truncated to a max length.
    public static hash_sheet(uid: string, maxlen: number = 31): string {
        // We can't just use the UID because it is too long to be a sheet name in Excel (limit is 31 characters).
        return (sjcl.codec.base32.fromBits(sjcl.hash.sha256.hash(uid)).slice(0, maxlen));
    }


    public static get_rectangle(proposed_fixes: any, current_fix: number): [string, string, string, string] {
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

    // Take a range string and compute the number of cells.
    public static get_number_of_cells(address: string): number {
        // Compute the number of cells in the range "usedRange".
        const usedRangeAddresses = ExcelUtils.extract_sheet_range(address);
        const upperLeftCorner = ExcelUtils.cell_dependency(usedRangeAddresses[1], 0, 0);
        const lowerRightCorner = ExcelUtils.cell_dependency(usedRangeAddresses[2], 0, 0);
        const numberOfCellsUsed = RectangleUtils.area([upperLeftCorner, lowerRightCorner]);
        return numberOfCellsUsed;
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
    public static cell_dependency(cell: string, origin_col: number, origin_row: number): [number, number, number] {
        //	console.log("cell_dependency: computing for " + cell + "(" + origin_col + ", " + origin_row + ")");
        //	if (origin_col + origin_row === 0) {
        //	    console.trace("WTF DUDE.");
        //	}
        const alwaysReturnAdjustedColRow = false;
        {
            let r = ExcelUtils.cell_both_absolute.exec(cell);
            if (r) {
                //console.log('both_absolute');
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
                //		console.log("parsed " + JSON.stringify([col, row]));
                if (alwaysReturnAdjustedColRow) {
                    return [col - origin_col, row - origin_row, 0];
                } else {
                    return [col, row, 0];
                }
            }
        }

        {
            let r = ExcelUtils.cell_col_absolute.exec(cell);
            if (r) {
                //console.log("cell col absolute only " + JSON.stringify(r));
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
                //	    console.log('absolute col: ' + col + ', row: ' + row);
                if (alwaysReturnAdjustedColRow) {
                    return [col, row, 0];
                } else {
                    return [col, row - origin_row, 0];
                }
            }
        }

        {
            let r = ExcelUtils.cell_row_absolute.exec(cell);
            if (r) {
                //console.log('row_absolute');
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
                if (alwaysReturnAdjustedColRow) {
                    return [col, row, 0];
                } else {
                    return [col - origin_col, row, 0];
                }
            }
        }

        {
            let r = ExcelUtils.cell_both_relative.exec(cell);
            if (r) {
                //console.log('both_relative: r[1] = ' + r[1] + ', r[2] = ' + r[2]);
                let col = ExcelUtils.column_name_to_index(r[1]);
                let row = Number(r[2]);
                //		console.log('both relative col: ' + col + ', row: ' + row);
                if (alwaysReturnAdjustedColRow) {
                    return [col, row, 0];
                } else {
                    return [col - origin_col, row - origin_row, 0];
                }
            }
        }

        console.log('cell is ' + cell + ', origin_col = ' + origin_col + ', origin_row = ' + origin_row);
        throw new Error('We should never get here.');
        return [0, 0, 0];
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

    public static make_range_string(theRange: Array<[number, number, number]>): string {
        const r = theRange;
        const col0 = r[0][0];
        const row0 = r[0][1];
        const col1 = r[1][0];
        const row1 = r[1][1];

        if ((col0 === 0) && (row0 === 0) && (r[0][2] !== 0)) {
            // Not a real dependency. Skip.
            console.log('NOT A REAL DEPENDENCY: ' + col1 + ',' + row1);
            return '';
        } else if ((col0 < 0) || (row0 < 0) || (col1 < 0) || (row1 < 0)) {
            // Defensive programming.
            console.log('WARNING: FOUND NEGATIVE VALUES.');
            return '';
        } else {

            const colname0 = ExcelUtils.column_index_to_name(col0);
            const colname1 = ExcelUtils.column_index_to_name(col1);
            //		    console.log("process: about to get range " + colname0 + row0 + ":" + colname1 + row1);
            const rangeStr = colname0 + row0 + ':' + colname1 + row1;
            return rangeStr;
        }
    }

    private static all_cell_dependencies(range: string, origin_col: number, origin_row: number): Array<[number, number, number]> {

        //	console.log("looking for dependencies in " + range);

        let found_pair = null;
        let all_vectors: Array<[number, number, number]> = [];

        if (typeof (range) !== 'string') {
            return null;
        }

        range = range.replace(this.formulas_with_numbers, '_'); // kind of a hack for now
        range = range.replace(this.formulas_with_quoted_sheetnames, '_'); // kind of a hack for now
        range = range.replace(this.formulas_with_unquoted_sheetnames, '_');

        /// FIX ME - should we count the same range multiple times? Or just once?

        // First, get all the range pairs out.
        while (found_pair = ExcelUtils.range_pair.exec(range)) {
            if (found_pair) {
                //                console.log("found_pair " + found_pair);
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
                        all_vectors.push([x + first_vec[0], y + first_vec[1], 0]);
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
                // console.log("first_cell = " + first_cell);
                let vec = ExcelUtils.cell_dependency(first_cell, origin_col, origin_row);
                all_vectors.push(vec);
                // Wipe out the matched contents of range.
                range = range.replace(singleton[0], '_');
            }
        }

        //	console.log("range is now " + range);

        // FIXME perhaps. For now, we are going to roll numbers in
        // formulas into the dependency vectors. Each number counts as "1".
        let number = null;
        while (number = ExcelUtils.number_dep.exec(range)) {
            //	    console.log("matched a number");
            if (number) {
                //                let n = parseFloat(number[1]);
                //		console.log("number = " + n);
                //		let q = Math.sqrt(n*n/2);
                all_vectors.push([0, 0, 1]); // just add 1 for every number
                // Wipe out the matched contents of range.
                range = range.replace(number[0], '_');
            }
        }

        //console.log(JSON.stringify(all_vectors));
        return all_vectors;
    }

    public static baseVector(): [number, number, number] {
        return [0, 0, 0];
    }

    /// Get all the numeric values out into an array of vectors (row, col,
    /*    public static all_numbers(origin_row: number, origin_col: number, values: Array<Array<string>>) : Array<[number, number,number]> {
        for (let i = 0; i < formulas.length; i++) {
    //	    console.log("now examining row " + i);
            let row = formulas[i];
            for (let j = 0; j < row.length; j++) {
    //		console.log("now examining column " + j);
            let cell = row[j];
        }
    */

    public static all_dependencies(row: number, col: number, origin_row: number, origin_col: number, formulas: Array<Array<string>>): Array<[number, number, number]> {
        let deps = [];
        // Discard references to cells outside the formula range.

        if ((row >= formulas.length)
            || (col >= formulas[0].length)
            || (row < 0)
            || (col < 0)) {
            return [];
        }

        // Check if this cell is a formula.
        const cell = formulas[row][col];
        //	console.log("cell[" + col + "][" + row + "] =" + cell);
        if ((cell.length > 1) && (cell[0] === '=')) {
            // It is. Compute the dependencies.
            //	    console.log("ALL CELL DEPENDENCIES");
            deps = ExcelUtils.all_cell_dependencies(cell, origin_col, origin_row);
        }
        return deps;
    }

    public static generate_all_references(formulas: Array<Array<string>>, origin_col: number, origin_row: number): { [dep: string]: Array<[number, number, number]> } {
        let refs = {};
        let counter = 0;
        //	let all_deps = {};
        //	console.log(JSON.stringify(formulas));
        for (let i = 0; i < formulas.length; i++) {
            //	    console.log("now examining row " + i);
            let row = formulas[i];
            for (let j = 0; j < row.length; j++) {
                //		console.log("now examining column " + j);
                let cell = row[j];
                counter++;
                if (counter % 1000 === 0) {
                    //		    console.log(counter + " references down");
                }

                //		console.log('origin_col = '+origin_col+', origin_row = ' + origin_row);
                if (cell[0] === '=') { // It's a formula.
                    //		    let direct_refs = ExcelUtils.all_cell_dependencies(cell, origin_col + j, origin_row + i);
                    let direct_refs = ExcelUtils.all_cell_dependencies(cell, 0, 0); // origin_col, origin_row); // was just 0,0....  origin_col, origin_row);
                    //		    console.log("cell = " + JSON.stringify(cell));
                    //		    console.log("direct_refs = " + JSON.stringify(direct_refs));
                    //		    console.log(JSON.stringify(formulas));
                    for (let dep of direct_refs) {
                        if ((dep[0] === 0) && (dep[1] === 0) && (dep[2] !== 0)) {
                            // Not a real reference. Skip.
                        } else {
                            // Check to see if this is data or a formula.
                            // If it's not a formula, add it.
                            let rowIndex = dep[0] - origin_col - 1;
                            let colIndex = dep[1] - origin_row - 1;
                            /*
                            console.log("cell = " + cell);
                            console.log("dep[0] = " + dep[0]);
                            console.log("dep[1] = " + dep[1]);
                            console.log("(# rows = " + formulas.length + ", # cols = " + row.length + ")");
                            console.log("origin_col = " + origin_col + ", origin_row = " + origin_row);
                            console.log("rowIndex = " + rowIndex);
                            console.log("colIndex = " + colIndex);  */
                            const outsideFormulaRange = ((colIndex >= formulas.length)
                                || (rowIndex >= formulas[0].length)
                                || (rowIndex < 0)
                                || (colIndex < 0));
                            if (true) {
                                let addReference = false;
                                if (outsideFormulaRange) {
                                    addReference = true;
                                } else {
                                    // Only include non-formulas (if they are in the range).
                                    const referentCell = formulas[colIndex][rowIndex];
                                    //				    console.log("referent cell = " + JSON.stringify(referentCell));
                                    if ((referentCell !== undefined) && (referentCell[0] !== '=')) {
                                        addReference = true;
                                    }
                                }
                                if (addReference) {
                                    let key = dep.join(',');
                                    //				    console.log("added reference to " + key);
                                    refs[key] = true;
                                }
                            }
                        }
                    }
                }
            }
        }
        return refs;
    }


}
