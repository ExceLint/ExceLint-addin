// Process Excel files (input from .xls or .xlsx) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com

/* eslint-disable */

"use strict";
import { ExcelJSON, WorksheetAnalysis } from "./exceljson";
import { Analysis } from "../excelint/core/analysis";
import { Address, Dictionary, ExceLintVector, ProposedFix } from "../excelint/core/ExceLintTypes";
import { WorkbookAnalysis } from "./exceljson";
import { Config } from "../excelint/core/config";
import { CLIConfig, process_arguments } from "./args";
import { AnnotationData } from "./bugs";
import { Timer } from "../excelint/core/timer";
import { RectangleUtils } from "../excelint/core/rectangleutils";
import { writeFile } from "fs";

declare var console: Console;
declare var process: NodeJS.Process;

const BUG_DATA_PATH = "benchmarks/annotations-processed.json";
const OUTFILE = "results.csv";

//
// Process arguments.
//
const args: CLIConfig = process_arguments();

//
// Ready to start processing.
//

// open annotations file
const theBugs = new AnnotationData(BUG_DATA_PATH);

// get base directory
const base = args.directory ? args.directory + "/" : "";

// for each parameter setting, run analyses on all files
const outputs: WorkbookAnalysis[] = [];

// an array of times indexed by benchmark name
const times = new Dictionary<number[]>();
for (const parms of args.parameters) {
  const formattingDiscount = parms[0];
  Config.setFormattingDiscount(formattingDiscount);
  const reportingThreshold = parms[1];
  Config.setReportingThreshold(reportingThreshold);

  // process every file given by the user
  for (const fname of args.allFiles) {
    args.numWorkbooks += 1;

    console.warn("processing " + fname);

    // initialize array before first run
    const time_arr: number[] = [];
    times.put(fname, time_arr);

    // FOREACH WORKBOOK
    for (let i = 0; i < args.runs; i++) {
      // Open the given input spreadsheet
      const inp = ExcelJSON.processWorkbook(base, fname);

      // create workbook analysis object
      const output = new WorkbookAnalysis(inp);

      // Find out a few facts about this workbook in the bug database
      const facts = theBugs.check(inp);
      if (facts.hasError) {
        args.numSheetsWithErrors += 1;
        args.numWorkbooksWithErrors += 1;
      }
      if (facts.hasFormula) args.numWorkbooksWithFormulas += 1;
      args.numSheets += facts.numSheets;

      const t = new Timer("full analysis");
      // FOREACH WORKSHEET
      for (let j = 0; j < inp.sheets.length; j++) {
        // allocate pf dict for this sheet; indexed by address vector
        const pfsd = new Dictionary<ProposedFix[]>();

        // process the given worksheet
        const sheet = inp.sheets[j];
        console.warn("  processing sheet " + sheet.sheetName);

        // convert worksheet formula array into dictionary
        const formulas = sheet.exportFormulaDict();

        // don't bother if there are no formulas
        if (formulas.size === 0) continue;

        // get used range
        const usedRange = sheet.usedRange;

        // get every reference vector set for every formula, indexed by address vector
        const fRefs = Analysis.relativeFormulaRefs(formulas);

        // compute fingerprints for reference vector sets, indexed by address vector
        const fps = Analysis.fingerprints(fRefs);

        // FOREACH CELL
        for (const key of formulas.keys) {
          const t = new Timer("cell analysis");
          const keyVect = ExceLintVector.fromKey(key);
          try {
            const addr = new Address(sheet.sheetName, keyVect.y, keyVect.x);

            // get fat cross for address
            const fc = RectangleUtils.findFatCross(usedRange, addr);
            const fps2 = fc.filterFormulas(fps, sheet.sheetName);

            process.stderr.write("    analyzing " + addr.toA1Ref() + "... ");

            // get proposed fixes
            const pfs = Analysis.analyzeLess(addr, fps2);

            // save fixes in dictionary
            if (pfs.length > 0) pfsd.put(key, pfs);
          } catch (e) {
            console.error(e);
            // do nothing for now
          }
          const elapsed_us = t.elapsedTime();
          process.stderr.write(elapsed_us + " μs\n");
        }

        // save sheet analysis to workbook object
        const sheetOutput = new WorksheetAnalysis(sheet, pfsd);
        output.addSheet(sheetOutput);

        // save workbook analysis to global array
        outputs.push(output);

        // DEBUG: gimme results as you go!
        // ExcelJSON.CSV([output], theBugs);
      }

      const elapsed_us = t.elapsedTime();
      time_arr.push(elapsed_us);
    }
  }
}

if (!args.suppressOutput && !args.elapsedTime) {
  const csv = ExcelJSON.CSV(outputs, theBugs);
  console.log(csv);
  writeFile(OUTFILE, csv, (err) => {
    if (err) throw err;
    console.log("CSV written to '" + OUTFILE + "'");
  });
  // console.log(JSON.stringify(outputs, null, "\t"));
}

if (args.elapsedTime) {
  console.log("Full analysis times:");
  const workbooks = times.keys;
  console.log('"workbook","trial","time_μs"');
  for (let i = 0; i < workbooks.length; i++) {
    const workbook = workbooks[i];
    const wTimes = times.get(workbook);
    for (let j = 0; j < wTimes.length; j++) {
      console.log('"' + workbook + '","' + j + '","' + Timer.round(wTimes[j]) + '"');
    }
  }
}

/* eslint-enable */
