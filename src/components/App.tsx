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

    adjust_fix_scores = async(context, backupSheet, origin_col, origin_row) => {
	const fixes = this.proposed_fixes;
	this.proposed_fixes = [];

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

//	console.log(JSON.stringify(propertiesToGet.value));
	
	for (let k in fixes) {
	    // Format of proposed fixes =, e.g., [-3.016844756293869, [[5,7],[5,11]],[[6,7],[6,11]]]
	    // entropy, and two ranges:
	    //    upper-left corner of range (column, row), lower-right corner of range (column, row)
	    
//	    console.log("fix = " + JSON.stringify(fixes[k]));
	    
	    let score = fixes[k][0];

	    // Skip fixes whose score is already below the threshold.
	    if (-score < (Colorize.reportingThreshold / 100)) {
		continue;
	    }
	    
	    // Sort the fixes.
	    // This is a pain because if we don't pad appropriately, [1,9] is "less than" [1,10]. (Seriously.)
	    // So we make sure that numbers are always left padded with zeroes to make the number 10 digits long
	    // (which is 1 more than Excel needs right now).
	    const firstPadded  = fixes[k][1].map((a) => a.toString().padStart(10,'0'));
	    const secondPadded = fixes[k][2].map((a) => a.toString().padStart(10,'0'));
	    
	    const first  = (firstPadded < secondPadded) ? fixes[k][1] : fixes[k][2];
	    const second = (firstPadded < secondPadded) ? fixes[k][2] : fixes[k][1];

	    const [[ax1, ay1], [ax2, ay2]] = first;
	    const [[bx1, by1], [bx2, by2]] = second;
	    
	    const col0 = ax1 - origin_col - 1; // ExcelUtils.column_index_to_name(ax1);
	    const row0 = ay1 - origin_row - 1; //.toString();
	    const col1 = bx2 - origin_col - 1; // ExcelUtils.column_index_to_name(bx2);
	    const row1 = by2 - origin_row - 1; // .toString();

//	    console.log("length = " + propertiesToGet.value.length);
//	    console.log("width = " + propertiesToGet.value[0].length);
	    let sameFormats = true;
	    const firstFormat = JSON.stringify(propertiesToGet.value[row0][col0]);
//	    console.log(firstFormat);
//	    console.log(JSON.stringify(fixes));
	    for (let i = row0; i <= row1; i++) {
		for (let j = col0; j <= col1; j++) {
//		    		    console.log("checking " + i + ", " + j);
		    const str = JSON.stringify(propertiesToGet.value[i][j]);
//		    console.log(str);
		    if (str !== firstFormat) {
			sameFormats = false;
			break;
		    }
		}
	    }
//	    const sameFormats = propertiesToGet.value.every((val,_,arr) => { return val.every((v,_,__) => { return JSON.stringify(v) === JSON.stringify(arr[0][0]); }); })

//	    console.log("sameFormats? " + sameFormats);
	    if (!sameFormats) {
		score = score * 0.5; // This should be parameterized; plus we could have more nuance...
	    }
	    this.proposed_fixes.push([score, first, second]);
	}
    }


    /// Get the saved formats for this sheet (by its unique identifier).
    private saved_original_sheetname(id: string) : string {
	return ExcelUtils.hash_sheet(id, 28) + this.originalSheetSuffix;
    }

    /// Color the ranges using the specified color function.
    private process(grouped_ranges, currentWorksheet, colorfn, otherfn) {
	const g = JSON.parse(JSON.stringify(grouped_ranges)); // deep copy
	// Process the ranges.
	let hash_index = 0;
	Object.keys(grouped_ranges).forEach(hash => {
	    if (!(hash === undefined)) {
		const v = grouped_ranges[hash];
		//		console.log("v = " + JSON.stringify(v));
		for (let theRange of v) {
		    const r = theRange;
		    const col0 = r[0][0];
		    const row0 = r[0][1];
		    const col1 = r[1][0];
		    const row1 = r[1][1];

		    if ((col0 === 0) && (row0 === 0) && (r[0][2] != 0)) {
			// Not a real dependency. Skip.
			console.log("NOT A REAL DEPENDENCY: " + col1 + "," + row1);
			continue;
		    }
		    if ((col0 < 0) || (row0 < 0) || (col1 < 0) || (row1 < 0)) {
			// Defensive programming.
			console.log("WARNING: FOUND NEGATIVE VALUES.");
			continue;
		    }
		    
		    const colname0 = ExcelUtils.column_index_to_name(col0);
		    const colname1 = ExcelUtils.column_index_to_name(col1);
		    //		    console.log("process: about to get range " + colname0 + row0 + ":" + colname1 + row1);
		    const rangeStr = colname0 + row0 + ':' + colname1 + row1;
		    let range = currentWorksheet.getRange(rangeStr);
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


    saveFormats = async() => {
	//	OfficeExtension.config.extendedErrorLogging = true;
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
	    const oldBackupName = this.saved_original_sheetname(currentWorksheet.id);
	    let oldBackupSheet = worksheets.getItemOrNullObject(oldBackupName);
	    await context.sync();

	    if (oldBackupSheet) {
		// There was an old backup sheet, which we now delete.
		// Note that we first have to set its visibility to "hidden" or else we can't delete it!
		oldBackupSheet.visibility = Excel.SheetVisibility.hidden;
		oldBackupSheet.delete();
		//		await context.sync();
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

	    // Finally, rename the backup sheet.
 	    newbackupSheet.name = this.saved_original_sheetname(currentWorksheet.id);

	    await context.sync();
	    console.log("saveFormats: copied out the formats");
	});
    }

    /// Restore formats from the saved hidden sheet corresponding to the active sheet's ID.
    restoreFormats = async(context) => {
	console.log("restoreFormats: begin");
	let t = new Timer("restoreFormats");
	
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
		// Get the current used range.
		let destRange = currentWorksheet.getUsedRange(false) as any;
		
		// Clear all formatting.
		destRange.load(['format']);
		await context.sync();
		destRange.format.fill.clear();

		await context.sync();
		// Now get the used range again.
		destRange = currentWorksheet.getUsedRange(false) as any;

		// Grab the backup sheet info.
		backupSheet.load(['format', 'address']);
		let backupSheetUsedRange = backupSheet.getUsedRange(false) as any;
		backupSheetUsedRange.load(['address']);
 		await context.sync();

		console.log("copying out " + JSON.stringify(backupSheetUsedRange.address));
		// destRange.copyFrom(backupSheetUsedRange, Excel.RangeCopyType.formats); // FIX ME FIXME WAS THIS
		destRange.copyFrom(backupSheetUsedRange, Excel.RangeCopyType.all); // used for restoring VALUES FIXME NOT NEEDED IN GENERAL
 		await context.sync();
	    } else {
		console.log("restoreFormats: didn't find the sheet " + backupName);
	    }
	} catch(error) { console.log("restoreFormats: Nothing to restore: " + error); }
	this.proposed_fixes = [];
	this.total_fixes = -1;
	this.updateContent();
	await context.sync();
	t.split("end");
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
		if (currentWorksheet.protection.protected) {
		    console.log("WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again.");
		    return;
		}

		/// Save the formats so they can later be restored.
		await this.saveFormats();

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
		
		console.log(JSON.stringify(usedRange.values[0][0]));
		let displayComments = false;

		// Use the upper-left hand corner of the used range as
		// an "Easter Egg" to unlock certain functionality.
		
		if (usedRange.values[0][0] === 42) {
		    displayComments = true;
		}

		if (displayComments) {
		    // Test.
		    /*		    const sheet = context.workbook.worksheets.getItem("Comments");
		    // currentWorksheet.load(['comments']);
		    sheet.comments.add("A COMMENT", "A1");
		    */
		    console.log("A comment!");

		    // Display all the named ranges (this should eventually be sent over for processing).
		    // See https://docs.microsoft.com/en-us/javascript/api/excel/excel.nameditemcollection?view=office-js
		    currentWorksheet.load(['names']);
		    await context.sync();
		    currentWorksheet.names.load(['items']);
		    await context.sync();
		    console.log(JSON.stringify(currentWorksheet.names.items));
		}
		
		// 		app.suspendScreenUpdatingUntilNextSync();
		

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
		    usedRange.load(['formulas', 'format', 'values']); // FIX ME FIX ME REMOVE VALUES LATER
		    // usedRange.load(['formulas', 'format', 'formulasR1C1']);
		    await context.sync();
		    t.split("load from used range = " + usedRange.address);
		} else {
		    usedRange.load(['formulas']);
		    await context.sync(); // FOR DEBUGGING

		    t.split("loaded formulas from used range");
		    
		    usedRange.load(['format']);
		    await context.sync(); // FOR DEBUGGING
		    
		    t.split("loaded formats from used range");
		}

		// Now start colorizing.
		
		// Turn off screen updating and calculations while this is happening.
 		app.suspendScreenUpdatingUntilNextSync();
		app.suspendApiCalculationUntilNextSync();

		// Compute the number of cells in the range "usedRange".
		const usedRangeAddresses = ExcelUtils.extract_sheet_range(usedRange.address);
		console.log("usedRangeAddresses = " + JSON.stringify(usedRangeAddresses));
		const [ul1, ul2, ul3] = ExcelUtils.cell_dependency(usedRangeAddresses[1], 0, 0);
		const [lr1, lr2, lr3] = ExcelUtils.cell_dependency(usedRangeAddresses[2], 0, 0);
		// let upperLeftCorner : [number, number] = [ul1, ul2];
		// let lowerRightCorner : [number, number] = [lr1, lr2];
		// let numberOfCellsUsed = RectangleUtils.area([upperLeftCorner, lowerRightCorner]);
		// let diagonal = RectangleUtils.diagonal([upperLeftCorner, lowerRightCorner]);
		//		console.log("number of cells used = " + numberOfCellsUsed);

		
		let useNumericFormulaRanges = false;

		// EDB 10 June 2019: HACK. Getting numeric formula
		// ranges is shockingly slow -- an order of magnitude
		// slower than getting numeric ranges -- so we only do
		// it when it takes less than a second (though that is
		// total guesswork). Arbitrary threshold for now.
		// Revisit if this gets fixed...
 		if (false) { // FIXME numberOfCellsUsed < 2000) {
		    // Activate using numeric formula ranges when
		    // there aren't "too many" cells.
		    useNumericFormulaRanges = true;
		}
		
		let numericFormulaRanges = null;
		if (useNumericFormulaRanges) {
		    numericFormulaRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.formulas,
										 Excel.SpecialCellValueType.numbers);
		    await context.sync();
		    t.split("got numeric formula ranges");
		}
		
 		let numericRanges = usedRange.getSpecialCellsOrNullObject(Excel.SpecialCellType.constants,
									  Excel.SpecialCellValueType.numbers);
		await context.sync();
		t.split("got numeric ranges");
		
		//		app.suspendScreenUpdatingUntilNextSync();


		if (displayComments) {
		    console.log("SETTING");
		    //			let range = currentWorksheet.getRange("B1");
		    //			range.values = [[ 42 ]];
		    let len = usedRange.values.length;
		    let width = usedRange.values[0].length; // we assume it's a rectangular array.
		    let row = Array(width).fill(42);
		    let rows = Array(len).fill(row);
		    console.log(rows);
		    usedRange.values = rows;
		    await context.sync();
		}
		
		const usedRangeAddress = usedRange.address;

		//		t.split("set numbers to yellow, etc.");

		const [sheetName, startCell] = ExcelUtils.extract_sheet_cell(usedRangeAddress);
		const vec = ExcelUtils.cell_dependency(startCell, 0, 0);
 		// console.log("setColor: cell dependency = " + vec);
		t.split("computed cell dependency for start");

		const formulas = usedRange.formulas;
		//		console.log("formulas = " + JSON.stringify(formulas));
		let processed_formulas : any = Colorize.process_formulas(formulas, vec[0] - 1, vec[1] - 1);
		
		//		await setTimeout(() => {}, 0);
		t.split("processed formulas");
		//		await context.sync();
		//		app.suspendScreenUpdatingUntilNextSync();
		
		//		console.log("UPPER LEFT CORNER = " + JSON.stringify(upperLeftCorner));
		const refs = ExcelUtils.generate_all_references(formulas, vec[0] - 1, vec[1] - 1);
		t.split("generated all references");
		await setTimeout(() => {}, 0);
		const referenced_data = Colorize.color_all_data(refs);
		const data_values = Colorize.process_values(usedRange.values, vec[0] - 1, vec[1] - 1);
//		console.log("refs = " + JSON.stringify(refs));
//		console.log("referenced_data = " + JSON.stringify(referenced_data));
		t.split("processed data");
		await setTimeout(() => {}, 0);

//		console.log("referenced_data = " + JSON.stringify(referenced_data));

		const grouped_data = Colorize.identify_groups(referenced_data);
		t.split("identified groups");
//		console.log("identified grouped_data: " + JSON.stringify(grouped_data));
		const grouped_formulas = Colorize.identify_groups(processed_formulas);
		//		const grouped_formulas = Colorize.identify_groups(processed_formulas.concat(data_values)); // .concat(referenced_data));
//		console.log("processed formulas = " + JSON.stringify(processed_formulas));
//		console.log("grouped formulas = " + JSON.stringify(grouped_formulas));
		t.split("grouped formulas");
		await setTimeout(() => {}, 0);
		
		// Filter the proposed fixes:
		// * If they don't all have the same format (pre-colorization), don't propose them as fixes.
		

		//		app.suspendScreenUpdatingUntilNextSync();
		
		//		console.log("backup sheetname = " + backupSheetname);
		//		console.log(JSON.stringify(backupSheet));

		// Walk through each proposed fix, checking to see if
		// the merged range (that is, the applied fix) would
		// include inconsistent formatting. If so, we prune
		// it.

		/// Finally, apply colors.
		
		// Remove the background color from all cells.
 		let rangeFill = usedRange.format.fill;
		rangeFill.clear();
		
		//		t.split("processed data");
		this.process(grouped_formulas, currentWorksheet, (hash: string) => { return Colorize.get_color(Math.round(parseFloat(hash))); }, ()=>{});

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
		this.process(grouped_data, currentWorksheet, (_: string) => { return '#D3D3D3'; }, ()=>{});

		// Color referenced data based on its formula's color.
		// DISABLED.
		///    this.process(grouped_data, currentWorksheet, (hash: string) => { return Colorize.get_light_color_version(Colorize.get_color(Math.round(parseFloat(hash)))); }, ()=>{});

		await context.sync();

		//		console.log(JSON.stringify(usedRange.formulasR1C1));
		t.split("saved formats");
		
		// Grab the backup sheet for use in looking up the formats.
		const backupSheetname = this.saved_original_sheetname(currentWorksheet.id);
		let worksheets = context.workbook.worksheets;
		let backupSheet = worksheets.getItemOrNullObject(backupSheetname);
		await context.sync();

		t.split("about to iterate through fixes.");
		
		this.proposed_fixes = Colorize.generate_proposed_fixes(grouped_formulas);

		// Adjust the fix scores (downward) to take into account formatting in the original sheet.
		await this.adjust_fix_scores(context, backupSheet, vec[0] - 1, vec[1] - 1);
		this.proposed_fixes.sort((a, b) => { return a[0] - b[0]; });
		
		t.split("generated fixes");
		this.total_fixes = formulas.length;
		this.proposed_fixes_length = this.proposed_fixes.length; // Colorize.count_proposed_fixes(this.proposed_fixes);

		//		app.suspendScreenUpdatingUntilNextSync();
		t.split("processed formulas");

		/*
		  for (let i = 0; i < this.proposed_fixes.length; i++) {
		  let r = this.getRange(currentWorksheet, this.proposed_fixes, i);
		  r.load(['format']);
		  await context.sync();
		  r.border.set({ 'weight': 'Thin', 'style' : 'Continuous', 'tintAndShade' : -1});
		  }
		*/
		
		this.current_fix = -1;
		
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
	    //app.calculationMode = originalCalculationMode;
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
