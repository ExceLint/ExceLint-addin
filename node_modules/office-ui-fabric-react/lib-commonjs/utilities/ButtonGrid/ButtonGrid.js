"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utilities_1 = require("../../Utilities");
var ButtonGrid_base_1 = require("./ButtonGrid.base");
var ButtonGrid_styles_1 = require("./ButtonGrid.styles");
exports.ButtonGrid = Utilities_1.styled(ButtonGrid_base_1.ButtonGridBase, ButtonGrid_styles_1.getStyles);
/**
 * @deprecated - use ButtonGrid instead
 */
exports.Grid = exports.ButtonGrid;
//# sourceMappingURL=ButtonGrid.js.map