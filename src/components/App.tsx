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

	private proposed_fixes: Array<[number, [[number, number], [number, number]], [[number, number], [number, number]]]> = [];
	private current_fix = 0;
	private savedFormat: any = null;
    private savedRange: string = null;
    private originalSheetSuffix : string = "_EL";
    private colorizedSheetSuffix : string = "_LE";
    private startRange = "A1";
    private endRange = "AA32767";
	constructor(props, context) {
		super(props, context);
	}

    private saved_original_sheetname(id: string) : string {
	return ExcelUtils.hash_sheet(id, 28) + this.originalSheetSuffix;
    }

    private saved_colorized_sheetname(id: string) : string {
	return ExcelUtils.hash_sheet(id, 28) + this.colorizedSheetSuffix;
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
				    if (color == '#FFFFFF') {
					range.format.fill.clear();
				    } else {
					range.format.fill.color = color;
				    }
				}
			}
		});
//		return grouped_ranges;
	}

    
    saveFormats = async() => {
	Colorize.initialize();
	await Excel.run(async context => {
	    //	    worksheets.load("items");
	    //	    await context.sync();
	    let worksheets = context.workbook.worksheets;
	    // Make a new sheet corresponding to the current sheet (+ a suffix).
	    console.log("saveFormats: loading current worksheet name");
	    let currentWorksheet = worksheets.getActiveWorksheet();
	    currentWorksheet.load(['name']);
	    await context.sync();
	    let newName = this.saved_original_sheetname(currentWorksheet.id);
	    // If it's there already, delete it.
	    try {
		console.log("saveFormats: attempt to delete saved format sheet");
		let newSheet = worksheets.getItem(newName);
		newSheet.visibility = Excel.SheetVisibility.hidden;
		newSheet.delete();
		await context.sync();
	    } catch (error) { console.log("saveFormats: Sheet not found. " + error); }
	    console.log("saveFormats: deleted saved format sheet, if one existed");
	    try {
		worksheets.add(newName);
	    } catch(error) { console.log("Already added. " + error); }
	    let newSheet = worksheets.getItem(newName);
	    newSheet.visibility = Excel.SheetVisibility.veryHidden;
	    await context.sync();
	    console.log("saveFormats: got the new sheet to hold formats");
	    // Finally, copy the formats!
	    let destRange = newSheet.getRange("A1") as any;
	    let usedRange = currentWorksheet.getUsedRange() as any;
	    await context.sync(); // FOR DEBUGGING

//	    destRange.copyFrom(this.startRange + ":" + this.endRange, Excel.RangeCopyType.formats);
	    destRange.copyFrom(usedRange, Excel.RangeCopyType.formats);
	    await context.sync();
	    console.log("saveFormats: copied out the formats");
	});
    }

    /// Restore formats from the saved hidden sheet corresponding to the active sheet's ID.
    restoreFormats = async(context) => {
	Colorize.initialize();
	let worksheets = context.workbook.worksheets;
	await context.sync();
	// Try to restore the format from the hidden sheet.
	let currentWorksheet = worksheets.getActiveWorksheet();
	currentWorksheet.protection.unprotect();
	await context.sync();
	let newName = this.saved_original_sheetname(currentWorksheet.id);
	// If it's there already, restore it.
	try {
	    let newSheet = worksheets.getItem(newName);
	    let destRange = currentWorksheet.getRange("A1") as any;
	    newSheet.load(['name', 'format', 'address']);
	    await context.sync();
	    destRange.copyFrom(newSheet.name + "!" + this.startRange + ":" + newSheet.name + "!" + this.endRange, Excel.RangeCopyType.formats);
	    await context.sync();
	} catch(error) { console.log("restoreFormats: Nothing to restore: " + error); }
	await context.sync();
    }
    

    /// Colorize the formulas and data on the active sheet, saving the old formats so they can be later restored.
    setColor = async () => {
	Colorize.initialize();

	try {
	    OfficeExtension.config.extendedErrorLogging = true;
	    await Excel.run(async context => {
		let app = context.workbook.application;
		console.log('setColor: starting processing.');
		let startTime = performance.now();
		console.log('setColor: starting processing 1');
		let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		console.log('setColor: starting processing 2');
		currentWorksheet.load(['protection']);
		await context.sync(); // FOR DEBUGGING

 		console.log('setColor: protection status = ' + currentWorksheet.protection.protected);
		if (currentWorksheet.protection.protected) {
		    console.log("WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again.");
		    // Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
		    return;
		}

		console.log('setColor: starting processing 3');
		
		let usedRange = currentWorksheet.getUsedRange() as any;
		await context.sync(); // FOR DEBUGGING
		console.log('setColor: loaded used range');
		let everythingRange = currentWorksheet.getRange();
		await context.sync(); // FOR DEBUGGING
		console.log('setColor: loaded everything range');
		// Now get the addresses, the formulas, and the values.
//		usedRange.load(['address', 'formulas', 'values', 'format']);
		usedRange.load(['address']);
		await context.sync(); // FOR DEBUGGING
		console.log("setColor: loaded addresses from used range");
		usedRange.load(['formulas']);
		await context.sync(); // FOR DEBUGGING
		console.log("setColor: loaded formulas from used range");
		usedRange.load(['values']);
		await context.sync(); // FOR DEBUGGING
		console.log("setColor: loaded values from used range");
		usedRange.load(['format']);
		await context.sync(); // FOR DEBUGGING
		console.log("setColor: loaded formats from used range");

		/// Save the formats so they can later be restored.
		await this.saveFormats();

		// Now start colorizing.

		// Remove the background color from all cells.
		let rangeFill = usedRange.format.fill;
		rangeFill.clear();

		// Now we can get the formula ranges (all cells with formulas),
		// and the numeric ranges (all cells with numbers). These come in as 2-D arrays.
		let formulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas);
		let numericRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.constants,
									  Excel.SpecialCellValueType.numbers);
		
		let formulas = usedRange.formulas;
		let values = usedRange.values;
		
		// Make all numbers yellow; this will be the default value for unreferenced data.
		if (numericRanges) {
		    numericRanges.format.fill.color = '#eed202'; // "Safety Yellow"
		}

		let usedRangeAddress = usedRange.address;
		let [sheetName, startCell] = ExcelUtils.extract_sheet_cell(usedRangeAddress);
		let vec = ExcelUtils.cell_dependency(startCell, 0, 0);
		console.log("setColor: cell dependency = " + vec);
		let processed_formulas = Colorize.process_formulas(formulas, vec[0] - 1, vec[1] - 1);
		let processed_data = Colorize.color_all_data(formulas, processed_formulas, vec[0] - 1, vec[1] - 1);
		
		let grouped_data = Colorize.identify_groups(processed_data);
		let grouped_formulas = Colorize.identify_groups(processed_formulas);
		console.log("setColor: Grouped formulas: ");
		console.log(JSON.stringify(grouped_formulas));
		// For now, select the very first proposed fix.
		this.proposed_fixes = Colorize.generate_proposed_fixes(grouped_formulas);
		// Only present up to 5% (threshold from paper).
		let max_proposed_fixes = formulas.length; /// Math.round(0.05 * formulas.length);
		//this.proposed_fixes = this.proposed_fixes.slice(0, max_proposed_fixes);
		console.log("setColor: proposed_fixes = " + JSON.stringify(this.proposed_fixes));

		if (true) {
		    // Just color referenced data white.
		    this.process(grouped_data, currentWorksheet, (_: string) => { return '#FFFFFF'; }); // was FFFFFF FIXME
		} else {
		    // Color referenced data based on its formula's color.
		    this.process(grouped_data, currentWorksheet, (hash: string) => { return Colorize.get_light_color_version(Colorize.get_color(Math.round(parseFloat(hash)))); });
		}
		this.process(grouped_formulas, currentWorksheet, (hash: string) => { return Colorize.get_color(Math.round(parseFloat(hash))); });

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
	    console.log("Error: " + error);
	    if (error instanceof OfficeExtension.Error) { 
		console.log("Debug info: " + JSON.stringify(error.debugInfo)); 
	    }
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
				let usedRangeAddress = usedRange.address;
				console.log("address is " + usedRangeAddress);
				this.savedRange = usedRangeAddress;
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
		    console.log("Error: " + error);
		    if (error instanceof OfficeExtension.Error) { 
			console.log("Debug info: " + JSON.stringify(error.debugInfo)); 
		    }
		}
	}

	restoreFormatsAndColors = async () => {
	    OfficeExtension.config.extendedErrorLogging = true;
	    try {
		await Excel.run(async context => {
		    let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		    currentWorksheet.load(['name']);
		    await context.sync();
		    console.log("restoreFormatsAndColors: loaded names from current worksheet");
		    await this.restoreFormats(context);
		});
	    } catch (error) {
		console.log("Error: " + error);
		if (error instanceof OfficeExtension.Error) { 
		    console.log("Debug info: " + JSON.stringify(error.debugInfo)); 
		}
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
			    /*
				if (currentWorksheet.protection.protected) {
					// Office.context.ui.displayDialogAsync('https://localhost:3000/protected-sheet.html', { height: 20, width: 20 });
					return;
				}
			    */
				this.current_fix -= 1;
				if (this.current_fix < 0) {
					this.current_fix = 0;
				}
				let r = this.getRange(currentWorksheet, this.proposed_fixes, this.current_fix);
				r.select();
			});
		} catch (error) {
		    console.log("Error: " + error);
		    if (error instanceof OfficeExtension.Error) { 
			console.log("Debug info: " + JSON.stringify(error.debugInfo)); 
		    }
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
				this.current_fix++;
				if (this.current_fix >= this.proposed_fixes.length) {
					this.current_fix = this.proposed_fixes.length - 1;
				}
				let r = this.getRange(currentWorksheet, this.proposed_fixes, this.current_fix);
				r.select();
			});
		} catch (error) {
		    console.log("Error: " + error);
		    if (error instanceof OfficeExtension.Error) { 
			console.log("Debug info: " + JSON.stringify(error.debugInfo)); 
		    }
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
