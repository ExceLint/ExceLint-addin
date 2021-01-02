define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getStyles = function (props) {
        return {
            root: props.className,
            screenReaderText: Styling_1.hiddenContentStyle,
        };
    };
});
//# sourceMappingURL=Announced.styles.js.map