import fs = require("fs");
import path = require("path");
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
}
