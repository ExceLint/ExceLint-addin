define(["require", "exports", "react", "../../../Foundation", "./StackItem.styles"], function (require, exports, React, Foundation_1, StackItem_styles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
});
//# sourceMappingURL=StackItem.js.map