import * as XLNT from "../excelint/core/ExceLintTypes";
import { Analysis } from "../excelint/core/analysis";

describe("Analysis.relativeFormulaRefs", () => {
  it("should correctly extract range refs", () => {
    const sheetName = "Sheet 1";
    const fs = new XLNT.Dictionary<string>();
    const fLoc = new XLNT.ExceLintVector(0, 5, 0);
    fs.put(fLoc.asKey(), "=SUM(A1:A5)");
    const vs = Analysis.relativeFormulaRefs(fs, sheetName);
    const expected = new XLNT.Dictionary<XLNT.ExceLintVector[]>();
    expected.put(fLoc.asKey(), [
      new XLNT.ExceLintVector(0, -1, 0),
      new XLNT.ExceLintVector(0, -2, 0),
      new XLNT.ExceLintVector(0, -3, 0),
      new XLNT.ExceLintVector(0, -4, 0),
      new XLNT.ExceLintVector(0, -5, 0),
    ]);
    expect(vs).toEqual(expected);
  });
});
