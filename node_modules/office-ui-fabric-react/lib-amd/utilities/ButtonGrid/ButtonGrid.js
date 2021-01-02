define(["require", "exports", "../../Utilities", "./ButtonGrid.base", "./ButtonGrid.styles"], function (require, exports, Utilities_1, ButtonGrid_base_1, ButtonGrid_styles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ButtonGrid = Utilities_1.styled(ButtonGrid_base_1.ButtonGridBase, ButtonGrid_styles_1.getStyles);
    /**
     * @deprecated - use ButtonGrid instead
     */
    exports.Grid = exports.ButtonGrid;
});
//# sourceMappingURL=ButtonGrid.js.map