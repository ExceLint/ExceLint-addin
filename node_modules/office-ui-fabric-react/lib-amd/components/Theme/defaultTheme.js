define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var defaultTheme = Styling_1.getTheme(true);
    exports.defaultPalette = Object.keys(defaultTheme.palette).map(function (variableName) { return ({
        key: variableName,
        name: variableName,
        value: defaultTheme.palette[variableName],
        description: '',
    }); });
    exports.defaultSemanticColors = Object.keys(defaultTheme.semanticColors).map(function (variableName) { return ({
        key: variableName,
        name: variableName,
        value: defaultTheme.semanticColors[variableName],
        description: defaultTheme.semanticColors[variableName].indexOf('@deprecated') >= 0 ? 'Deprecated' : '',
    }); });
});
//# sourceMappingURL=defaultTheme.js.map