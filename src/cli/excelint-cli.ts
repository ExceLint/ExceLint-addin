// Process Excel files (input from .xls or .xlsx) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com

/* eslint-disable */

"use strict";
import { ExcelJSON, WorksheetAnalysis } from "./exceljson";
import { Analysis } from "../excelint/core/analysis";
import {
  Address,
  Dictionary,
  ExceLintVector,
  ProposedFix,
  Analysis as AnalysisObj,
  Fingerprint,
  Rectangle,
} from "../excelint/core/ExceLintTypes";
import { WorkbookAnalysis } from "./exceljson";
import { Config } from "../excelint/core/config";
import { CLIConfig, process_arguments } from "./args";
import { AnnotationData } from "./bugs";
import { Timer } from "../excelint/core/timer";

declare var console: Console;
declare var process: NodeJS.Process;

const BUG_DATA_PATH = "benchmarks/annotations-processed.json";

//
// Process arguments.
//
const args: CLIConfig = process_arguments();

//
// Ready to start processing.
//

// open annotations file
const theBugs = new AnnotationData(BUG_DATA_PATH);

// DEBUG
console.log("THIS HAPPENED");
if (args != null) {
  process.exit(0);
}

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
      for (let j = 0; j < inp.sheets.length; j++) {
        // process the given worksheet
        const sheet = inp.sheets[j];
        console.warn("processing sheet " + sheet.sheetName);

        // convert worksheet formula array into dictionary
        const formulas = sheet.exportFormulaDict();

        // all pfs on sheet
        let spfs: ProposedFix[] = [];

        // run the check for every formula
        for (const key of formulas.keys) {
          const keyVect = ExceLintVector.fromKey(key);
          const addr = new Address(sheet.sheetName, keyVect.y, keyVect.x);

          // get proposed fixes
          const pfs = Analysis.analyze(addr, formulas);

          // concat with the rest of the discoveries
          spfs = spfs.concat(pfs);
        }

        // I am abusing this for now
        const a = new AnalysisObj(
          [],
          new Dictionary<Rectangle[]>(),
          new Dictionary<Rectangle[]>(),
          spfs,
          new Dictionary<Fingerprint>(),
          new Dictionary<Fingerprint>()
        );
        const sheetOutput = new WorksheetAnalysis(sheet, spfs, a);
        output.addSheet(sheetOutput);

        // const output = Analysis.process_workbook(inp, sheet.sheetName, !args.suppressOutput); // no bug processing for now; just get all sheets
        outputs.push(output);
      }

      const elapsed_us = t.elapsedTime();
      time_arr.push(elapsed_us);
    }
  }
}

if (!args.suppressOutput && !args.elapsedTime) {
  console.log(JSON.stringify(outputs, null, "\t"));
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
