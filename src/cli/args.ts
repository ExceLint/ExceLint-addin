import { Config } from "../excelint/core/config";
import yargs = require("yargs");
import fs = require("fs");

declare var console: Console;
declare var process: NodeJS.Process;

export class CLIConfig {
  readonly usageString = "Usage: $0 <command> [options]";
  readonly defaultFormattingDiscount = Config.getFormattingDiscount();
  readonly defaultReportingThreshold = Config.getReportingThreshold();
  readonly defaultMaxCategories = Config.maxCategories; // FIXME should be an accessor
  readonly defaultMinFixSize = Config.minFixSize;
  readonly defaultMaxEntropy = Config.maxEntropy;

  numWorkbooks: number = 0;
  numWorkbooksWithFormulas: number = 0;
  numWorkbooksWithErrors: number = 0;
  numSheets: number = 0;
  numSheetsWithErrors: number = 0;
  args: any;
  formattingDiscount: number = this.defaultFormattingDiscount;
  reportingThreshold: number = this.defaultReportingThreshold;
  maxEntropy: number = this.defaultMaxEntropy;
  allFiles: string[] = [];

  public get directory(): string {
    return this.args.directory;
  }

  public get suppressOutput(): boolean {
    return this.args.suppressOutput;
  }

  public get elapsedTime(): boolean {
    return this.args.elapsedTime;
  }

  public get runs(): number {
    return this.args.runs;
  }

  public get parameters() {
    let parameters = [];
    if (this.args.sweep) {
      // if the user asked for a parameter sweep, generate params
      const step = 10;
      for (let i = 0; i <= 100; i += step) {
        for (let j = 0; j <= 100; j += step) {
          parameters.push([i, j]);
        }
      }
    } else {
      // otherwise, just use the parameters as given
      parameters = [[this.formattingDiscount, this.reportingThreshold]];
    }
    return parameters;
  }
}

// Process command-line arguments.
export function process_arguments(): CLIConfig {
  const conf = new CLIConfig();
  const args = yargs(process.argv)
    .usage(conf.usageString)
    .command("input", "Input from FILENAME (.xls / .xlsx file).")
    .alias("i", "input")
    .nargs("input", 1)
    .command("directory", "Read from a directory of files (all ending in .xls / .xlsx).")
    .alias("d", "directory")
    .command(
      "formattingDiscount",
      "Set discount for formatting differences (default = " + conf.defaultFormattingDiscount + ")."
    )
    .command(
      "reportingThreshold",
      "Set the threshold % for reporting anomalous formulas (default = " + conf.defaultReportingThreshold + ")."
    )
    .command("suppressOutput", "Don't output the processed JSON to stdout.")
    .command(
      "maxCategories",
      "Maximum number of categories for reported errors (default = " + conf.defaultMaxCategories + ")."
    )
    .command("minFixSize", "Minimum size of a fix in number of cells (default = " + conf.defaultMinFixSize + ")")
    .command("maxEntropy", "Maximum entropy of a proposed fix (default = " + conf.defaultMaxEntropy + ")")
    .command("suppressFatFix", "")
    .command("suppressDifferentReferentCount", "")
    .command("suppressRecurrentFormula", "")
    .command("suppressOneExtraConstant", "")
    .command("suppressNumberOfConstantsMismatch", "")
    .command("suppressBothConstants", "")
    .command("suppressOneIsAllConstants", "")
    .command("suppressR1C1Mismatch", "")
    .command("suppressAbsoluteRefMismatch", "")
    .command("suppressOffAxisReference", "")
    .command("sweep", "Perform a parameter sweep and report the best settings overall.")
    .command("elapsedTime", "Print analysis time information. Suppresses other outputs.")
    .command("runs", "Number of runs for each benchmark.  Default is 1.")
    .help("h")
    .alias("h", "help").argv;

  if (args.help) {
    process.exit(0);
  }

  if (args.directory) {
    // Load up all files to process.
    conf.allFiles = fs
      .readdirSync(args.directory as string)
      .filter((x: string) => x.endsWith(".xls") || x.endsWith(".xlsx"));
  }
  //console.log(JSON.stringify(allFiles));

  // argument:
  // input = filename. Default file is standard input.
  let fname = "/dev/stdin";
  if (args.input) {
    fname = args.input as string;
    conf.allFiles = [fname];
  }

  //
  // Validation
  //
  if (!args.directory && !args.input) {
    console.warn("Must specify either --directory or --input.");
    process.exit(-1);
  }
  if (args.elapsedTime) {
    // if the user wants time information, don't print anything else
    args.suppressOutput = true;
  }
  if (!args.runs) {
    args.runs = 1;
  }

  // argument:
  // formattingDiscount = amount of impact of formatting on fix reporting (0-100%).
  if ("formattingDiscount" in args) {
    conf.formattingDiscount = args.formattingDiscount as number;
  }
  // Ensure formatting discount is within range (0-100, inclusive).
  if (conf.formattingDiscount < 0) {
    conf.formattingDiscount = 0;
  }
  if (conf.formattingDiscount > 100) {
    conf.formattingDiscount = 100;
  }
  Config.setFormattingDiscount(conf.formattingDiscount);

  if (args.suppressFatFix) {
    Config.suppressFatFix = true;
  }
  if (args.suppressDifferentReferentCount) {
    Config.suppressDifferentReferentCount = true;
  }
  if (args.suppressRecurrentFormula) {
    Config.suppressRecurrentFormula = true;
  }
  if (args.suppressOneExtraConstant) {
    Config.suppressOneExtraConstant = true;
  }
  if (args.suppressNumberOfConstantsMismatch) {
    Config.suppressNumberOfConstantsMismatch = true;
  }
  if (args.suppressBothConstants) {
    Config.suppressBothConstants = true;
  }
  if (args.suppressOneIsAllConstants) {
    Config.suppressOneIsAllConstants = true;
  }
  if (args.suppressR1C1Mismatch) {
    Config.suppressR1C1Mismatch = true;
  }
  if (args.suppressAbsoluteRefMismatch) {
    Config.suppressAbsoluteRefMismatch = true;
  }
  if (args.suppressOffAxisReference) {
    Config.suppressOffAxisReference = true;
  }

  // As above, but for reporting threshold.
  if ("reportingThreshold" in args) {
    conf.reportingThreshold = args.reportingThreshold as number;
  }
  // Ensure formatting discount is within range (0-100, inclusive).
  if (conf.reportingThreshold < 0) {
    conf.reportingThreshold = 0;
  }
  if (conf.reportingThreshold > 100) {
    conf.reportingThreshold = 100;
  }
  Config.setReportingThreshold(conf.reportingThreshold);

  if ("maxCategories" in args) {
    Config.maxCategories = args.maxCategories as number;
  }

  if ("minFixSize" in args) {
    Config.minFixSize = args.minFixSize as number;
  }

  if ("maxEntropy" in args) {
    conf.maxEntropy = args.maxEntropy as number;
    // Entropy must be between 0 and 1.
    if (conf.maxEntropy < 0.0) {
      conf.maxEntropy = 0.0;
    }
    if (conf.maxEntropy > 1.0) {
      conf.maxEntropy = 1.0;
    }
  }

  // Add parameters to conf
  conf.args = args;
  return conf;
}
