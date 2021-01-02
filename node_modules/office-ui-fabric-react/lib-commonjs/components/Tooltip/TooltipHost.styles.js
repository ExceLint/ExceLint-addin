"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Styling_1 = require("../../Styling");
var GlobalClassNames = {
    root: 'ms-TooltipHost',
    ariaPlaceholder: 'ms-TooltipHost-aria-placeholder',
};
exports.getStyles = function (props) {
    var className = props.className, theme = props.theme;
    var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
    return {
        root: [
            classNames.root,
            {
                display: 'inline',
            },
            className,
        ],
    };
};
//# sourceMappingURL=TooltipHost.styles.js.map