import { Colorize } from './colorize';

const usedRangeAddress = "Sheet1!E12:E21";
const formulas = [["=D12"],["=D13"],["=D14"],["=D15"],["=D16"],["=D17"],["=D18"],["=D19"],["=D20"],["=C21"]];
const values = [["0"],["0"],["0"],["0"],["0"],["0"],["0"],["0"],["0"],["0"]];

let [suspicious_cells, grouped_formulas, grouped_data, proposed_fixes]
    = Colorize.process_suspicious(usedRangeAddress, formulas, values);

