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
                // const range = context.workbook.getSelectedRange();
                //usedRange.load('address');
                //usedRange.load('values');
                usedRange.load('address');
                //range.format.fill.color = 'blue'; // 'green';
		await context.sync();
		let address = usedRange.address;
                usedRange.load('formulas'); // note that real formulas start with "="
                await context.sync();
		let formulas = usedRange.formulas;
                usedRange.load('values');
		await context.sync();
		let values = usedRange.values;
		let formulaRanges = usedRange.getSpecialCells(Excel.SpecialCellType.formulas);
		formulaRanges.format.fill.color = "pink";
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
                <Header title='Welcome' />
                <Content message='Click the button below to reveal the deep structure of this spreadsheet.' buttonLabel='Reveal structure' click={this.setColor} />
            </div>
        );
    }
}