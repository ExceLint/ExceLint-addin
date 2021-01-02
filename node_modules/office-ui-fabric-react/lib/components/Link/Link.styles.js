import { __assign } from "tslib";
import { getEdgeChromiumNoHighContrastAdjustSelector, getGlobalClassNames, HighContrastSelector } from '../../Styling';
var GlobalClassNames = {
    root: 'ms-Link',
};
export var getStyles = function (props) {
    var _a, _b, _c, _d, _e, _f;
    var className = props.className, isButton = props.isButton, isDisabled = props.isDisabled, theme = props.theme;
    var semanticColors = theme.semanticColors;
    // Tokens
    var linkColor = semanticColors.link;
    var linkInteractedColor = semanticColors.linkHovered;
    var linkDisabledColor = semanticColors.disabledText;
    var focusBorderColor = semanticColors.focusBorder;
    var classNames = getGlobalClassNames(GlobalClassNames, theme);
    return {
        root: [
            classNames.root,
            theme.fonts.medium,
            {
                color: linkColor,
                outline: 'none',
                fontSize: 'inherit',
                fontWeight: 'inherit',
                textDecoration: 'none',
                selectors: (_a = {
                        '.ms-Fabric--isFocusVisible &:focus': {
                            // Can't use getFocusStyle because it doesn't support wrapping links
                            // https://github.com/microsoft/fluentui/issues/4883#issuecomment-406743543
                            // Using box-shadow and outline allows the focus rect to wrap links that span multiple lines
                            // and helps the focus rect avoid getting clipped.
                            boxShadow: "0 0 0 1px " + focusBorderColor + " inset",
                            outline: "1px auto " + focusBorderColor,
                            selectors: (_b = {},
                                _b[HighContrastSelector] = {
                                    outline: '1px solid WindowText',
                                },
                                _b),
                        }
                    },
                    _a[HighContrastSelector] = {
                        // For IE high contrast mode
                        borderBottom: 'none',
                    },
                    _a),
            },
            isButton && {
                background: 'none',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline',
                margin: 0,
                overflow: 'inherit',
                padding: 0,
                textAlign: 'left',
                textOverflow: 'inherit',
                userSelect: 'text',
                borderBottom: '1px solid transparent',
                selectors: __assign((_c = {}, _c[HighContrastSelector] = {
                    color: 'LinkText',
                }, _c), getEdgeChromiumNoHighContrastAdjustSelector()),
            },
            !isButton && {
                selectors: (_d = {},
                    _d[HighContrastSelector] = {
                        // This is mainly for MessageBar, which sets MsHighContrastAdjust: none by default
                        MsHighContrastAdjust: 'auto',
                    },
                    _d),
            },
            isDisabled && [
                'is-disabled',
                {
                    color: linkDisabledColor,
                    cursor: 'default',
                },
                {
                    selectors: {
                        '&:link, &:visited': {
                            pointerEvents: 'none',
                        },
                    },
                },
            ],
            !isDisabled && {
                selectors: {
                    '&:active, &:hover, &:active:hover': {
                        color: linkInteractedColor,
                        textDecoration: 'underline',
                        selectors: (_e = {},
                            _e[HighContrastSelector] = {
                                color: 'LinkText',
                            },
                            _e),
                    },
                    '&:focus': {
                        color: linkColor,
                        selectors: (_f = {},
                            _f[HighContrastSelector] = {
                                color: 'LinkText',
                            },
                            _f),
                    },
                },
            },
            classNames.root,
            className,
        ],
    };
};
//# sourceMappingURL=Link.styles.js.map