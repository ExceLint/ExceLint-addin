/* global Office, Excel */

import * as React from 'react';
import { Header } from './Header';
import { Content } from './Content';
import Progress from './Progress';

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
	    	let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		let usedRange = currentWorksheet.getUsedRange();
		let everythingRange = currentWorksheet.getRange();
		await context.sync();
		// Clear all formatting. Really we want to just clear colors but fine for now (FIXME later).
		everythingRange.clear(Excel.ClearApplyTo.formats);
		// Now get the addresses, the formulas, and the values.
                usedRange.load('address');
		await context.sync();
		let address = usedRange.address;
                usedRange.load('formulas'); // note that real formulas start with "="
                await context.sync();
		let formulas = usedRange.formulas;
                usedRange.load('values');
		await context.sync();
		let values = usedRange.values;
		// Now we can get the formula ranges (all cells with formulas),
		// and the numeric ranges (all cells with numbers). These come in as 2-D arrays.
		let formulaRanges = usedRange.getSpecialCells(Excel.SpecialCellType.formulas);
		let numericRanges = usedRange.getSpecialCells(Excel.SpecialCellType.constants,
		    Excel.SpecialCellValueType.numbers);
		await context.sync();
		// For fun, make all formulas pink and all numbers yellow.
		formulaRanges.format.fill.color = "pink";
		numericRanges.format.fill.color = "yellow";
		await context.sync();
                console.log(`The range address was ${address}.`);
		console.log(JSON.stringify(formulas, null, 4));
		console.log(JSON.stringify(values, null, 4));
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