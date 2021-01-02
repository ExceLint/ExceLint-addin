"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Styling_1 = require("../../Styling");
var GlobalClassNames = {
    root: 'ms-DocumentCardDetails',
};
exports.getStyles = function (props) {
    var className = props.className, theme = props.theme;
    var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
    return {
        root: [
            classNames.root,
            {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'space-between',
                overflow: 'hidden',
            },
            className,
        ],
    };
};
//# sourceMappingURL=DocumentCardDetails.styles.js.map