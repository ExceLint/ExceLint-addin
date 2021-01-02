"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./Persona"), exports);
tslib_1.__exportStar(require("./Persona.base"), exports);
tslib_1.__exportStar(require("./Persona.types"), exports);
tslib_1.__exportStar(require("./PersonaCoin/index"), exports);
tslib_1.__exportStar(require("./PersonaConsts"), exports);
// Exporting in case someone would like to track the current color of a persona
var PersonaInitialsColor_1 = require("./PersonaInitialsColor");
exports.getPersonaInitialsColor = PersonaInitialsColor_1.getPersonaInitialsColor;
//# sourceMappingURL=index.js.map