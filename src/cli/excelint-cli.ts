// Process Excel files (input from .xls or .xlsx) with ExceLint.
// by Emery Berger, Microsoft Research / University of Massachusetts Amherst
// www.emeryberger.com

/* eslint-disable */

"use strict";
import { ExcelJSON, WorksheetAnalysis, CSVRow, SummaryCSVRow } from "./exceljson";
import { Analysis } from "../excelint/core/analysis";
import { Filters } from "../excelint/core/filters";
import { Address, Dictionary, ExceLintVector, ProposedFix, RectInfo } from "../excelint/core/ExceLintTypes";
import { WorkbookAnalysis } from "./exceljson";
import { Config } from "../excelint/core/config";
import { CLIConfig, process_arguments } from "./args";
import { AnnotationData } from "./bugs";
import { Timer } from "../excelint/core/timer";
import { RectangleUtils } from "../excelint/core/rectangleutils";
import { None, Some } from "../excelint/core/option";
import { Classification } from "../excelint/core/classification";

declare var console: Console;
declare var process: NodeJS.Process;

const CELLRESULTS = "cells.csv";
const SHEETRESULTS = "sheets.csv";

//
// Process arguments.
//
const args: CLIConfig = process_arguments();

//
// Ready to start processing.
//

// open annotations file
const theBugs = new AnnotationData(args.annotationsFile);

// get base directory
const base = args.directory ? args.directory + "/" : "";

// first run?
let firstRun = true;

// for global precision and recall
let glob_true_positives = 0;
let glob_false_positives = 0;
let glob_false_negatives = 0;

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
        // allocate pf dict for this sheet; indexed by target address vector
        const pfsd = new Dictionary<ProposedFix[]>();

        // allocate pf reject dict for this sheet; indexed by target address vector
        const reasond = new Dictionary<Filters.FilterReason[]>();

        // allocate pf classification for for this sheet; indexed by target address vector
        const classd = new Dictionary<Classification.BinCategory[]>();

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
        const fRefs = Analysis.relativeFormulaRefs(formulas, sheet.sheetName);

        // compute fingerprints for reference vector sets, indexed by address vector
        const fps = Analysis.fingerprints(fRefs);

        // for precision and recall
        let true_positives = 0;
        let false_positives = 0;
        let false_negatives = 0;

        // FOREACH CELL
        for (const key of formulas.keys) {
          const t = new Timer("cell analysis");
          const keyVect = ExceLintVector.fromKey(key);
          try {
            const addr = new Address(sheet.sheetName, keyVect.y, keyVect.x);

            // get fat cross for address
            const fc = RectangleUtils.findFatCross(usedRange, addr);
            const fps2 = fc.filterFormulas(fps, sheet.sheetName);

            const a1 = addr.toA1Ref();

            process.stderr.write("    analyzing " + a1 + "... ");

            // get proposed fixes
            const pfs = Analysis.analyzeLess(fps2);

            // we never care about fixes for cells other than addr
            const pfs2 = pfs.filter((pf) => pf.includesCellAt(addr));

            // match filters
            const filtered = Filters.matchFilters(pfs2, addr, Config.reportingThreshold);

            // save ALL proposed fixes in dictionary
            // we do not filter in the benchmark runner; we just report outputs
            if (pfs2.length > 0) {
              pfsd.put(key, pfs2);
            }

            // for every target fix, put filter reasons and classifications
            // in dictionary
            for (const pf of pfs2) {
              // filter reasons
              const reasons = filtered.get(pf);
              reasond.put(key, reasons);

              // classifications
              const is_vert: boolean = Analysis.fixIsVertical(pf);
              const rect_info = pf.rectangles.map((r) => {
                const fkey = r.upperleft.asKey();
                const f = formulas.get(fkey);
                return new RectInfo(r, f, sheet.sheetName);
              });
              const classes = Classification.classifyFixes(pf, is_vert, rect_info);
              classd.put(key, classes);
            }
          } catch (e) {
            console.error(e);
            // do nothing for now
          }
          const elapsed_us = t.elapsedTime();
          process.stderr.write(elapsed_us.toFixed(1) + " μs\n");
        }

        // save sheet analysis to workbook object
        const sheetOutput = new WorksheetAnalysis(sheet, pfsd, reasond);
        output.addSheet(sheetOutput);

        // convert workbook analysis to CSV rows and
        // write out as we go
        if (!args.suppressOutput && !args.elapsedTime) {
          const rows = ExcelJSON.CSV(output.workbook.workbookName, sheetOutput, theBugs, reasond, classd);
          true_positives = rows.reduce((acc, row) => {
            const is_a_bug = theBugs.isBug(output.workbook.workbookName, sheet.sheetName, row.flag_vector);
            const acc2 = acc + (row.was_flagged && is_a_bug ? 1 : 0);
            return acc2;
          }, 0);
          false_positives = rows.reduce((acc, row) => {
            const is_a_bug = theBugs.isBug(output.workbook.workbookName, sheet.sheetName, row.flag_vector);
            const acc2 = acc + (row.was_flagged && !is_a_bug ? 1 : 0);
            return acc2;
          }, 0);
          false_negatives = theBugs.totalBugs(output.workbook.workbookName, sheet.sheetName) - true_positives;
          const csvstr = ExcelJSON.CSVtoString(rows);
          const header = firstRun ? new Some(CSVRow.header) : None;
          ExcelJSON.writeFile(CELLRESULTS, csvstr, header);
        }

        // also write out summary CSV
        if (!args.suppressOutput && !args.elapsedTime) {
          const row = new SummaryCSVRow(
            output.workbook.workbookName,
            sheet.sheetName,
            true_positives,
            false_positives,
            false_negatives,
            theBugs.totalBugs(output.workbook.workbookName, sheet.sheetName),
            AnnotationData.precision(true_positives, false_positives),
            AnnotationData.recall(true_positives, false_negatives)
          );
          const header = firstRun ? new Some(SummaryCSVRow.header) : None;
          ExcelJSON.writeFile(SHEETRESULTS, row.toString(), header);
        }

        // set firstrun to false if we've logged at least one thing
        // (i.e., made it this far)
        if (firstRun) firstRun = false;

        // add counters to globals
        glob_true_positives += true_positives;
        glob_false_positives += false_positives;
        glob_false_negatives += false_negatives;
      }

      const elapsed_us = t.elapsedTime();
      time_arr.push(elapsed_us);
    }
  }
}

// global precision and recall
console.log(`Global precision: ${AnnotationData.precision(glob_true_positives, glob_false_positives).toFixed(3)}`);
console.log(`Global recall: ${AnnotationData.recall(glob_true_positives, glob_false_negatives).toFixed(3)}`);

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
