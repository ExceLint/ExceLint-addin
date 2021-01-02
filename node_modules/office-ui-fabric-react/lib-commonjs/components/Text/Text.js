"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Foundation_1 = require("../../Foundation");
var Text_view_1 = require("./Text.view");
var Text_styles_1 = require("./Text.styles");
exports.Text = Foundation_1.createComponent(Text_view_1.TextView, {
    displayName: 'Text',
    styles: Text_styles_1.TextStyles,
});
exports.default = exports.Text;
//# sourceMappingURL=Text.js.map