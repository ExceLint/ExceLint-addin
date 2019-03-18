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
		
		// FIX ME - need a button to restore all formatting.
		// First, clear all formatting. Really we want to just clear colors but fine for now (FIXME later)
		everythingRange.clear(Excel.ClearApplyTo.formats);
		
		// For fun, make all formulas pink and all numbers yellow.
		//formulaRanges.format.fill.color = "pink";
		numericRanges.format.fill.color = "lightyellow";

		let [sheetName, startCell] = Colorize.extract_sheet_cell(address);
		let vec = Colorize.cell_dependency(startCell, 0, 0);
		let processed_formulas = Colorize.process_formulas(formulas, vec[0]-1, vec[1]-1);

		// Sort by COLUMNS (first dimension).
		let identified_ranges = Colorize.identify_ranges(processed_formulas, (a, b) => { if (a[0] == b[0]) { return a[1] - b[1]; } else { return a[0] - b[0]; }});

		// Now group them (by COLUMNS).
		let grouped_ranges = Colorize.group_ranges(identified_ranges);
		// FINALLY, process the ranges.
		Object.keys(grouped_ranges).forEach(color => {
		    let v = grouped_ranges[color];
		    for (let theRange of v) {
			let r : Array<[number, number]> = theRange;
			let col0 = Colorize.column_index_to_name(r[0][0]);
			let row0 = r[0][1];
			let col1 = Colorize.column_index_to_name(r[1][0]);
			let row1 = r[1][1];
			
			// console.log(col0 + row0 + ":" + col1 + row1);
			let range = currentWorksheet.getRange(col0 + row0 + ":" + col1 + row1);
			range.format.fill.color = color;
		    }
		})
		
		await context.sync();
		
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