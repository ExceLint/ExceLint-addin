import { location, x10, core } from '@ms/excel-online-calc';
import { ExceLintPlugin } from './exceLint.plugin';

const stopDelta = x10.FormulaBarScheduler.defaultPluginResultWindows[x10.RequestKind.functionSuggestion].stopDelta;

// /**
//  * A helper method to load a grid from a CSVF.
//  * @param csvPath Path to a CSVF.
//  */
// function makeGridFromCSVF(csvPath: string): (string | number | boolean | undefined)[][] {
//   const fs = require('fs');
//   try {
//     const csv = fs.readFileSync(csvPath, 'utf8') as string;
//     const lines = csv.split(/\r\n|\n/);
//     const ss: (string | number | boolean | undefined)[][] = [];
//     for (const line of lines) {
//       const row: (string | number | boolean | undefined)[] = [];

//       const elems = line.split(',');
//       let emptyRow = true;
//       for (const elem of elems) {
//         if (elem.charAt(0) === '"' && elem.charAt(elem.length - 1) === '"') {
//           // quoted-- look for escaped quotes
//           let lastCharQuote = false;
//           let s = '';
//           for (let i = 1; i < elem.length - 1; i++) {
//             if (lastCharQuote) {
//               // this char had better be a quote
//               if (elem.charAt(i) === '"') {
//                 s += '"';
//                 lastCharQuote = false;
//               } else {
//                 throw new Error("Invalid CSV string: '" + elem + "'");
//               }
//             } else if (elem.charAt(i) === '"') {
//               // start of an escaped quote
//               lastCharQuote = true;
//             } else {
//               s += elem.charAt(i);
//               emptyRow = false;
//             }
//           }
//           row.push(s);
//         } else {
//           // not quoted-- just take the entire string
//           let num = parseFloat(elem);
//           if (!isNaN(num)) {
//             row.push(num);
//           } else if (elem === 'TRUE') {
//             row.push(true);
//           } else if (elem === 'FALSE') {
//             row.push(false);
//           } else if (elem.length === 0) {
//             row.push(undefined);
//           } else {
//             row.push(elem);
//           }
//           if (elem.length > 0) {
//             emptyRow = false;
//           }
//         }
//       }
//       // only push the row if we actually processed anything
//       if (row.length !== 0 && !emptyRow) {
//         ss.push(row);
//       }
//     }
//     return ss;
//   } catch (e) {
//     return [];
//   }
// }

// describe('CSV test file loader', () => {
//   it('should load a CSV', () => {
//     const grid = makeGridFromCSVF('excelint-tests/csv-tests.csv');
//     const expected = [
//       ['test1', false],
//       ['#NAME?', undefined],
//       ['test"3', true],
//       [undefined, '"test4"'],
//     ];
//     expect(grid).toEqual(expected);
//   });
// });

describe('Test ExceLint with async grid', () => {
  it('should find nothing', async () => {
    const document = location.documentLoc(undefined, 'MyDoc');
    const sheet = location.sheetIndex(document, 0);
    const sheetName = 'MySheet';

    // start scheduler
    const timer = new x10.MockTimerImmediate();
    const scheduler = new x10.FormulaBarScheduler(undefined, timer);
    const messages: core.Optional<core.Optional<string>[]>[] = [];
    scheduler.subscribe({ handleFunctionSuggestion: msg => messages.push(msg) });

    // create spreadsheet
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
      ['=SUM(A1:A5)', '=SUM(B1:B5)', '=SUM(C1:C4)'],
    ];
    const asyncGrid = x10.createMockAsyncGrid();
    asyncGrid.setSheet(sheet.index, sheetName, grid);
    scheduler.registerAsyncGrid(asyncGrid);

    // set current cell
    const currentLocation = location.sheetGridCell(sheet, location.gridCell(5, 0));
    scheduler.setCurrentCell(currentLocation);

    // start excelint
    scheduler.createAndAttachPlugin(ExceLintPlugin);

    // "type something in"
    const content = '=SUM(A1:A5)';
    scheduler.notify({ content, endOffset: 0, beginOffset: 0, type: x10.MessageType.Insert });

    // wait for scheduler to run the plugin
    await timer.runMacrotasksWhile(() => timer.preciseNow() < timer.startTime + stopDelta);

    // check output
    expect(messages).toEqual([[]]);
  });

  it('should suggest a fix for an off-by-one formula', async () => {
    const document = location.documentLoc(undefined, 'MyDoc');
    const sheet = location.sheetIndex(document, 0);
    const sheetName = 'MySheet';

    // start scheduler
    const timer = new x10.MockTimerImmediate();
    const scheduler = new x10.FormulaBarScheduler(undefined, timer);
    const messages: core.Optional<core.Optional<string>[]>[] = [];
    scheduler.subscribe({ handleFunctionSuggestion: msg => messages.push(msg) });

    // create spreadsheet
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
      ['=SUM(A1:A5)', '=SUM(B1:B5)', '=SUM(C1:C4)'],
    ];
    const asyncGrid = x10.createMockAsyncGrid();
    asyncGrid.setSheet(sheet.index, sheetName, grid);
    scheduler.registerAsyncGrid(asyncGrid);

    // set current cell
    const currentLocation = location.sheetGridCell(sheet, location.gridCell(5, 2));
    scheduler.setCurrentCell(currentLocation);

    // start excelint
    scheduler.createAndAttachPlugin(ExceLintPlugin);

    // "type something in"
    const content = '=SUM(C1:C4)';
    scheduler.notify({ content, endOffset: 0, beginOffset: 0, type: x10.MessageType.Insert });

    // wait for scheduler to run the plugin
    await timer.runMacrotasksWhile(() => timer.preciseNow() < timer.startTime + stopDelta);

    // check output
    // TODO: update this test when ExceLint actually can synthesize
    //       replacement formulas.
    expect(messages).toEqual([['<3,6,0>:<3,6,0> and <1,6,0>:<2,6,0>']]);
  });
});
