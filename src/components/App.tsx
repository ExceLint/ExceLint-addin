/* global Office, Excel */

import * as React from 'react';
import { Header } from './Header';
import { Content } from './Content';
import Progress from './Progress';
import { Colorize } from './colorize';
import { ExcelUtils } from './excelutils';
import { RectangleUtils } from './rectangleutils';
//import { OfficeExtension } from '@microsoft/office-js';

import * as OfficeHelpers from '@microsoft/office-js-helpers';

export interface AppProps {
	title: string;
	isOfficeInitialized: boolean;
}

export interface AppState {
}

export default class App extends React.Component<AppProps, AppState> {

	private proposed_fixes: Array<[number, [[number, number], [number, number]], [[number, number], [number, number]]]> = [];
	private current_fix = 0;
	private savedFormat: any = null;
    private savedRange: string = null;
    private sheetSuffix : string = "_EL";
    private startRange = "A1";
    private endRange = "AA32767";
	constructor(props, context) {
		super(props, context);
	}

    private process(grouped_ranges, currentWorksheet, colorfn) {
		// Sort and group by COLUMNS (first dimension).
//		let grouped_ranges = Colorize.identify_groups(f);
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
//		return grouped_ranges;
	}

	clearColor = async () => {
		Colorize.initialize();

		try {
		    await Excel.run(async context => {

			// Clear all formats and borders.
			
			let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
			let everythingRange = currentWorksheet.getRange();
			let usedRange = currentWorksheet.getUsedRangeOrNullObject();
			currentWorksheet.load(['protection']);
			if (usedRange) {
			    usedRange.load(['format']);
			}
			console.log("sync 1");
			await context.sync();
			
			if (!everythingRange) {
			    return;
			}
			
			if (currentWorksheet.protection.protected) {
			    // Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
			    return;
			}
			
			// console.log("saved format = " + JSON.stringify(this.savedFormat));
			if (usedRange) {
			    //usedRange.format.borders.load(['items']);
			    //await context.sync();
			    if (false) { // this.savedFormat) {
				//let items = usedRange.format.borders.items;
				// usedRange.clear('Formats');
				// usedRange.setCellProperties(this.savedFormat.m_value);
				//this.savedFormat = null;
				console.log("sync 2");
				await this.restoreFormatsAndColors();
				// await context.sync();
				console.log("after sync2");
			    }
			}
			
		    });
		} catch (error) {
		    OfficeHelpers.UI.notify(error);
		    OfficeHelpers.Utilities.log(error);
		}
	}
    
/*
    public changeHandler(event) {
	await Excel.run(async context => {
	    await context.sync();
	    console.log("EVENT: " + JSON.stringify(event));
	});
    }
*/
    
    saveFormats = async() => {
	Colorize.initialize();
	await Excel.run(async context => {
	    //	    worksheets.load("items");
	    //	    await context.sync();
	    let worksheets = context.workbook.worksheets;
	    // Make a new sheet corresponding to the current sheet (+ a suffix).
	    console.log("A");
	    let currentWorksheet = worksheets.getActiveWorksheet();
	    console.log("B");
	    currentWorksheet.load(['name']);
	    await context.sync();
	    console.log("C");
	    console.log(currentWorksheet.id);
//	    let newName = currentWorksheet.id.replace(/[-{}]/g, '_') + this.sheetSuffix;
	    let newName = currentWorksheet.name + this.sheetSuffix;
	    console.log("D");
	    if (true) {
		// If it's there already, delete it.
		try {
		    console.log("ATTEMPT DELETE.");
		    let newSheet = worksheets.getItem(newName);
		    newSheet.visibility = Excel.SheetVisibility.hidden;
		    newSheet.delete();
		    await context.sync();
		} catch (error) { console.log("Sheet not found. " + error); }
	    }
	    console.log("E");
	    try {
		worksheets.add(newName);
	    } catch(error) { console.log("Already added. " + error); }
	    console.log("F");
	    let newSheet = worksheets.getItem(newName);
	    console.log("G");
	    newSheet.visibility = Excel.SheetVisibility.veryHidden;
	    console.log("H");
	    await context.sync();
	    // Finally, copy the formats!
	    let destRange = newSheet.getRange("A1") as any;
	    destRange.copyFrom(currentWorksheet.name + "!" + this.startRange + ":" + currentWorksheet.name + "!" + this.endRange, Excel.RangeCopyType.formats);
	    await context.sync();
	});
    }
    
    restoreFormats = async(context) => {
	Colorize.initialize();
//	await Excel.run(async context => {
	let worksheets = context.workbook.worksheets;
	await context.sync();
	// Try to restore the format from the hidden sheet.
	let currentWorksheet = worksheets.getActiveWorksheet();
	currentWorksheet.protection.unprotect();
	await context.sync();
	currentWorksheet.load(['name']);
	await context.sync();
	console.log("got here.");
	console.log(currentWorksheet.id);
	let newName = currentWorksheet.name + this.sheetSuffix;
	//	let newName = currentWorksheet.id.replace(/[-{}]/g, '_') + this.sheetSuffix;
	console.log(Colorize.hash(currentWorksheet.id));
	// If it's there already, restore it. //  then delete it.
	try {
	    let newSheet = worksheets.getItem(newName);
	    let destRange = currentWorksheet.getRange("A1") as any;
	    newSheet.load(['name', 'format', 'address']);
	    await context.sync();
	    destRange.copyFrom(newSheet.name + "!" + this.startRange + ":" + newSheet.name + "!" + this.endRange, Excel.RangeCopyType.formats);
	    await context.sync();
	} catch(error) { console.log("Nothing to restore: " + error); }
	await context.sync();
    }
    
    
    setColor = async () => {
	Colorize.initialize();

	try {
	    OfficeExtension.config.extendedErrorLogging = true;
	    await Excel.run(async context => {
		let app = context.workbook.application;
		console.log('ExceLint: starting processing.');
		let startTime = performance.now();
		console.log('ExceLint: starting processing 1');
		let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		console.log('ExceLint: starting processing 2');
		currentWorksheet.load(['protection']);
		await context.sync(); // FOR DEBUGGING

 		console.log(currentWorksheet.protection.protected);
		console.log('ExceLint: done with sync.');
		if (currentWorksheet.protection.protected) {
		    console.log("WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again.");
		    // Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
		    return;
		}

		console.log('ExceLint: starting processing 3');
		
		let usedRange = currentWorksheet.getUsedRange() as any;
		await context.sync(); // FOR DEBUGGING
		console.log('ExceLint: starting processing 4');
		let everythingRange = currentWorksheet.getRange();
		await context.sync(); // FOR DEBUGGING
		console.log('ExceLint: starting processing 5');
		// Now get the addresses, the formulas, and the values.
//		usedRange.load(['address', 'formulas', 'values', 'format']);
		usedRange.load(['address']);
		console.log("addresses.");
		await context.sync(); // FOR DEBUGGING
		usedRange.load(['formulas']);
		console.log("formulas.");
		await context.sync(); // FOR DEBUGGING
		usedRange.load(['values']);
		console.log("values.");
		await context.sync(); // FOR DEBUGGING
		usedRange.load(['format']);
		console.log("format.");
		await context.sync(); // FOR DEBUGGING
		
		console.log('ExceLint: starting processing 6');
		currentWorksheet.charts.load(['items']);
		console.log('ExceLint: starting processing 7');
		
		await context.sync();
		
		console.log('ExceLint: starting processing 8');
		///console.log(JSON.stringify(this.savedFormat));
		
		// First, try to restore the saved format.
//		await this.restoreFormats(context);

		// Now save them.
		await this.saveFormats();
		let address = usedRange.address;
		
		// Now we can get the formula ranges (all cells with formulas),
		// and the numeric ranges (all cells with numbers). These come in as 2-D arrays.
		let formulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas);
		let numericRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.constants,
									  Excel.SpecialCellValueType.numbers);
		let formulas = usedRange.formulas;
		let values = usedRange.values;
		try {
		    if (numericRanges) {
			numericRanges.clear('Formats');
		    }
		    
		    if (formulaRanges) {
			formulaRanges.clear('Formats');
		    }
		    // usedRange.clear('Formats');
		    // FIXME -- the below was really slow... 4/3/2019
		    // usedRange.setCellProperties(newFormat.m_value);
		    
		    await context.sync();
		} catch (error) {
		    console.log("ExceLint: encountered an error in saveFormatsAndColors; ignoring.");
		}
		console.log('ExceLint: done with sync 2.');
		
		
		// FIX ME - need a button to restore all formatting.
		// First, clear all formatting. Really we want to just clear colors but fine for now (FIXME later)
		//everythingRange.clear('Formats'); // Excel.ClearApplyTo.formats);
		
		// Make all numbers yellow; this will be the default value for unreferenced data.
		if (numericRanges) {
		    numericRanges.format.fill.color = '#eed202'; // "Safety Yellow"
		}
		
		let [sheetName, startCell] = ExcelUtils.extract_sheet_cell(address);
		let vec = ExcelUtils.cell_dependency(startCell, 0, 0);
		
		let processed_formulas = Colorize.process_formulas(formulas, vec[0] - 1, vec[1] - 1);
		let processed_data = Colorize.color_all_data(formulas, processed_formulas, vec[0], vec[1]);
		
		let grouped_data = Colorize.identify_groups(processed_data);
		let grouped_formulas = Colorize.identify_groups(processed_formulas);
		// For now, select the very first proposed fix.
		this.proposed_fixes = Colorize.generate_proposed_fixes(grouped_formulas);
		// Only present up to 5% (threshold from paper).
		let max_proposed_fixes = Math.round(0.05 * formulas.length);
		//this.proposed_fixes = this.proposed_fixes.slice(0, max_proposed_fixes);
		console.log(JSON.stringify(this.proposed_fixes));
		
		this.process(grouped_data, currentWorksheet, (hash: string) => { return Colorize.get_light_color_version(Colorize.get_color(parseInt(hash, 10))); });
		this.process(grouped_formulas, currentWorksheet, (hash: string) => { return Colorize.get_color(parseInt(hash, 10)); });

/*
		for (let i = 0; i < this.proposed_fixes.length; i++) {
		    let r = this.getRange(currentWorksheet, this.proposed_fixes, i);
		    r.load(['format']);
		    await context.sync();
		    r.border.set({ 'weight': 'Thin', 'style' : 'Continuous', 'tintAndShade' : -1});
		}
*/
		
		this.current_fix = 0;
		let r = this.getRange(currentWorksheet, this.proposed_fixes, this.current_fix);
		if (r) {
		    r.select();
		}
		await context.sync();
		console.log('ExceLint: done with sync 3.');
		currentWorksheet.protection.protect();
/*		let currName = currentWorksheet.name;
		currentWorksheet.onChanged.add((eventArgs) => { Excel.run((context) => { context.workbook.worksheets.getActiveWorksheet().name = currName; await context.sync(); }); }); */
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

    storeFormatsAndColors = async () => {
	// Maybe just copy into a very hidden sheet? and then bring it back?
	// Use UID of sheet and some string like "-ExceLint-backup" and copy everything in or out.x
		OfficeExtension.config.extendedErrorLogging = true;

		try {
			await Excel.run(async context => {
				let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
				let usedRange = currentWorksheet.getUsedRangeOrNullObject() as any;
				usedRange.load(['address']);
				await context.sync();
				let address = usedRange.address;
				console.log("address is " + address);
				this.savedRange = address;
				this.savedFormat = usedRange.getCellProperties({
					format: {
						fill: {
							color: true
						},
						font: {
							name: true,
							bold: true,
							color: true,
							italic: true,
							underline: true,
							size: true
						}
					}
				});
				await context.sync();
				console.log("Saved cell properties (get).");
//				console.log(JSON.stringify(this.savedFormat.m_value));
			});

		} catch (error) {
			OfficeHelpers.UI.notify(error);
			OfficeHelpers.Utilities.log(error);
		}
	}

	restoreFormatsAndColors = async () => {
	    OfficeExtension.config.extendedErrorLogging = true;
	    try {
		await Excel.run(async context => {
		    let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		    currentWorksheet.load(['name']);
		    console.log("name loading");
		    await context.sync();
		    console.log("restore formats call");
		    await this.restoreFormats(context);
		});
	    } catch (error) {
		OfficeHelpers.UI.notify(error);
		OfficeHelpers.Utilities.log(error);
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
					message2='Click the button below to restore previous colors and borders.' buttonLabel2='Restore' click2={this.restoreFormatsAndColors}
					message5='Load' buttonLabel5='StoreStuff' click5={this.storeFormatsAndColors}
					message3='Click the button below to reveal the deep structure of this spreadsheet.' buttonLabel3='Previous fix' click3={this.previousFix}
					message4='Click the button below to clear colors and borders.' buttonLabel4='Next fix' click4={this.nextFix} />
			</div>
		);
	}
}
