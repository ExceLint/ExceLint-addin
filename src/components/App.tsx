/* global Office, Excel */

import * as React from 'react';
import { Header } from './Header';
import { Content } from './Content';
import Progress from './Progress';
import { Colorize } from './colorize';
import { ExcelUtils } from './excelutils';
import { RectangleUtils } from './rectangleutils';
import { Timer } from './timer';

import * as OfficeHelpers from '@microsoft/office-js-helpers';

export interface AppProps {
    title: string;
    isOfficeInitialized: boolean;
}

export interface AppState {
}

export default class App extends React.Component<AppProps, AppState> {

    private proposed_fixes = []; //  Array<[number, [[number, number], [number, number]], [[number, number], [number, number]]]> = [];
    private proposed_fixes_length = 0;
    private suspicious_cells : Array<[number, number, number]> = [];
    private current_suspicious_cell = -1;
    private current_fix = -1;
    private total_fixes = -1;
    private savedFormat: any = null;
    private savedRange: string = null;
    public state = {};
    private contentElement : any = null;
    private sheetName : string = "";

    private numericFormulaRangeThreshold = 10000;
    private numericRangeThreshold = 10000;
    private formulasThreshold = 10000;
    private valuesThreshold = 10000;
//    private suspiciousCellsThreshold = 1 - Colorize.suspiciousCellsReportingThreshold / 100; // Must be more rare than this fraction.
    
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
					       numFixes : this.proposed_fixes_length,
					       suspiciousCells : this.suspicious_cells,
					       currentSuspiciousCell : this.current_suspicious_cell });
    }

    private adjust_proposed_fixes(fixes, propertiesToGet, origin_col, origin_row) : any
    {
	return Colorize.adjust_proposed_fixes(fixes, propertiesToGet, origin_col, origin_row);
    }
    
    // Discount the score of proposed fixes that cross formatting regimes (e.g., different colors).
    adjust_fix_scores = async(context, backupSheet, origin_col, origin_row) => {
	let t = new Timer("adjust_fix_scores");
	const fixes = this.proposed_fixes;

	let usedRange = backupSheet.getUsedRange(false) as any;
	
//	const cell = context.workbook.getActiveCell();

	// Define the cell properties to get by setting the matching LoadOptions to true.
	const propertiesToGet = usedRange.getCellProperties({ // cell.getCellProperties({
	    numberFormat : true,
            format: {
		fill: {
                    color: true
		},
		border: {
		    color: true,
		    style: true,
		    weight: true
		},
		font: {
                    color: true,
		    style: true,
		    weight: true,
		    bold: true,
		    italic: true,
		    name: true
		}
            },
	});
	
	// Sync to get the data from the workbook.
	await context.sync();
	t.split("got formatting info.");
	
//	console.log(JSON.stringify(propertiesToGet.value));
	this.proposed_fixes = this.adjust_proposed_fixes(fixes, propertiesToGet, origin_col, origin_row);
	t.split("done.");
    }


    /// Color the ranges using the specified color function.
    private color_ranges(grouped_ranges, currentWorksheet, colorfn, otherfn) {
	const g = JSON.parse(JSON.stringify(grouped_ranges)); // deep copy
	// Process the ranges.
	let hash_index = 0;
	Object.keys(grouped_ranges).forEach(hash => {
	    if (!(hash === undefined)) {
		const v = grouped_ranges[hash];
		//		console.log("v = " + JSON.stringify(v));
		for (let theRange of v) {
		    const rangeStr = ExcelUtils.make_range_string(theRange);
		    let range = currentWorksheet.getRange(rangeStr);
		    if (range.length === 0) {
			continue;
		    }
		    const color = colorfn(hash_index);
		    if (color == '#FFFFFF') {
			range.format.fill.clear();
		    } else {
			// console.log("setting " + rangeStr + " to " + color);
			range.format.fill.color = color;
		    }
		    otherfn();
		}
		hash_index += 1;
	    }
	});
	console.log("done processing.");
    }


    saveFormats = async(wasPreviouslyProtected) => {
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
	    const oldBackupName = ExcelUtils.saved_original_sheetname(currentWorksheet.id);
	    let oldBackupSheet = worksheets.getItemOrNullObject(oldBackupName);
	    await context.sync();

	    if (!oldBackupSheet.isNullObject) {
		// There was an old backup sheet, which we now delete.
		// Note that we first have to set its visibility to "hidden" or else we can't delete it!
		oldBackupSheet.visibility = Excel.SheetVisibility.hidden;
		oldBackupSheet.delete();
		await context.sync();
		//		return;
	    }

	    // Don't show the copied sheet.
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

	    // Finally, rename the backup sheet.
 	    newbackupSheet.name = ExcelUtils.saved_original_sheetname(currentWorksheet.id);
	    // If the original sheet was protected, protect the backup, too
	    // (we use this to restore the original protection later, if needed).
	    if (wasPreviouslyProtected) {
		newbackupSheet.protection.protect();
	    }

	    await context.sync();
	    console.log("saveFormats: copied out the formats");
	});
    }

    /// Restore formats from the saved hidden sheet corresponding to the active sheet's ID.
    restoreFormats = async() => {
	try {
	    await Excel.run(async context => {
		console.log("restoreFormats: begin");
		let t = new Timer("restoreFormats");
		
		let worksheets = context.workbook.worksheets;
		let currentWorksheet = worksheets.getActiveWorksheet();
		this.sheetName = "";
		currentWorksheet.load(['protection','id']);
		await context.sync();

		// If the backup is there, restore it.
		let backupName = ExcelUtils.saved_original_sheetname(currentWorksheet.id);
		try {
		    let backupSheet = worksheets.getItemOrNullObject(backupName);
		    await context.sync();
		    console.log("backupSheet = " + JSON.stringify(backupSheet));
		    if (!backupSheet.isNullObject) {
			// First, try to unprotect the current worksheet so we can restore into it.
			try {
			    currentWorksheet.protection.unprotect();
			    await context.sync();
			} catch(error) {
			    console.log("WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again.");
			    return;
			}
			// Get the current used range.
			let destRange = currentWorksheet.getUsedRange(false) as any;
			
			// Clear all formatting.
			destRange.load(['format']);
			await context.sync();
			destRange.format.fill.clear();
			await context.sync();
			
			// Now get the used range again (the idea
			// being that clearing the formats will
			// potentially reduce the used range size).
			destRange = currentWorksheet.getUsedRange(false) as any;
			
			// Grab the backup sheet info.
			backupSheet.load(['format', 'address', 'protection']);
			// Save previous protection status.
			await context.sync();
			const wasPreviouslyProtected = backupSheet.protection.protected;
			backupSheet.protection.unprotect();
			
			let backupSheetUsedRange = backupSheet.getUsedRange(false) as any;
			backupSheetUsedRange.load(['address']);
 			await context.sync();

			// Now copy it all into the original worksheet.
			console.log("copying out " + JSON.stringify(backupSheetUsedRange.address));
			// destRange.copyFrom(backupSheetUsedRange, Excel.RangeCopyType.formats); // FIX ME FIXME WAS THIS
			destRange.copyFrom(backupSheetUsedRange, Excel.RangeCopyType.all); // used for restoring VALUES FIXME NOT NEEDED IN GENERAL
 			await context.sync();
			// We are done with the backup sheet: delete it.
			backupSheet.visibility = Excel.SheetVisibility.hidden;
			backupSheet.delete();

			// If the original sheet was protected (which
			// we know because we protected the backup),
			// restore that protection.
			
			if (wasPreviouslyProtected) {
			    currentWorksheet.protection.protect();
			} else {
			    currentWorksheet.protection.unprotect();
			}
			
 			await context.sync();
		    } else {
			console.log("restoreFormats: didn't find the sheet " + backupName);
		    }
		} catch(error) { console.log("restoreFormats: Nothing to restore: " + error); }
		this.proposed_fixes = [];
		this.suspicious_cells = [];
		this.current_fix = -1;
		this.current_suspicious_cell = -1;
		this.total_fixes = -1;
		this.updateContent();
		await context.sync();
		t.split("end");
	    });
	} catch (error) {
	    console.log("Error: " + error);
	    if (error instanceof OfficeExtension.Error) { 
		console.log("Debug info: " + JSON.stringify(error.debugInfo)); 
	    }
	}
    }
   

    /// Colorize the formulas and data on the active sheet, saving the old formats so they can be later restored.
    setColor = async () => {

	try {
	    //	    OfficeExtension.config.extendedErrorLogging = true;
	    await Excel.run(async context => {
		console.log('setColor: starting processing.');
		let t = new Timer("setColor");
		let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
		currentWorksheet.load(['protection']);
		await context.sync();
		t.split("got protection");

		// 		console.log('setColor: protection status = ' + currentWorksheet.protection.protected);
		const wasPreviouslyProtected = currentWorksheet.protection.protected;
		console.log("setColor: previously protected? = " + wasPreviouslyProtected);
		try {
		    currentWorksheet.protection.unprotect();
		    await context.sync();
		} catch(error) {
		    console.log("WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again.");
		    return;
		}
		
		/// Save the formats so they can later be restored.
		await this.saveFormats(wasPreviouslyProtected);

		// Disable calculation for now.
		let app = context.workbook.application;
		app.load(['calculationMode']);
		await context.sync();
		t.split("got calc mode");
		
		let originalCalculationMode = app.calculationMode;
		app.calculationMode = 'Manual';

		let usedRange = currentWorksheet.getUsedRange(false) as any;
		usedRange.load(['address','values']);
		await context.sync();
		t.split("got address");
		
//		let displayComments = false;

/*

		    // Display all the named ranges (this should eventually be sent over for processing).
		    // See https://docs.microsoft.com/en-us/javascript/api/excel/excel.nameditemcollection?view=office-js
		    currentWorksheet.load(['names']);
		    await context.sync();
		    currentWorksheet.names.load(['items']);
		    await context.sync();
		    console.log(JSON.stringify(currentWorksheet.names.items));
*/
		
		usedRange.load(['formulas', 'format']);
		await context.sync();
		t.split("load from used range = " + usedRange.address);

		// Now start colorizing.
		
		// Turn off screen updating and calculations while this is happening.
 		app.suspendScreenUpdatingUntilNextSync();
		app.suspendApiCalculationUntilNextSync();

		// Compute the number of cells in the range "usedRange".
		const usedRangeAddresses = ExcelUtils.extract_sheet_range(usedRange.address);
		const upperLeftCorner = ExcelUtils.cell_dependency(usedRangeAddresses[1], 0, 0);
		const lowerRightCorner = ExcelUtils.cell_dependency(usedRangeAddresses[2], 0, 0);
		const numberOfCellsUsed = RectangleUtils.area([upperLeftCorner, lowerRightCorner]);
		
		let useNumericFormulaRanges = false;

		// EDB 10 June 2019: HACK. Getting numeric formula
		// ranges is shockingly slow -- an order of magnitude
		// slower than getting numeric ranges -- so we only do
		// it when it takes less than a second (though that is
		// total guesswork). Arbitrary threshold for now.
		// Revisit if this gets fixed...
 		if (numberOfCellsUsed < this.numericFormulaRangeThreshold) {
		    // Activate using numeric formula ranges when
		    // there aren't "too many" cells.
		    useNumericFormulaRanges = true;
		} else {
		    console.log("Too many cells to use numeric formula ranges.");
		}
		
		let numericFormulaRanges = null;
		if (useNumericFormulaRanges) {
		    numericFormulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas,
										 Excel.SpecialCellValueType.numbers);
		    await context.sync();
		    t.split("got numeric formula ranges");
		}

		let numericRanges = null;

		console.log("number of cells used = " + numberOfCellsUsed);
		
		if (numberOfCellsUsed < this.numericRangeThreshold) { // Check number of cells, as above.
		    // For very large spreadsheets, this takes AGES.
 		    numericRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.constants,
									  Excel.SpecialCellValueType.numbers);
		    await context.sync();
		    t.split("got numeric ranges");
		} else {
		    console.log("Too many cells to use numeric ranges.");
		}

	
		const usedRangeAddress = usedRange.address;
		const formulas         = usedRange.formulas;
		const values           = usedRange.values;

		///// from here, move out //////

		const [sheetName, startCell] = ExcelUtils.extract_sheet_cell(usedRangeAddress);
		const origin = ExcelUtils.cell_dependency(startCell, 0, 0);
		t.split("computed cell dependency for start");

		let processed_formulas = [];
		if (formulas.length > this.formulasThreshold) {
		    console.log("Too many formulas to perform formula analysis.");
		} else {
		
		    t.split("about to process formulas");
		    
		    processed_formulas = Colorize.process_formulas(formulas, origin[0] - 1, origin[1] - 1);
		    t.split("processed formulas");
		}
		const useTimeouts = false;
		
		
		let referenced_data = [];
		let data_values = [];
		const cols = values.length;
		const rows = values[0].length;
		
		if (values.length > this.valuesThreshold) {
		    console.log("Too many values to perform reference analysis.");
		} else {
		    
		    // Compute references (to color referenced data).
		    const refs = ExcelUtils.generate_all_references(formulas, origin[0] - 1, origin[1] - 1);
		    t.split("generated all references");
//		    console.log("refs = " + JSON.stringify(refs));

		    if (useTimeouts) { await setTimeout(() => {}, 0); }
		    
		    referenced_data = Colorize.color_all_data(refs);
		    // console.log("referenced_data = " + JSON.stringify(referenced_data));
		    data_values = Colorize.process_values(values, formulas, origin[0] - 1, origin[1] - 1);

		    t.split("processed data");
		    if (useTimeouts) { await setTimeout(() => {}, 0); }
		}

		const grouped_data = Colorize.identify_groups(referenced_data);

		t.split("identified groups");

		const grouped_formulas = Colorize.identify_groups(processed_formulas);
		t.split("grouped formulas");

		if (useTimeouts) { await setTimeout(() => {}, 0); }
		
		// Identify suspicious cells.
		this.suspicious_cells = [];

		if (values.length < 10000) {
		    this.suspicious_cells = Colorize.find_suspicious_cells(cols, rows, origin, formulas, processed_formulas, data_values, 1 - Colorize.getReportingThreshold() / 100); // Must be more rare than this fraction.
		}

		////// to here, should be clear without timeouts.


		
		/// Finally, apply colors.
		
		// Remove the background color from all cells.
 		let rangeFill = usedRange.format.fill;
		rangeFill.clear();
		
		// Make all numbers yellow; this will be the default value for unreferenced data.
		if (numericRanges) {
		    numericRanges.format.fill.color = '#eed202'; // "Safety Yellow"
		}

		// Color numeric formulas yellow as well, if this is on.
		if (false) {
		    if (useNumericFormulaRanges && numericFormulaRanges) {
			numericFormulaRanges.format.fill.color = '#eed202'; // "Safety Yellow"
		    }
		}
		
		// Just color referenced data gray.
		this.color_ranges(grouped_data, currentWorksheet, (_: string) => { return '#D3D3D3'; }, ()=>{});

		// And color the formulas.
		this.color_ranges(grouped_formulas, currentWorksheet, (hash: string) => { return Colorize.get_color(Math.round(parseFloat(hash))); }, ()=>{});

		// Color referenced data based on its formula's color.
		// DISABLED.
		///    this.color_ranges(grouped_data, currentWorksheet, (hash: string) => { return Colorize.get_light_color_version(Colorize.get_color(Math.round(parseFloat(hash)))); }, ()=>{});

		await context.sync();

		//		console.log(JSON.stringify(usedRange.formulasR1C1));
		t.split("saved formats");
		
		// Grab the backup sheet for use in looking up the formats.
		const backupSheetname = ExcelUtils.saved_original_sheetname(currentWorksheet.id);
		let worksheets = context.workbook.worksheets;
		let backupSheet = worksheets.getItemOrNullObject(backupSheetname);
		await context.sync();

		t.split("about to iterate through fixes.");
		
		this.proposed_fixes = Colorize.generate_proposed_fixes(grouped_formulas);

		if (this.proposed_fixes.length > 0) {
		    t.split("about to adjust scores.");

		    // Adjust the fix scores (downward) to take into account formatting in the original sheet.
		    await this.adjust_fix_scores(context, backupSheet, origin[0] - 1, origin[1] - 1);

		    t.split("sorting fixes.");
		
		    this.proposed_fixes.sort((a, b) => { return a[0] - b[0]; });
		
		    t.split("generated fixes");
		}
		
		this.total_fixes = formulas.length;
		this.proposed_fixes_length = this.proposed_fixes.length;

		//		app.suspendScreenUpdatingUntilNextSync();
		t.split("processed formulas");

		this.current_fix = -1;
		this.current_suspicious_cell = -1;
		
		// Protect the sheet against changes.
		currentWorksheet.protection.protect();
		
		this.updateContent();

		// Restore original calculation mode.
		app.calculationMode = originalCalculationMode;


		await context.sync();

		/*		let currName = currentWorksheet.name;
				currentWorksheet.onChanged.add((eventArgs) => { Excel.run((context) => { context.workbook.worksheets.getActiveWorksheet().name = currName; await context.sync(); }); }); */

		t.split("done");

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
	    let rangeStr = col0 + row0 + ":" + col1 + row1;
//	    console.log("getRange: " + rangeStr);
	    let range = currentWorksheet.getRange(rangeStr);
	    return range;
	} else {
	    return null;
	}
    }

    selectFix = async (currentFix) => {
	console.log("selectFix " + currentFix);
	try {
	    await Excel.run(async context => {
		if (this.total_fixes == -1) {
		    await this.restoreFormats();
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
//		console.log(this.proposed_fixes);
		let r = this.getRange(currentWorksheet, this.proposed_fixes, currentFix);
		if (r) {
		    r.select();
		}
		this.current_fix = currentFix;
		this.current_suspicious_cell = -1;
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

    selectCell = async (currentCell) => {
	console.log("selectCell " + currentCell);
	try {
	    await Excel.run(async context => {
		if (this.suspicious_cells.length == 0) {
		    await this.restoreFormats();
		    await this.setColor();
 		}
		if (currentCell == -1) {
		    this.current_suspicious_cell = -1;
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
//		console.log("suspicious cells + " + JSON.stringify(this.suspicious_cells));

		const col = this.suspicious_cells[currentCell][0];
		const row = this.suspicious_cells[currentCell][1];
		let rangeStr = ExcelUtils.column_index_to_name(col) + row;
		rangeStr = rangeStr + ":" + rangeStr;
		let r = currentWorksheet.getRange(rangeStr);
		if (r) {
		    r.select();
		}
		this.current_suspicious_cell = currentCell;
		this.current_fix = -1;
		this.updateContent();
		console.log("setting is now " + this.current_suspicious_cell);
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
	    message2='Click to restore previous colors and borders.' buttonLabel2='Restore' click2={this.restoreFormats}
	    sheetName="" currentFix={this.current_fix} totalFixes={this.total_fixes} themFixes={this.proposed_fixes} selector={this.selectFix} numFixes={this.proposed_fixes_length} suspiciousCells={this.suspicious_cells} cellSelector={this.selectCell} currentSuspiciousCell={this.current_suspicious_cell} />
		
	    </div>
	);
    }
}
