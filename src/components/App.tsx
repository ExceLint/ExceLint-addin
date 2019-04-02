/* global Office, Excel */

import * as React from 'react';
import { Header } from './Header';
import { Content } from './Content';
import Progress from './Progress';
import { Colorize } from './colorize';
import { ExcelUtils } from './excelutils';
import { RectangleUtils } from './rectangleutils';

import * as OfficeHelpers from '@microsoft/office-js-helpers';

export interface AppProps {
    title: string;
    isOfficeInitialized: boolean;
}

export interface AppState {
}

export default class App extends React.Component<AppProps, AppState> {

    private savedProperties: any = [];
    private savedColors: any = [];
    private proposed_fixes: Array<[number, [[number, number], [number, number]], [[number, number], [number, number]]]> = [];
    private current_fix = 0;

    constructor(props, context) {
        super(props, context);
    }


    private async processRange(context: Excel.RequestContext, currentWorksheet: Excel.Worksheet, startCol: number, startRow: number, endCol: number, endRow: number) {
        let success = false;
        while (!success) {
            try {
                let range = [] as any;
                let startCell = '';
                let endCell = '';
                if ((endCol - startCol >= 0) && (endRow - startRow >= 0)) {
                    startCell = ExcelUtils.column_index_to_name(startCol) + startRow;
                    endCell = ExcelUtils.column_index_to_name(endCol) + endRow;
                    if (startCell === endCell) {
                        range = currentWorksheet.getCell(startRow, startCol);
                    }
                    range = currentWorksheet.getRange(startCell + ':' + endCell);
                }
                //	    return;
                await context.sync();
                range.format.fill.load(['color']);
                console.log('synching for ' + startCell + ' through ' + endCell);
                await context.sync();
                let color = range.format.fill.color;
                if (color !== null) {
                    this.savedColors.push([startCell, endCell, color]);
                } else {
                    /* // column by column
					if (startCol !== endCol) {
						let midCol = startCol + Math.floor((endCol - startCol) / 2);
						await this.processRange(context, currentWorksheet, startCol, startRow, midCol, endRow);
						await this.processRange(context, currentWorksheet, midCol + 1, startRow, endCol, endRow);
					} else {
						let midRow  = startRow + Math.floor((endRow - startRow) / 2);
						await this.processRange(context, currentWorksheet, startCol, startRow, endCol, midRow);
						await this.processRange(context, currentWorksheet, startCol, midRow + 1, endCol, endRow);
					}
					*/
                    // binary search
                    let divisor = 2; // (Math.random() * (8 - 2)) + 2.0001;
                    let midCol = startCol + Math.floor((endCol - startCol) / divisor);
                    let midRow = startRow + Math.floor((endRow - startRow) / divisor);
                    await this.processRange(context, currentWorksheet, startCol, startRow, midCol, midRow);
                    await this.processRange(context, currentWorksheet, midCol + 1, startRow, endCol, midRow);
                    await this.processRange(context, currentWorksheet, startCol, midRow + 1, midCol, endRow);
                    await this.processRange(context, currentWorksheet, midCol + 1, midRow + 1, endCol, endRow);
                    //				context.trackedObjects.remove(range);
                    await context.sync();
                }
                success = true;
                await context.sync();
            } catch (error) {
                console.log('dango' + error);
                success = true;
            }
        }
    }


    disabledClearColor = async () => {
        Colorize.initialize();
        try {
            await Excel.run(async context => {
                let startTime = performance.now();
                this.savedColors = [];
                // Load up the used range.
                let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
                let usedRange = currentWorksheet.getUsedRange();
                await context.sync();
                usedRange.load(['address']);
                usedRange.format.fill.load(['color']);
                //		let items = usedRange.format.fill;
                await context.sync();
                let color = usedRange.format.fill.color;
                let address = usedRange.address;
                let [sheetName, startCell, endCell] = ExcelUtils.extract_sheet_range(address);
                let [startCol, startRow] = ExcelUtils.cell_dependency(startCell, 0, 0);
                let [endCol, endRow] = ExcelUtils.cell_dependency(endCell, 0, 0);
                // Are we done? (We got a color)
                if (color !== null) {
                    this.savedColors.push([startCell, endCell, color]);
                } else {
                    await this.processRange(context, currentWorksheet, startCol, startRow, endCol, endRow);
                }
                //console.log(this.savedColors);
                let endTime = performance.now();
                let timeElapsedMS = endTime - startTime;
                //this.OldclearColor();
                console.log('Time elapsed (ms) = ' + timeElapsedMS);
            });
        } catch (error) {
            OfficeHelpers.UI.notify(error);
            OfficeHelpers.Utilities.log(error);
        }
    }

    private process(f, currentWorksheet, colorfn) {
        // Sort and group by COLUMNS (first dimension).
        let grouped_ranges = Colorize.identify_groups(f);
        //console.log(JSON.stringify(grouped_ranges));
        //	console.log(typeof grouped_ranges);
        let g = JSON.parse(JSON.stringify(grouped_ranges)); // deep copy
        //console.log(Colorize.mergeable(g));
        //	console.log(grouped_ranges);
        // FINALLY, process the ranges.
        Object.keys(grouped_ranges).forEach(hash => {
            if (!(hash === undefined)) {
                let v = grouped_ranges[hash];
                for (let theRange of v) {
                    let r = theRange;
                    let col0 = ExcelUtils.column_index_to_name(r[0][0]);
                    let row0 = r[0][1];
                    let col1 = ExcelUtils.column_index_to_name(r[1][0]);
                    let row1 = r[1][1];

                    let range = currentWorksheet.getRange(col0 + row0 + ':' + col1 + row1);
                    let color = colorfn(hash); // Colorize.get_color(parseInt(hash));
                    range.format.fill.color = color;
                }
            }
        });
        return grouped_ranges;
    }

    clearColor = async () => {
        Colorize.initialize();

        try {
            await Excel.run(async context => {

                // Clear all formats and borders.

                let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
                let everythingRange = currentWorksheet.getRange();
                currentWorksheet.load(['protection']);
                await context.sync();

                await context.sync();
                if (currentWorksheet.protection.protected) {
                    // Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
                    return;
                }

                everythingRange.clear(Excel.ClearApplyTo.formats);
                everythingRange.format.borders.load(['items']);
                await context.sync();
                let items = everythingRange.format.borders.items;

                for (let border of items) {
                    border.set({
                        'style': 'None',
                        'tintAndShade': 0
                    });
                }

            });
        } catch (error) {
            OfficeHelpers.UI.notify(error);
            OfficeHelpers.Utilities.log(error);
        }
    }

    setColor = async () => {
        Colorize.initialize();

        try {
            //	    OfficeExtension.config.extendedErrorLogging = true;
            await Excel.run(async context => {
                let app = context.workbook.application;
                console.log('ExceLint: starting processing.');
                let startTime = performance.now();

                let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
                currentWorksheet.load(['protection']);

                let usedRange = currentWorksheet.getUsedRange();
                let everythingRange = currentWorksheet.getRange();
                // Now get the addresses, the formulas, and the values.
                usedRange.load(['address', 'formulas', 'values']);
                currentWorksheet.charts.load(['items']);

                await context.sync();
                console.log(currentWorksheet.protection.protected);
                console.log('ExceLint: done with sync 1.');
                if (currentWorksheet.protection.protected) {
                    // Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
                    return;
                }

                let address = usedRange.address;

                // Now we can get the formula ranges (all cells with formulas),
                // and the numeric ranges (all cells with numbers). These come in as 2-D arrays.
                let formulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas);
                let numericRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.constants,
                    Excel.SpecialCellValueType.numbers);
                let formulas = usedRange.formulas;
                let values = usedRange.values;
                numericRanges.format.borders.load(['items']);
                formulaRanges.format.borders.load(['items']);


                await context.sync();
                console.log('ExceLint: done with sync 2.');


                // FIX ME - need a button to restore all formatting.
                // First, clear all formatting. Really we want to just clear colors but fine for now (FIXME later)
                everythingRange.clear(Excel.ClearApplyTo.formats);

                // Make all numbers yellow; this will be the default value for unreferenced data.
                numericRanges.format.fill.color = '#eed202'; // "Safety Yellow"

                // Give every formula a solid border.
                let items = formulaRanges.format.borders.items;
                for (let border of items) {
                    border.set({
                        'weight': 'Thin',
                        'style': 'Continuous',
                        'tintAndShade': -1
                    });
                }

                // Give every numeric data item a dashed border.
                items = numericRanges.format.borders.items;
                for (let border of items) {
                    border.set({
                        'weight': 'Thin',
                        'style': 'Dash',
                        'tintAndShade': -1
                    });
                }

                let [sheetName, startCell] = ExcelUtils.extract_sheet_cell(address);
                let vec = ExcelUtils.cell_dependency(startCell, 0, 0);

                let processed_formulas = Colorize.process_formulas(formulas, vec[0] - 1, vec[1] - 1);
                let processed_data = Colorize.color_all_data(formulas, processed_formulas, vec[0], vec[1]);

                this.process(processed_data, currentWorksheet, (hash: string) => { return Colorize.get_light_color_version(Colorize.get_color(parseInt(hash, 10))); });
                let formula_groups = this.process(processed_formulas, currentWorksheet, (hash: string) => { return Colorize.get_color(parseInt(hash, 10)); });

                // For now, select the very first proposed fix.
                this.proposed_fixes = Colorize.generate_proposed_fixes(formula_groups);
                console.log(JSON.stringify(this.proposed_fixes));
                this.current_fix = 0;
                let r = this.getRange(currentWorksheet, this.proposed_fixes, this.current_fix);
                if (r) {
                    r.select();
                }
                await context.sync();
                console.log('ExceLint: done with sync 3.');

                let endTime = performance.now();
                let timeElapsedMS = endTime - startTime;
                console.log('Time elapsed (ms) = ' + timeElapsedMS);
            });
        } catch (error) {
            OfficeHelpers.UI.notify(error);
            OfficeHelpers.Utilities.log(error);
        }
    }

    getRange(currentWorksheet, proposed_fixes, current_fix) {
        if (proposed_fixes.length > 0) {
            let r = RectangleUtils.bounding_box(proposed_fixes[current_fix][1], proposed_fixes[current_fix][2]);
            // convert to sheet notation
            let col0 = ExcelUtils.column_index_to_name(r[0][0]);
            let row0 = r[0][1];
            let col1 = ExcelUtils.column_index_to_name(r[1][0]);
            let row1 = r[1][1];
            let range = currentWorksheet.getRange(col0 + row0 + ":" + col1 + row1);
            return range;
        } else {
            return null;
        }
    }

    previousFix = async () => {
        console.log("previousFix");
        try {
            await Excel.run(async context => {
                let app = context.workbook.application;

                let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
                currentWorksheet.load(['protection']);
                await context.sync();
                if (currentWorksheet.protection.protected) {
                    // Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
                    return;
                }

                this.current_fix -= 1;
                if (this.current_fix < 0) {
                    this.current_fix = 0;
                }
                let r = this.getRange(currentWorksheet, this.proposed_fixes, this.current_fix);
                r.select();
            });
        } catch (error) {
            OfficeHelpers.UI.notify(error);
            OfficeHelpers.Utilities.log(error);
        }
    }

    nextFix = async () => {
        console.log("nextFix");
        try {
            await Excel.run(async context => {
                let app = context.workbook.application;
                let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
                currentWorksheet.load(['protection']);
                await context.sync();
                if (currentWorksheet.protection.protected) {
                    //                    Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
                    return;
                }
                this.current_fix++;
                if (this.current_fix >= this.proposed_fixes.length) {
                    this.current_fix = this.proposed_fixes.length - 1;
                }
                let r = this.getRange(currentWorksheet, this.proposed_fixes, this.current_fix);
                r.select();
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
                <Content message1='Click the button below to reveal the deep structure of this spreadsheet.' buttonLabel1='Reveal structure' click1={this.setColor}
                    message2='Click the button below to clear colors and borders.' buttonLabel2='Clear' click2={this.clearColor}
                    message3='Click the button below to reveal the deep structure of this spreadsheet.' buttonLabel3='Previous fix' click3={this.previousFix}
                    message4='Click the button below to clear colors and borders.' buttonLabel4='Next fix' click4={this.nextFix} />
            </div>
        );
    }
}
