export class Config {
  public static maxCategories = 2; // Maximum number of categories for reported errors
  public static minFixSize = 3; // Minimum size of a fix in number of cells
  public static maxEntropy = 1.0; // Maximum entropy of a proposed fix

  // Suppressing certain categories of errors.
  public static suppressFatFix = true;
  public static suppressDifferentReferentCount = false;
  public static suppressRecurrentFormula = false; // true;
  public static suppressOneExtraConstant = false; // true;
  public static suppressNumberOfConstantsMismatch = false; // = true;
  public static suppressBothConstants = false; // true;
  public static suppressOneIsAllConstants = false; // true;
  public static suppressR1C1Mismatch = false;
  public static suppressAbsoluteRefMismatch = false;
  public static suppressOffAxisReference = false; // true;
  public static noElapsedTime = false; // if true, don't report elapsed time
  public static reportingThreshold = 0; // 35; // Percent of anomalousness
  public static suspiciousCellsReportingThreshold = 85; //  percent of bar
  public static formattingDiscount = 50; // percent of discount: 100% means different formats = not suspicious at all

  // Limits on how many formulas or values to attempt to process.
  public static readonly formulasThreshold = 10000;
  public static readonly valuesThreshold = 10000;

  public static setReportingThreshold(value: number) {
    Config.reportingThreshold = value;
  }

  public static getReportingThreshold(): number {
    return Config.reportingThreshold;
  }

  public static setFormattingDiscount(value: number) {
    Config.formattingDiscount = value;
  }

  public static getFormattingDiscount(): number {
    return Config.formattingDiscount;
  }
}
