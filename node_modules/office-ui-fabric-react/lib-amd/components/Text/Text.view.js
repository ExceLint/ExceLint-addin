define(["require", "exports", "tslib", "react", "../../Foundation", "../../Utilities"], function (require, exports, tslib_1, React, Foundation_1, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TextView = function (props) {
        if (React.Children.count(props.children) === 0) {
            return null;
        }
        var block = props.block, className = props.className, _a = props.as, RootType = _a === void 0 ? 'span' : _a, variant = props.variant, nowrap = props.nowrap, rest = tslib_1.__rest(props, ["block", "className", "as", "variant", "nowrap"]);
        var Slots = Foundation_1.getSlots(props, {
            root: RootType,
        });
        return Foundation_1.withSlots(Slots.root, tslib_1.__assign({}, Utilities_1.getNativeProps(rest, Utilities_1.htmlElementProperties)));
    };
});
//# sourceMappingURL=Text.view.js.map