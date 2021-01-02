import { __assign, __rest } from "tslib";
/** @jsx withSlots */
import * as React from 'react';
import { withSlots, getSlots } from '../../Foundation';
import { getNativeProps, htmlElementProperties } from '../../Utilities';
export var TextView = function (props) {
    if (React.Children.count(props.children) === 0) {
        return null;
    }
    var block = props.block, className = props.className, _a = props.as, RootType = _a === void 0 ? 'span' : _a, variant = props.variant, nowrap = props.nowrap, rest = __rest(props, ["block", "className", "as", "variant", "nowrap"]);
    var Slots = getSlots(props, {
        root: RootType,
    });
    return withSlots(Slots.root, __assign({}, getNativeProps(rest, htmlElementProperties)));
};
//# sourceMappingURL=Text.view.js.map