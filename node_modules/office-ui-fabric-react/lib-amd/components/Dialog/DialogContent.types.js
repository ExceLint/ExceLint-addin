define(["require", "exports", "../../utilities/decorators/withResponsiveMode"], function (require, exports, withResponsiveMode_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ResponsiveMode = withResponsiveMode_1.ResponsiveMode;
    /**
     * {@docCategory Dialog}
     */
    var DialogType;
    (function (DialogType) {
        /** Standard dialog */
        DialogType[DialogType["normal"] = 0] = "normal";
        /** Dialog with large header banner */
        DialogType[DialogType["largeHeader"] = 1] = "largeHeader";
        /** Dialog with an 'x' close button in the upper-right corner */
        DialogType[DialogType["close"] = 2] = "close";
    })(DialogType = exports.DialogType || (exports.DialogType = {}));
});
//# sourceMappingURL=DialogContent.types.js.map