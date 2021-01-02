"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var ContextualMenu_base_1 = require("./ContextualMenu.base");
var ContextualMenu_styles_1 = require("./ContextualMenu.styles");
function onRenderSubMenu(subMenuProps) {
    return React.createElement(LocalContextualMenu, tslib_1.__assign({}, subMenuProps));
}
// This is to prevent cyclic import with ContextualMenu.base.tsx.
var LocalContextualMenu = Utilities_1.styled(ContextualMenu_base_1.ContextualMenuBase, ContextualMenu_styles_1.getStyles, function () { return ({ onRenderSubMenu: onRenderSubMenu }); }, { scope: 'ContextualMenu' });
/**
 * ContextualMenu description
 */
exports.ContextualMenu = LocalContextualMenu;
//# sourceMappingURL=ContextualMenu.js.map