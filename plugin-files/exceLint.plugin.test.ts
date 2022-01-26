import { location, x10, core } from "@ms/excel-online-calc";
import { ExceLintPlugin } from "./exceLint.plugin";

const stopDelta = x10.FormulaBarScheduler.defaultPluginResultWindows[x10.RequestKind.functionSuggestion].stopDelta;

describe("Test ExceLint with async grid", () => {
  it("should find nothing", async () => {
    const document = location.documentLoc(undefined, "MyDoc");
    const sheet = location.sheetIndex(document, 0);
    const sheetName = "MySheet";

    // start scheduler
    const timer = new x10.MockTimerImmediate();
    const scheduler = new x10.FormulaBarScheduler(undefined, timer);
    const messages: core.Optional<core.Optional<string>[]>[] = [];
    scheduler.subscribe({ handleFunctionSuggestion: (msg) => messages.push(msg) });

    // create spreadsheet
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
      ["=SUM(A1:A5)", "=SUM(B1:B5)", "=SUM(C1:C4)"],
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
    const content = "=SUM(A1:A5)";
    scheduler.notify({ content, endOffset: 0, beginOffset: 0, type: x10.MessageType.Insert });

    // wait for scheduler to run the plugin
    await timer.runMacrotasksWhile(() => timer.preciseNow() < timer.startTime + stopDelta);

    // check output
    expect(messages).toEqual([[]]);
  });

  it("should suggest a fix for an off-by-one formula", async () => {
    const document = location.documentLoc(undefined, "MyDoc");
    const sheet = location.sheetIndex(document, 0);
    const sheetName = "MySheet";

    // start scheduler
    const timer = new x10.MockTimerImmediate();
    const scheduler = new x10.FormulaBarScheduler(undefined, timer);
    const messages: core.Optional<core.Optional<string>[]>[] = [];
    scheduler.subscribe({ handleFunctionSuggestion: (msg) => messages.push(msg) });

    // create spreadsheet
    const grid = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10, 11, 12],
      [13, 14, 15],
      ["=SUM(A1:A5)", "=SUM(B1:B5)", "=SUM(C1:C4)"],
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
    const content = "=SUM(C1:C4)";
    scheduler.notify({ content, endOffset: 0, beginOffset: 0, type: x10.MessageType.Insert });

    // wait for scheduler to run the plugin
    await timer.runMacrotasksWhile(() => timer.preciseNow() < timer.startTime + stopDelta);

    // check output
    // TODO: update this test when ExceLint actually can synthesize
    //       replacement formulas.
    expect(messages).toEqual([["SUM(C1:C5)"]]);
  });
});
