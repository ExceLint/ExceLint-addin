"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Styling_1 = require("../../Styling");
exports.getStyles = function (props) {
    var _a;
    var theme = props.theme, className = props.className, disabled = props.disabled, required = props.required;
    var semanticColors = theme.semanticColors;
    // Tokens
    var labelFontWeight = Styling_1.FontWeights.semibold;
    var labelColor = semanticColors.bodyText;
    var labelDisabledColor = semanticColors.disabledBodyText;
    var labelRequiredStarColor = semanticColors.errorText;
    return {
        root: [
            'ms-Label',
            theme.fonts.medium,
            {
                fontWeight: labelFontWeight,
                color: labelColor,
                boxSizing: 'border-box',
                boxShadow: 'none',
                margin: 0,
                display: 'block',
                padding: '5px 0',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
            },
            disabled && {
                color: labelDisabledColor,
                selectors: tslib_1.__assign((_a = {}, _a[Styling_1.HighContrastSelector] = {
                    color: 'GrayText',
                }, _a), Styling_1.getEdgeChromiumNoHighContrastAdjustSelector()),
            },
            required && {
                selectors: {
                    '::after': {
                        content: "' *'",
                        color: labelRequiredStarColor,
                        paddingRight: 12,
                    },
                },
            },
            className,
        ],
    };
};
//# sourceMappingURL=Label.styles.js.map