import { __assign } from "tslib";
import * as React from 'react';
import { styled } from '../../Utilities';
import { ContextualMenuBase } from './ContextualMenu.base';
import { getStyles } from './ContextualMenu.styles';
function onRenderSubMenu(subMenuProps) {
    return React.createElement(LocalContextualMenu, __assign({}, subMenuProps));
}
// This is to prevent cyclic import with ContextualMenu.base.tsx.
var LocalContextualMenu = styled(ContextualMenuBase, getStyles, function () { return ({ onRenderSubMenu: onRenderSubMenu }); }, { scope: 'ContextualMenu' });
/**
 * ContextualMenu description
 */
export var ContextualMenu = LocalContextualMenu;
//# sourceMappingURL=ContextualMenu.js.map