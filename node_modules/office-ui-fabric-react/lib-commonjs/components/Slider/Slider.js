"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utilities_1 = require("../../Utilities");
var Slider_base_1 = require("./Slider.base");
var Slider_styles_1 = require("./Slider.styles");
exports.Slider = Utilities_1.styled(Slider_base_1.SliderBase, Slider_styles_1.getStyles, undefined, {
    scope: 'Slider',
});
//# sourceMappingURL=Slider.js.map