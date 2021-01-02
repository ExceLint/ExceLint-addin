"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utilities_1 = require("../../Utilities");
var Fabric_base_1 = require("./Fabric.base");
var Fabric_styles_1 = require("./Fabric.styles");
exports.Fabric = Utilities_1.styled(Fabric_base_1.FabricBase, Fabric_styles_1.getStyles, undefined, {
    scope: 'Fabric',
});
//# sourceMappingURL=Fabric.js.map