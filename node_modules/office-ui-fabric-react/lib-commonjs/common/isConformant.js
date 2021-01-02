"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_conformance_1 = require("@fluentui/react-conformance");
function isConformant(testInfo) {
    var defaultOptions = {
        disabledTests: ['has-docblock', 'kebab-aria-attributes', 'is-static-property-of-parent'],
        componentPath: module.parent.filename.replace('.test', ''),
    };
    react_conformance_1.isConformant(defaultOptions, testInfo);
}
exports.isConformant = isConformant;
//# sourceMappingURL=isConformant.js.map