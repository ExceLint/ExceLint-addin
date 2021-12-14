import fs = require("fs");
import path = require("path");
import { ExceLintVector } from "../excelint/core/ExceLintTypes";
import { WorkbookOutput } from "./exceljson";

declare var console: Console;
declare var process: NodeJS.Process;

export class AnnotationFacts {
  hasError: boolean = false;
  hasFormula: boolean = false;
  numSheets: number = 0;

  constructor(hasError: boolean, hasFormula: boolean, numSheets: number) {
    this.hasError = hasError;
    this.hasFormula = hasFormula;
    this.numSheets = numSheets;
  }
}

export class AnnotationData {
  _data: any;

  constructor(bug_path: string) {
    const absPath = path.resolve(bug_path);

    // eslint-disable-next-line no-undef
    let annotated_bugs: Buffer;
    try {
      annotated_bugs = fs.readFileSync(absPath);
    } catch (e) {
      console.log("Unable to open annotations file at path '" + absPath + "'.");
      process.exit(1);
    }

    this._data = JSON.parse(annotated_bugs.toString());
  }

  public check(input: WorkbookOutput) {
    let hasError = false;
    let hasFormula = false;
    let numSheets = 0;
    for (let i = 0; i < input.worksheets.length; i++) {
      const sheet = input.worksheets[i];
      numSheets += 1;

      // does this input exist in the bug database, and if so,
      // does it have at least one bug and a handful of formulas?
      const workbookBasename = path.basename(input["workbookName"]);
      if (workbookBasename in this._data) {
        if (sheet.sheetName in this._data[workbookBasename]) {
          if (this._data[workbookBasename][sheet.sheetName]["bugs"].length > 0) {
            hasError = true;
          }
        }
      }
      if (sheet.formulas.length > 2) {
        // ExceLint can't ever report an error if there are fewer than 3 formulas.
        hasFormula = true;
      }
    }
    return new AnnotationFacts(hasError, hasFormula, numSheets);
  }

  /**
   * Returns true if the given address is a true positive.
   * @param workbook The name of the workbook
   * @param worksheet The name of the worksheet
   * @param addrv The address vector.
   */
  public isBug(workbook: string, worksheet: string, addrv: ExceLintVector): boolean {
    if (workbook in this._data) {
      if (worksheet in this._data[workbook]) {
        const bugs: [number, number, number][] = this._data[workbook][worksheet]["bugs"];
        // if the annotations file has no bugs, move on
        if (bugs.length == 0) return false;

        // otherwise, try to find the flagged cell in our list of bugs
        for (const bug of bugs) {
          const [x, y, c] = bug;
          if (addrv.x === x && addrv.y === y && addrv.c == c) {
            // bail the moment we find a match
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Return the total number of bugs for the given worksheet in the
   * given workbook.
   * @param workbook The name of a workbook.
   * @param worksheet The name of a worksheet.
   * @returns The number of bugs in the ground truth.
   */
  public totalBugs(workbook: string, worksheet: string): number {
    if (workbook in this._data) {
      if (worksheet in this._data[workbook]) {
        const bugs: [number, number, number][] = this._data[workbook][worksheet]["bugs"];
        return bugs.length;
      }
    }
    return 0;
  }

  /**
   * Computes precision.
   * @param tp Number of true positives.
   * @param fp Number of false positives.
   */
  public static precision(tp: number, fp: number): number {
    if (tp === 0 && fp === 0) {
      return 1;
    } else {
      return tp / (tp + fp);
    }
  }

  /**
   * Computes recall.
   * @param tp Number of true positives.
   * @param fn Number of false negatives.
   */
  public static recall(tp: number, fn: number): number {
    if (tp === 0 && fn === 0) {
      return 1;
    } else {
      return tp / (tp + fn);
    }
  }
}
