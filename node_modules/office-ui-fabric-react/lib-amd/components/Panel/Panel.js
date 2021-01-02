define(["require", "exports", "../../Utilities", "./Panel.base", "./Panel.styles"], function (require, exports, Utilities_1, Panel_base_1, Panel_styles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Panel description
     */
    exports.Panel = Utilities_1.styled(Panel_base_1.PanelBase, Panel_styles_1.getStyles, undefined, {
        scope: 'Panel',
    });
});
//# sourceMappingURL=Panel.js.map