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
    private proposed_fixes_length = 0;
    private current_fix = 0;
    private total_fixes = -1;
    private savedFormat: any = null;
    private savedRange: string = null;
    private originalSheetSuffix : string = "_EL";
    public state = {};
    private contentElement : any = null;
    private sheetName : string = "";
    
    constructor(props, context) {
	super(props, context);
	Colorize.initialize();
	this.state = {};
	this.contentElement = React.createRef();
    }

    private updateContent() : void {
	
	this.contentElement.current.setState({ sheetName: this.sheetName,
					       currentFix: this.current_fix,
					       totalFixes: this.total_fixes,
					       themFixes : this.proposed_fixes,
					       numFixes : this.proposed_fixes_length });
    }
    
    /// Get the saved formats for this sheet (by its unique identifier).
    private saved_original_sheetname(id: string) : string {
	return ExcelUtils.hash_sheet(id, 28) + this.originalSheetSuffix;
    }

    /// Color the ranges using the specified color function.
    private process(grouped_ranges, currentWorksheet, colorfn) {
	let g = JSON.parse(JSON.stringify(grouped_ranges)); // deep copy
	// Process the ranges.
	let hash_index = 0;
	Object.keys(grouped_ranges).forEach(hash => {
	    if (!(hash === undefined)) {
		let v = grouped_ranges[hash];
		for (let theRange of v) {
		    let r = theRange;
		    let col0 = ExcelUtils.column_index_to_name(r[0][0]);
		    let row0 = r[0][1];
		    let col1 = ExcelUtils.column_index_to_name(r[1][0]);
		    let row1 = r[1][1];

//		    console.log("process: about to get range " + col0 + row0 + ":" + col1 + row1);
		    let range = currentWorksheet.getRange(col0 + row0 + ':' + col1 + row1);
		    let color = colorfn(hash_index);
//		    console.log("color to set = " + color + " for hash = " + hash);
		    if (color == '#FFFFFF') {
			range.format.fill.clear();
		    } else {
			range.format.fill.color = color;
		    }
		}
		hash_index += 1;
	    }
	});
	console.log("done processing.");
    }

    
    saveFormats = async() => {
	OfficeExtension.config.extendedErrorLogging = true;
	await Excel.run(async context => {
	    // First, load the current worksheet's name and id.
	    let worksheets = context.workbook.worksheets;
	    // Make a new sheet corresponding to the current sheet (+ a suffix).
//	    console.log("saveFormats: loading current worksheet name");
	    let currentWorksheet = worksheets.getActiveWorksheet();
	    currentWorksheet.load(['name', 'id']);
	    await context.sync();
	    this.sheetName = currentWorksheet.name;

	    // Find any old backup sheet corresponding to this id.
	    let oldBackupName = this.saved_original_sheetname(currentWorksheet.id);
	    let oldBackupSheet = worksheets.getItemOrNullObject(oldBackupName);
	    await context.sync();

	    // Don't show the copied sheet.
	    // FIXME? Disabled to test to see if it resolves slow updating issue on Excel (Windows).
	    let app = context.workbook.application;
	    app.suspendScreenUpdatingUntilNextSync();

	    
	    // Now, generate a new backup sheet. This will take the place of the old backup, if any.
	    let newbackupSheet = currentWorksheet.copy("End");
	    newbackupSheet.visibility = Excel.SheetVisibility.veryHidden;
	    newbackupSheet.load(['name']);
	    // Ensure that we remain on the current worksheet.
	    // This addresses an apparent bug in the client product.
	    currentWorksheet.activate();
	    
	    await context.sync();
	    app.suspendScreenUpdatingUntilNextSync();

	    if (oldBackupSheet) {
		// There was an old backup sheet, which we now delete.
		// Note that we first have to set its visibility to "hidden" or else we can't delete it!
		oldBackupSheet.visibility = Excel.SheetVisibility.hidden;
		oldBackupSheet.delete();
		await context.sync();
	    }

	    // Finally, rename the backup sheet.
 	    newbackupSheet.name = this.saved_original_sheetname(currentWorksheet.id);

	    await context.sync();
	    console.log("saveFormats: copied out the formats");
	});
    }

    /// Restore formats from the saved hidden sheet corresponding to the active sheet's ID.
    restoreFormats = async(context) => {
	console.log("restoreFormats: begin");
	let startTime = performance.now();
	
	let worksheets = context.workbook.worksheets;
	// Try to restore the format from the hidden sheet.
	let currentWorksheet = worksheets.getActiveWorksheet();
	this.sheetName = "";
	try {
	    currentWorksheet.protection.unprotect();
	    await context.sync();
	} catch(error) {
	    console.log("WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again.");
	    return;
	}
	
	let backupName = this.saved_original_sheetname(currentWorksheet.id);
	// If it's there already, restore it.
	try {
	    let backupSheet = worksheets.getItemOrNullObject(backupName);
	    if (backupSheet) {
		let destRange = currentWorksheet.getUsedRange(false) as any;
//		let destRange = currentWorksheet.getRange("A1") as any;
		backupSheet.load(['format', 'address']);
		let usedRange = backupSheet.getUsedRange(false) as any;
		usedRange.load(['address']);
 		await context.sync();
		
		console.log("copying out " + JSON.stringify(usedRange.address));
		destRange.copyFrom(usedRange, Excel.RangeCopyType.formats);
 		await context.sync();
	    } else {
		console.log("restoreFormats: didn't find the sheet " + backupName);
	    }
	} catch(error) { console.log("restoreFormats: Nothing to restore: " + error); }
	this.proposed_fixes = [];
	this.total_fixes = -1;
	this.updateContent();
	await context.sync();
	console.log("restoreFormats: end");
	let endTime = performance.now();
	let timeElapsedMS = endTime - startTime;
	console.log('Time elapsed (ms) = ' + timeElapsedMS);
    }
    

    /// Colorize the formulas and data on the active sheet, saving the old formats so they can be later restored.
    setColor = async () => {

	try {
//	    OfficeExtension.config.extendedErrorLogging = true;
	    await Excel.run(async context => {
		console.log('setColor: starting processing.');
		let startTime = performance.now();
		console.log('setColor: starting processing 1');
		let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		console.log('setColor: starting processing 2');
		currentWorksheet.load(['protection']);
		await context.sync();

// 		console.log('setColor: protection status = ' + currentWorksheet.protection.protected);
		if (currentWorksheet.protection.protected) {
		    console.log("WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again.");
		    return;
		}

		// Disable calculation for now.
		let app = context.workbook.application;
		app.load(['calculationMode']);
		await context.sync();
		
		let originalCalculationMode = app.calculationMode;
		app.calculationMode = 'Manual';

		console.log('setColor: starting processing 3');
		
		let usedRange = currentWorksheet.getUsedRange(false) as any; // FIXME was false! testing for perf
		usedRange.load(['address']);
		await context.sync();
//		console.log("setColor: usedRange = " + JSON.stringify(usedRange.address));

		/*
		let condFormats = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.conditionalFormats);
		await context.sync();
		if (condFormats) {
		    condFormats.load(['cellValue']);
		    await context.sync();
		    
		    condFormats.cellValue.load(['format']);
		    await context.sync();
		    condFormats.cellValue.format.clear();
		    
                }
		*/
		
//		await context.sync(); // FOR DEBUGGING
		//		console.log('setColor: loaded used range');
		if (true) {
		    usedRange.load(['formulas', 'values', 'format']);
		    await context.sync();
		    console.log("setColor: loaded everything from used range");
		} else {
		    usedRange.load(['formulas']);
		    await context.sync(); // FOR DEBUGGING
		    
		    console.log("setColor: loaded formulas from used range");
		    
		    usedRange.load(['values']);
		    await context.sync(); // FOR DEBUGGING
		    
		    console.log("setColor: loaded values from used range");
		    
		    usedRange.load(['format']);
		    await context.sync(); // FOR DEBUGGING
		    
		    console.log("setColor: loaded formats from used range");
		}

		/// Save the formats so they can later be restored.
		await this.saveFormats();

		// Now start colorizing.

		// Remove the background color from all cells.
		app.suspendScreenUpdatingUntilNextSync();
		
		let rangeFill = usedRange.format.fill;
		rangeFill.clear();

//		await context.sync();
//  		console.log("cleared background color");

		// Now we can get the formula ranges (all cells with formulas),
		// and the numeric ranges (all cells with numbers). These come in as 2-D arrays.
		let formulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas);
 		let numericRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.constants,
									  Excel.SpecialCellValueType.numbers);
 		let numericFormulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas,
									  Excel.SpecialCellValueType.numbers);
		await context.sync();
		console.log("got all ranges.");
		app.suspendScreenUpdatingUntilNextSync();

		let formulas = usedRange.formulas;
		let values = usedRange.values;

		// usedRange.format.fill.color = '#eed202';

		// Make all numbers yellow; this will be the default value for unreferenced data.
		if (numericRanges) {
		    numericRanges.format.fill.color = '#eed202'; // "Safety Yellow"
		}
		    
		if (numericFormulaRanges) {
		    numericFormulaRanges.format.fill.color = '#eed202'; // "Safety Yellow"
		}

   		console.log("set numbers to yellow");
		
		let usedRangeAddress = usedRange.address;
		let [sheetName, startCell] = ExcelUtils.extract_sheet_cell(usedRangeAddress);
		let vec = ExcelUtils.cell_dependency(startCell, 0, 0);
 		console.log("setColor: cell dependency = " + vec);

		let processed_formulas = Colorize.process_formulas(formulas, vec[0] - 1, vec[1] - 1);
		console.log("processed formulas.");
		let processed_data = Colorize.color_all_data(formulas, processed_formulas, vec[0] - 1, vec[1] - 1);
		console.log("processed data.");
		
		let grouped_data = Colorize.identify_groups(processed_data);
		console.log("identified groups.");
		let grouped_formulas = Colorize.identify_groups(processed_formulas);
		console.log("setColor: Grouped formulas: ");
		
//		console.log(JSON.stringify(grouped_formulas));
		// For now, select the very first proposed fix.
		this.proposed_fixes = Colorize.generate_proposed_fixes(grouped_formulas);
		console.log("generated fixes.");
		// Only present up to 5% (threshold from paper).
		let max_proposed_fixes = formulas.length; /// Math.round(0.05 * formulas.length);
		this.total_fixes = max_proposed_fixes;
		//this.proposed_fixes = this.proposed_fixes.slice(0, max_proposed_fixes);
//		console.log("setColor: proposed_fixes = " + JSON.stringify(this.proposed_fixes));
		this.proposed_fixes_length = Colorize.count_proposed_fixes(this.proposed_fixes);
//		console.log("setColor: length = " + this.proposed_fixes_length);
//		console.log("done with proposed fixes (" + formulas.length + ")");
		
		if (true) {
		    // Just color referenced data white. (now gray!)
		    this.process(grouped_data, currentWorksheet, (_: string) => { return '#D3D3D3'; }); // was FFFFFF FIXME
//		    console.log("YADA");
		} else {
		    // Color referenced data based on its formula's color.
		    this.process(grouped_data, currentWorksheet, (hash: string) => { return Colorize.get_light_color_version(Colorize.get_color(Math.round(parseFloat(hash)))); });
		}
//		console.log("processed data.");
		this.process(grouped_formulas, currentWorksheet, (hash: string) => { return Colorize.get_color(Math.round(parseFloat(hash))); });
 		await context.sync(); // DEBUG
//		console.log("processed formulas.");

/*
		for (let i = 0; i < this.proposed_fixes.length; i++) {
		    let r = this.getRange(currentWorksheet, this.proposed_fixes, i);
		    r.load(['format']);
		    await context.sync();
		    r.border.set({ 'weight': 'Thin', 'style' : 'Continuous', 'tintAndShade' : -1});
		}
*/
		
		this.current_fix = -1;
		/*
		let r = this.getRange(currentWorksheet, this.proposed_fixes, this.current_fix);
		// Only select if the range is non-null and the number of total fixes is more than 0
		// (In principle, those checks should be redundant.)
		if (r && this.total_fixes > 0) {
		    r.select();
		}
		*/
//		await context.sync(); // DEBUG
		//		console.log("setColor: got range to select.");
		
		// Protect the sheet against changes.
		currentWorksheet.protection.protect();
 		await context.sync();
		
		console.log('ExceLint: done with sync 3.');
		this.updateContent();
		await context.sync();

		// Restore original calculation mode.
//		app.calculationMode = 'Automatic';
		app.calculationMode = originalCalculationMode;

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
	    let [ col0, row0, col1, row1 ] = ExcelUtils.get_rectangle(proposed_fixes, current_fix);
	    let range = currentWorksheet.getRange(col0 + row0 + ":" + col1 + row1);
	    return range;
	} else {
	    return null;
	}
    }
    
	restoreFormatsAndColors = async () => {
//	    OfficeExtension.config.extendedErrorLogging = true;
	    try {
		await Excel.run(async context => {
//		    let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
/*
		    currentWorksheet.load(['name']);
		    await context.sync();
		    console.log("restoreFormatsAndColors: loaded names from current worksheet");
*/
		    await this.restoreFormats(context);
		});
	    } catch (error) {
		console.log("Error: " + error);
		if (error instanceof OfficeExtension.Error) { 
		    console.log("Debug info: " + JSON.stringify(error.debugInfo)); 
		}
	    }
	}

	selectFix = async (currentFix) => {
	    console.log("selectFix " + currentFix);
	    try {
		await Excel.run(async context => {
		    if (this.total_fixes == -1) {
			await this.restoreFormats(context);
			await this.setColor();
 		    }
		    if (currentFix == -1) {
			this.current_fix = -1;
			this.updateContent();
			return;
		    }
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
		    let r = this.getRange(currentWorksheet, this.proposed_fixes, currentFix);
		    if (r) {
			r.select();
		    }
		    this.current_fix = currentFix;
		    this.updateContent();
		    /*
		      this.contentElement.current.setState({ currentFix: currentFix,
		      totalFixes: this.total_fixes,
		      themFixes : this.proposed_fixes });
		    */
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
					message='Initializing...'
				/>
			);
		}

		return (
			<div className='ms-welcome'>
				<Header title='ExceLint' />
			<Content ref={this.contentElement} message1='Click to reveal the deep structure of this spreadsheet.' buttonLabel1='Reveal structure' click1={this.setColor}
					message2='Click to restore previous colors and borders.' buttonLabel2='Restore' click2={this.restoreFormatsAndColors}
		    sheetName="" currentFix={this.current_fix} totalFixes={this.total_fixes} themFixes={this.proposed_fixes} selector={this.selectFix} numFixes={this.proposed_fixes_length} />
		
			</div>
		);
	}
}
