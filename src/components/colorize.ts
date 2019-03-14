export class Colorize {

    // Matchers for all kinds of Excel expressions.
    private static range_pair = new RegExp('(\\$?[A-Z]\\$?\\d+):(\\$?[A-Z]\\$?\\d+)', 'g');
    private static cell_both_relative = new RegExp('^[^\\$]?([A-Z]+)(\\d+)');
    private static cell_col_absolute = new RegExp('^\\$([A-Z]+)[^\\$]?(\\d+)');
    private static cell_row_absolute = new RegExp('^[^\\$]?([A-Z]+)\\$(\\d+)');
    private static cell_both_absolute = new RegExp('^\\$([A-Z]+)\\$(\\d+)');

    
    // Convert an Excel column name (a string of alphabetical charcaters) into a number.
    public static column_name_to_index(name: string) : number {
	if (name.length === 1) { // overwhelming common case
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


    // Returns a vector (x, y) corresponding to the column and row of the computed dependency.
    public static cell_dependency(cell: string, origin_col: number, origin_row: number) : Array<number> {
	let r = Colorize.cell_both_relative.exec(cell);
	if (r) {
	    console.log("both_relative");
	    let col = Colorize.column_name_to_index(r[1]);
	    let row = parseInt(r[2]);
	    return [col - origin_col, row - origin_row];
	}

	r = Colorize.cell_col_absolute.exec(cell);
	if (r) {
	    console.log("col_absolute");
	    let col = Colorize.column_name_to_index(r[1]);
	    let row = parseInt(r[2]);
	    return [col, row - origin_row];
	}

	r = Colorize.cell_row_absolute.exec(cell);
	if (r) {
	    console.log("row_absolute");
	    let col = Colorize.column_name_to_index(r[1]);
	    let row = parseInt(r[2]);
	    return [col - origin_col, row];
	}
	
	r = Colorize.cell_both_absolute.exec(cell);
	if (r) {
	    console.log("both_absolute");
	    let col = Colorize.column_name_to_index(r[1]);
	    let row = parseInt(r[2]);
	    return [col, row];
	}

	throw new Error('We should never get here.');
	return [0, 0];
    }


    public static dependencies(range: string, origin_col: number, origin_row: number) : void {

	let first_cell = null;
	let last_cell = null;
	let found_pair = null;

	// First, get all the range pairs out.
	while (found_pair = Colorize.range_pair.exec(range)) {
	    if (found_pair) {
		//	    console.log(found_pair);
		first_cell = found_pair[1];
		console.log(first_cell);
		console.log(Colorize.cell_dependency(first_cell, origin_col, origin_row));
		last_cell = found_pair[2];
		console.log(last_cell);
		console.log(Colorize.cell_dependency(last_cell, origin_col, origin_row));
	    }
	}

    }

}

//Colorize.dependencies('A1:B$12,$A12:$B$14', 10, 10);

