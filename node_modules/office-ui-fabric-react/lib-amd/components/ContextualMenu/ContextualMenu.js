define(["require", "exports", "tslib", "react", "../../Utilities", "./ContextualMenu.base", "./ContextualMenu.styles"], function (require, exports, tslib_1, React, Utilities_1, ContextualMenu_base_1, ContextualMenu_styles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function onRenderSubMenu(subMenuProps) {
        return React.createElement(LocalContextualMenu, tslib_1.__assign({}, subMenuProps));
    }
    // This is to prevent cyclic import with ContextualMenu.base.tsx.
    var LocalContextualMenu = Utilities_1.styled(ContextualMenu_base_1.ContextualMenuBase, ContextualMenu_styles_1.getStyles, function () { return ({ onRenderSubMenu: onRenderSubMenu }); }, { scope: 'ContextualMenu' });
    /**
     * ContextualMenu description
     */
    exports.ContextualMenu = LocalContextualMenu;
});
//# sourceMappingURL=ContextualMenu.js.map