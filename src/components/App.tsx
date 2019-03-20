/* global Office, Excel */

import * as React from 'react';
import { Header } from './Header';
import { Content } from './Content';
import Progress from './Progress';
import { Colorize } from './colorize';

import * as OfficeHelpers from '@microsoft/office-js-helpers';

export interface AppProps {
    title: string;
    isOfficeInitialized: boolean;
}

export interface AppState {
}

export default class App extends React.Component<AppProps, AppState> {
    constructor(props, context) {
        super(props, context);
    }

    process(f, currentWorksheet) {
	// Sort by COLUMNS (first dimension).
	let identified_ranges = Colorize.identify_ranges(f, (a, b) => { if (a[0] == b[0]) { return a[1] - b[1]; } else { return a[0] - b[0]; }});

	// Now group them (by COLUMNS).
	let grouped_ranges = Colorize.group_ranges(identified_ranges);
	console.log(grouped_ranges);
	// FINALLY, process the ranges.
	Object.keys(grouped_ranges).forEach(color => {
	    if (!(color === undefined)) {
 		let v = grouped_ranges[color];
		for (let theRange of v) {
		    let r = theRange;
		    let col0 = Colorize.column_index_to_name(r[0][0]);
		    let row0 = r[0][1];
		    let col1 = Colorize.column_index_to_name(r[1][0]);
		    let row1 = r[1][1];
		    
		    let range = currentWorksheet.getRange(col0 + row0 + ":" + col1 + row1);
		    // console.log("setting " + col0 + row0 + ":" + col1 + row1 + " to " + color);
		    range.format.fill.color = color;
		}
	    }
	})
    }
    
    setColor = async () => {
        try {
            await Excel.run(async context => {
		let startTime = performance.now();
		
	    	let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		let usedRange = currentWorksheet.getUsedRange();
		let everythingRange = currentWorksheet.getRange();
		// Now get the addresses, the formulas, and the values.
                usedRange.load(['address', 'formulas', 'values']);
		
		await context.sync();

		let address = usedRange.address;
		
		// Now we can get the formula ranges (all cells with formulas),
		// and the numeric ranges (all cells with numbers). These come in as 2-D arrays.
		let formulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas);
		let numericRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.constants,
							      Excel.SpecialCellValueType.numbers);
		let formulas = usedRange.formulas;
		let values = usedRange.values;
		
		// FIX ME - need a button to restore all formatting.
		// First, clear all formatting. Really we want to just clear colors but fine for now (FIXME later)
		everythingRange.clear(Excel.ClearApplyTo.formats);
		
		// For fun, make all formulas pink and all numbers yellow.
		//formulaRanges.format.fill.color = "pink";
		numericRanges.format.fill.color = "yellow";

		let [sheetName, startCell] = Colorize.extract_sheet_cell(address);
		let vec = Colorize.cell_dependency(startCell, 0, 0);
		let processed_formulas = Colorize.process_formulas(formulas, vec[0]-1, vec[1]-1);

		// Generate all formula colors (as a dict).
		let formula_color = {};
		for (let f of processed_formulas) {
		    let formula_vec = f[0];
		    formula_color[formula_vec.join(",")] = f[1];
		}
		//		console.log(JSON.stringify(formula_color));
		
/*		console.log(formulas[5][7]);
		let general_re = '\\$?[A-Z]+\\$?\\d+';
		let cell_col_absolute = new RegExp('\\$([A-Z]+)[^\\$\\d]?(\\d+)');
		let cell_both_relative = new RegExp('[^\\$]?([A-Z]+)(\\d+)');

		let cbr = new RegExp('('+general_re+'):('+general_re+')', 'g'); // new RegExp('[^\\$]?([A-Z]+)(\\d+)');
//		let cbr = new RegExp('([A-Z]+)(\\d+)');
		console.log(cbr.exec("=AVERAGE(L4:L7)"));
		console.log(cell_col_absolute.exec("=AVERAGE($L4)"));
		console.log(cell_both_relative.exec("=AVERAGE($L4)"));
*/		
		
		let refs = Colorize.generate_all_references(formulas, vec[0], vec[1]);
		// console.log(refs);
		let data_color = {};
		let processed_data = [];
		
		// Color all references based on the color of their referring formula.
		for (let refvec of Object.keys(refs)) {
		    // console.log("refvec = "+refvec);
		    // console.log("ref loop checking refvec = " + refvec);
		    for (let r of refs[refvec]) {
			// console.log("ref loop checking " + r);
			let color = formula_color[r.join(",")];
			if (!(color === undefined)) {
			    //		    console.log("color = " + color);
			    let rv = JSON.parse("[" + refvec + "]");
			    //console.log(parseInt(rv[0]));
			    //console.log(parseInt(rv[1]));
			    let row = parseInt(rv[0]);
			    let col = parseInt(rv[1]);
			    // console.log("Checking "+row+", "+col);
			    if (!([row,col].join(",") in formula_color)) {
				if (!([row,col].join(",") in data_color)) {
				    processed_data.push([[row, col], Colorize.get_light_color_version(color)]);
				    // currentWorksheet.getCell(col-1, row-1).format.fill.color = Colorize.get_light_color_version(color);
				    data_color[[row,col].join(",")] = Colorize.get_light_color_version(color);
				    // console.log("Added "+row+", "+col);
				    
				}
			    }
			}
		    }
		}
		
		//		console.log(processed_data);
		//		console.log(processed_formulas);
		this.process(processed_data, currentWorksheet);
		this.process(processed_formulas, currentWorksheet);
	
		
		await context.sync();
		
//		console.log(processed_data);
//		console.log(all_deps);
//		console.log(JSON.stringify(refs));
		
		let endTime = performance.now();
		let timeElapsedMS = endTime - startTime;
		console.log("Time elapsed (ms) = " + timeElapsedMS);
            });
        } catch (error) {
            OfficeHelpers.UI.notify(error);
            OfficeHelpers.Utilities.log(error);
        }
    }

    render() {
        const {
            title,
            isOfficeInitialized,
        } = this.props;

        if (!isOfficeInitialized) {
            return (
                <Progress
                    title={title}
                    logo='assets/logo-filled.png'
                    message='Please sideload your addin to see app body.'
                />
            );
        }

        return (
            <div className='ms-welcome'>
                <Header title='ExceLint' />
                <Content message='Click the button below to reveal the deep structure of this spreadsheet.' buttonLabel='Reveal structure' click={this.setColor} />
            </div>
        );
    }
}