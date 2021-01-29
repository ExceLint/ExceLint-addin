import * as React from "react";
import { Header } from "./Header";
import { Content } from "./Content";
import Progress from "./Progress";
import { Colorize } from "./ExceLint-core/src/colorize";
import { ExcelUtils } from "./ExceLint-core/src/excelutils";
import { ExcelJSON } from "./ExceLint-core/src/exceljson";
import { Timer } from "./ExceLint-core/src/timer";
import { Config } from "./ExceLint-core/src/config";
import * as XLNT from "./ExceLint-core/src/ExceLintTypes";
import * as XLSX from "xlsx";
import * as OfficeHelpers from "@microsoft/office-js-helpers";
import { ExceLintVector } from "./ExceLint-core/src/ExceLintTypes";
import { Option, Some, None } from "./ExceLint-core/src/option";

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {}

type XLCalculationMode = Excel.CalculationMode | "Automatic" | "AutomaticExceptTables" | "Manual";

const PROTERR =
  "WARNING: ExceLint does not work on protected spreadsheets. " +
  "Please unprotect the sheet and try again.";

// returns formulas that return numeric values
async function getNumericFormulaRanges(
  context: Excel.RequestContext,
  usedRange: Excel.Range
): Promise<Excel.RangeAreas> {
  const numericFormulaRanges = usedRange.getSpecialCellsOrNullObject(
    Excel.SpecialCellType.formulas,
    Excel.SpecialCellValueType.numbers
  );
  await context.sync();
  return numericFormulaRanges;
}

// returns an Excel.RangeAreas of numeric cells, or if the spreasheet
// is too big, nothing.
async function getNumericRangesOrNot(
  context: Excel.RequestContext,
  usedRange: Excel.Range
): Promise<Option<Excel.RangeAreas>> {
  // The address field needs to be loaded in order to access it
  usedRange.load(["address"]);
  await context.sync();

  const numberOfCellsUsed = ExcelUtils.get_number_of_cells(usedRange.address);
  if (numberOfCellsUsed < App.numericRangeThreshold) {
    // Check number of cells, as above.
    // For very large spreadsheets, this takes AGES.
    const numericRanges = usedRange.getSpecialCellsOrNullObject(
      Excel.SpecialCellType.constants,
      Excel.SpecialCellValueType.numbers
    );
    await context.sync();
    return new Some(numericRanges);
  }
  console.log("Too many cells to use numeric ranges.");
  return None;
}

// do not update the UI until `context.sync` is called
function disableScreenUpdating(app: Excel.Application): void {
  try {
    app.suspendScreenUpdatingUntilNextSync();
  } catch (error) {
    // In case it's not implemented.
  }
  app.suspendApiCalculationUntilNextSync();
}

// switch to manual calculation mode; returns whatever
// mode Excel happened to be in before.
async function manualCalcMode(
  app: Excel.Application,
  context: Excel.RequestContext
): Promise<XLCalculationMode> {
  app.load(["calculationMode"]);
  await context.sync();
  let originalCalculationMode = app.calculationMode;
  app.calculationMode = "Manual";
  await context.sync();
  return originalCalculationMode;
}

// Try to unprotect the sheet.  If this fails, return None,
// otherwise, return Some of whatever the previous protection
// level was (true = protected; false = unprotected).
async function unprotect(
  context: Excel.RequestContext,
  currentWorksheet: Excel.Worksheet
): Promise<Option<boolean>> {
  currentWorksheet.load(["protection"]);
  await context.sync();
  const wasPreviouslyProtected = currentWorksheet.protection.protected;
  try {
    currentWorksheet.protection.unprotect();
    await context.sync();
  } catch (error) {
    return None;
  }
  return new Some(wasPreviouslyProtected);
}

export default class App extends React.Component<AppProps, AppState> {
  private proposed_fixes: XLNT.ProposedFix[] = [];
  private proposed_fixes_length = 0;
  private suspicious_cells: ExceLintVector[] = [];
  private current_suspicious_cell = -1;
  private current_fix = -1;
  private total_fixes = -1;
  private savedFormat: any = null;
  private savedRange: string = null;
  private contentElement: any = null;
  private sheetName: string = "";

  public static readonly numericFormulaRangeThreshold = 20000;
  public static readonly numericRangeThreshold = 20000;

  constructor(props, context) {
    super(props, context);
    Colorize.initialize();
    this.contentElement = React.createRef();
  }

  private updateContent(): void {
    this.contentElement.current.setState({
      sheetName: this.sheetName,
      currentFix: this.current_fix,
      totalFixes: this.total_fixes,
      themFixes: this.proposed_fixes,
      numFixes: this.proposed_fixes_length,
      suspiciousCells: this.suspicious_cells,
      currentSuspiciousCell: this.current_suspicious_cell,
    });
  }

  /// Color the ranges using the specified color function.
  private color_ranges(
    grouped_ranges: XLNT.Dict<XLNT.Rectangle[]>,
    currentWorksheet: Excel.Worksheet,
    colorfn: (n: number) => string
  ) {
    const g = JSON.parse(JSON.stringify(grouped_ranges)); // deep copy
    // Process the ranges.
    let hash_index = 0;
    Object.keys(grouped_ranges).forEach((hash) => {
      if (!(hash === undefined)) {
        const v = grouped_ranges[hash];
        for (let theRange of v) {
          const rangeStr = ExcelUtils.make_range_string(theRange);
          let range = currentWorksheet.getRange(rangeStr);
          const color = colorfn(hash_index);
          if (color === "#FFFFFF") {
            range.format.fill.clear();
          } else {
            range.format.fill.color = color;
          }
        }
        hash_index += 1;
      }
    });
  }

  saveFormats = async (wasPreviouslyProtected: boolean) => {
    OfficeExtension.config.extendedErrorLogging = true;
    await Excel.run(async (context) => {
      // First, load the current worksheet's name and id.
      let worksheets = context.workbook.worksheets;
      // Make a new sheet corresponding to the current sheet (+ a suffix).
      //	    console.log("saveFormats: loading current worksheet name");
      let currentWorksheet = worksheets.getActiveWorksheet();
      currentWorksheet.load(["name", "id"]);
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
      try {
        app.suspendScreenUpdatingUntilNextSync();
      } catch (error) {
        // In case it's not implemented.
      }

      // Now, generate a new backup sheet. This will take the place of the old backup, if any.
      let newbackupSheet = currentWorksheet.copy("End");
      newbackupSheet.visibility = Excel.SheetVisibility.veryHidden;
      newbackupSheet.load(["name"]);
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
      // console.log('saveFormats: copied out the formats');
    });
  };

  /// Restore formats from the saved hidden sheet corresponding to the active sheet's ID.
  restoreFormats = async () => {
    try {
      await Excel.run(async (context) => {
        console.log("restoreFormats: begin");
        let t = new Timer("restoreFormats");

        let worksheets = context.workbook.worksheets;
        let currentWorksheet = worksheets.getActiveWorksheet();
        this.sheetName = "";
        currentWorksheet.load(["protection", "id"]);
        await context.sync();

        // If the backup is there, restore it.
        let backupName = ExcelUtils.saved_original_sheetname(currentWorksheet.id);
        try {
          let backupSheet = worksheets.getItemOrNullObject(backupName);
          await context.sync();
          // console.log('backupSheet = ' + JSON.stringify(backupSheet));
          if (!backupSheet.isNullObject) {
            // First, try to unprotect the current worksheet so we can restore into it.
            try {
              currentWorksheet.protection.unprotect();
              await context.sync();
            } catch (error) {
              console.log(
                "WARNING: ExceLint does not work on protected spreadsheets. Please unprotect the sheet and try again."
              );
              return;
            }
            // Get the current used range.
            let destRange = currentWorksheet.getUsedRange(false) as any;

            // Clear all formatting.
            destRange.load(["format"]);
            await context.sync();
            destRange.format.fill.clear();
            await context.sync();

            // Now get the used range again (the idea
            // being that clearing the formats will
            // potentially reduce the used range size).
            destRange = currentWorksheet.getUsedRange(false) as any;

            // Grab the backup sheet info.
            backupSheet.load(["format", "address", "protection"]);
            // Save previous protection status.
            await context.sync();
            const wasPreviouslyProtected = backupSheet.protection.protected;
            backupSheet.protection.unprotect();

            let backupSheetUsedRange = backupSheet.getUsedRange(false) as any;
            backupSheetUsedRange.load(["address"]);
            await context.sync();

            // Now copy it all into the original worksheet.
            // console.log('copying out ' + JSON.stringify(backupSheetUsedRange.address));
            destRange.copyFrom(backupSheetUsedRange, Excel.RangeCopyType.formats); // FIX ME FIXME WAS THIS
            // destRange.copyFrom(backupSheetUsedRange, Excel.RangeCopyType.all); // used for restoring VALUES FIXME NOT NEEDED IN GENERAL
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
        } catch (error) {
          console.log("restoreFormats: Nothing to restore: " + error);
        }
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
  };

  // Read in the workbook as a file into XLSX form, so it can be processed by our tools
  // developed for excelint-cli.
  getWorkbook(): Promise<any> {
    return new Promise((resolve, _reject) => {
      Office.context.document.getFileAsync(Office.FileType.Compressed, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          // For now, assume there's just one slice - FIXME.
          result.value.getSliceAsync(0, (res: Office.AsyncResult<Office.Slice>) => {
            if (res.status === Office.AsyncResultStatus.Succeeded) {
              // File loaded. Grab the data and read it into xlsx.
              // console.log("successful slice load.");
              let slice = res.value.data;
              // console.log("extracted slice.");
              let workbook = XLSX.read(slice, { type: "array" });
              // console.log("read workbook from xlsx.");
              // Close the file (this is mandatory).
              (async () => {
                await result.value.closeAsync();
                // console.log("Closed the file.");
              })();
              resolve(workbook);
            } else {
              console.log("slice async failed.");
              resolve(null);
            }
          });
        } else {
          console.log("getFileAsync somehow is now not working, fail.");
          resolve(null);
          // 			reject(result.error);
        }
      });
    });
  }

  /// Colorize the formulas and data on the active sheet, saving the old formats so they can be later restored.
  setColor = async () => {
    // Experimental: filter out colors so that only those
    // identified as proposed fixes get colored.
    const useReducedColors = false; // disabled by default! // WAS true; // ILDC
    const useNumericFormulaRanges = false;

    OfficeExtension.config.extendedErrorLogging = true;
    try {
      let currentWorksheet;
      let currentWorksheetName = "";
      (async () => {
        await Excel.run(async (context) => {
          currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
          currentWorksheet.load(["name"]);
          await context.sync();
          currentWorksheetName = currentWorksheet.name;
        });
      })();

      // Read the workbook into JSON form.
      let analysis: XLNT.WorkbookAnalysis;

      try {
        let workbook = await this.getWorkbook();
        let jsonBook = ExcelJSON.processWorkbookFromXLSX(workbook, "thisbook");
        const originalThreshold = Config.reportingThreshold;
        Config.reportingThreshold = 0;
        analysis = Colorize.process_workbook(jsonBook, currentWorksheetName);
        Config.reportingThreshold = originalThreshold;
      } catch (error) {
        console.log("setColor: failed to read workbook into JSON.");
        return;
      }

      await Excel.run(async (context) => {
        console.log("setColor: starting processing.");
        let t = new Timer("setColor");

        // get a handle to the app
        const app: Excel.Application = context.workbook.application;

        // get a handle to the current worksheet
        const ws = context.workbook.worksheets.getActiveWorksheet();

        // try to unprotect
        const prevProt = await unprotect(context, ws);
        if (!prevProt.hasValue) {
          console.log(PROTERR);
          return;
        }

        // Save the formats so they can later be restored.
        await this.saveFormats(prevProt.value);

        // Disable calculation for now.
        let originalCalculationMode = await manualCalcMode(app, context);

        // Turn off screen updating to speed up drawing
        disableScreenUpdating(app);

        // get the analyzed sheet
        const sheetAnalysis = analysis.getSheet(currentWorksheetName);

        // Convert to the expected format
        // TODO: Dan: I don't know if this is necessary-- we negate the score elsewhere
        // for (let i = 0; i < sheetAnalysis.proposedFixes.length; i++) {
        //   // negate score and add a true value
        //   let pf = sheetAnalysis.proposedFixes[i];
        //   this.proposed_fixes.push(new UIProposedFix(pf.score, pf.rect1, pf.rect2, true));
        // }
        // TODO: Dan: Instead, I am just going to add a ref to the proposed fixes to
        //            this object instead.
        this.proposed_fixes = sheetAnalysis.proposedFixes;

        // Get some handles to various Excel objects
        const usedRange = ws.getUsedRange(false);
        const numericRanges = await getNumericRangesOrNot(context, usedRange);
        const numericFormulaRanges = await getNumericFormulaRanges(context, usedRange);

        /// Finally, apply colors.

        // Remove the background color from all cells.
        const rangeFill = usedRange.format.fill;
        rangeFill.clear();

        // Make all numbers are yellow; this will be the default value for unreferenced data.
        if (!useReducedColors && numericRanges.hasValue && numericRanges.value) {
          numericRanges.value.format.fill.color = "#eed202"; // "Safety Yellow"
        }

        // Color numeric formulas yellow as well, if this is on.
        if (!useReducedColors && useNumericFormulaRanges && numericFormulaRanges) {
          numericFormulaRanges.format.fill.color = "#eed202"; // "Safety Yellow"
        }

        // Just color referenced data gray.
        if (!useReducedColors) {
          this.color_ranges(sheetAnalysis.groupedData, ws, (_) => "#D3D3D3");
        }

        // And color the formulas.
        if (!useReducedColors) {
          this.color_ranges(sheetAnalysis.groupedFormulas, ws, (hash: number) => {
            // TODO: Dan: why do we round the hash?
            return Colorize.get_color(Math.round(hash));
          });
        }

        // TODO: Dan: what does this do?
        ws.load(["id"]);
        await context.sync();

        // Generate an example fix for each proposed fix
        const explanations: string[] = [];
        for (let i = 0; i < this.proposed_fixes.length; i++) {
          // get the "example fix" for this proposed fix
          const pf = this.proposed_fixes[i];
          const ex = pf.analysis;
          const explanation = ex.classification[0]; // for now, just the first explanation
          const example1 = ex.analysis[0].formula;
          const example2 = ex.analysis[1].formula;
          // convert it into a string
          const explanationStr = explanation + "\n" + example1 + "\n" + example2;
          explanations.push(explanationStr);
        }

        // reset some stuff?
        this.current_fix = -1;
        this.current_suspicious_cell = -1;

        // Protect the sheet against changes.
        ws.protection.protect();
        await context.sync();

        this.updateContent();

        // Restore original calculation mode.
        app.calculationMode = originalCalculationMode;

        await context.sync();
      });
    } catch (error) {
      console.log("Error: " + error);
      if (error instanceof OfficeExtension.Error) {
        console.log("Debug info: " + JSON.stringify(error.debugInfo));
      }
    }
  };

  getRange(currentWorksheet: Excel.Worksheet, proposed_fixes: string | any[], current_fix: number) {
    if (proposed_fixes.length > 0) {
      let [col0, row0, col1, row1] = ExcelUtils.get_rectangle(proposed_fixes, current_fix);
      let rangeStr = col0 + row0 + ":" + col1 + row1;
      //	    console.log("getRange: " + rangeStr);
      let range = currentWorksheet.getRange(rangeStr);
      return range;
    } else {
      return null;
    }
  }

  selectFix = async (currentFix) => {
    // console.log("selectFix " + currentFix);
    try {
      await Excel.run(async (context) => {
        if (this.total_fixes === -1) {
          await this.restoreFormats();
          await this.setColor();
        }
        if (currentFix === -1) {
          this.current_fix = -1;
          this.updateContent();
          return;
        }
        let app = context.workbook.application;

        let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
        currentWorksheet.load(["protection"]);
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
  };

  selectCell = async (currentCell) => {
    console.log("selectCell " + currentCell);
    try {
      await Excel.run(async (context) => {
        if (this.suspicious_cells.length === 0) {
          await this.restoreFormats();
          await this.setColor();
        }
        if (currentCell === -1) {
          this.current_suspicious_cell = -1;
          this.updateContent();
          return;
        }
        let app = context.workbook.application;

        let currentWorksheet = context.workbook.worksheets.getActiveWorksheet();
        currentWorksheet.load(["protection"]);
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
        //                console.log("setting is now " + this.current_suspicious_cell);
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
  };

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return <Progress title={title} logo="assets/logo-filled.png" message="Initializing..." />;
    }

    return (
      <div className="ms-welcome">
        <Header title="ExceLint" />
        <Content
          ref={this.contentElement}
          message1="Click to reveal the deep structure of this spreadsheet."
          buttonLabel1="Reveal structure"
          click1={this.setColor}
          message2="Click to restore previous colors and borders."
          buttonLabel2="Restore"
          click2={this.restoreFormats}
          sheetName=""
          currentFix={this.current_fix}
          totalFixes={this.total_fixes}
          themFixes={this.proposed_fixes}
          selector={this.selectFix}
          numFixes={this.proposed_fixes_length}
          suspiciousCells={this.suspicious_cells}
          cellSelector={this.selectCell}
          currentSuspiciousCell={this.current_suspicious_cell}
        />
      </div>
    );
  }
}
