define(["require", "exports", "../../Foundation", "./Text.view", "./Text.styles"], function (require, exports, Foundation_1, Text_view_1, Text_styles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Text = Foundation_1.createComponent(Text_view_1.TextView, {
        displayName: 'Text',
        styles: Text_styles_1.TextStyles,
    });
    exports.default = exports.Text;
});
//# sourceMappingURL=Text.js.map