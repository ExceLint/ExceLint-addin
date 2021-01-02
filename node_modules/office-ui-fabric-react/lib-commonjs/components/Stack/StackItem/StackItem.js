"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @jsx withSlots */
var React = require("react");
var Foundation_1 = require("../../../Foundation");
var StackItem_styles_1 = require("./StackItem.styles");
var StackItemView = function (props) {
    var children = props.children;
    if (React.Children.count(children) < 1) {
        return null;
    }
    var Slots = Foundation_1.getSlots(props, {
        root: 'div',
    });
    return Foundation_1.withSlots(Slots.root, null, children);
};
exports.StackItem = Foundation_1.createComponent(StackItemView, {
    displayName: 'StackItem',
    styles: StackItem_styles_1.StackItemStyles,
});
exports.default = exports.StackItem;
//# sourceMappingURL=StackItem.js.map