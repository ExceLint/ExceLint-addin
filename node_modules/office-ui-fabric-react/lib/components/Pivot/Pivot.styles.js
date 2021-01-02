import { __spreadArrays } from "tslib";
import { AnimationVariables, getGlobalClassNames, HighContrastSelector, normalize, FontWeights, } from '../../Styling';
import { IsFocusVisibleClassName } from '../../Utilities';
var globalClassNames = {
    count: 'ms-Pivot-count',
    icon: 'ms-Pivot-icon',
    linkIsSelected: 'is-selected',
    link: 'ms-Pivot-link',
    linkContent: 'ms-Pivot-linkContent',
    root: 'ms-Pivot',
    rootIsLarge: 'ms-Pivot--large',
    rootIsTabs: 'ms-Pivot--tabs',
    text: 'ms-Pivot-text',
};
var linkStyles = function (props) {
    var _a, _b;
    var rootIsLarge = props.rootIsLarge, rootIsTabs = props.rootIsTabs;
    var _c = props.theme, semanticColors = _c.semanticColors, fonts = _c.fonts;
    return [
        fonts.medium,
        {
            color: semanticColors.actionLink,
            display: 'inline-block',
            lineHeight: 44,
            height: 44,
            marginRight: 8,
            padding: '0 8px',
            textAlign: 'center',
            position: 'relative',
            backgroundColor: 'transparent',
            border: 0,
            borderRadius: 0,
            selectors: (_a = {
                    ':before': {
                        backgroundColor: 'transparent',
                        bottom: 0,
                        content: '""',
                        height: 2,
                        left: 8,
                        position: 'absolute',
                        right: 8,
                        transition: "left " + AnimationVariables.durationValue2 + " " + AnimationVariables.easeFunction2 + ",\n                      right " + AnimationVariables.durationValue2 + " " + AnimationVariables.easeFunction2,
                    },
                    ':after': {
                        color: 'transparent',
                        content: 'attr(data-content)',
                        display: 'block',
                        fontWeight: FontWeights.bold,
                        height: 1,
                        overflow: 'hidden',
                        visibility: 'hidden',
                    },
                    ':hover': {
                        backgroundColor: semanticColors.buttonBackgroundHovered,
                        color: semanticColors.buttonTextHovered,
                        cursor: 'pointer',
                    },
                    ':active': {
                        backgroundColor: semanticColors.buttonBackgroundPressed,
                        color: semanticColors.buttonTextHovered,
                    },
                    ':focus': {
                        outline: 'none',
                    }
                },
                _a["." + IsFocusVisibleClassName + " &:focus"] = {
                    outline: "1px solid " + semanticColors.focusBorder,
                },
                _a["." + IsFocusVisibleClassName + " &:focus:after"] = {
                    content: 'attr(data-content)',
                    position: 'relative',
                    border: 0,
                },
                _a),
        },
        rootIsLarge && {
            fontSize: fonts.large.fontSize,
        },
        rootIsTabs && [
            {
                marginRight: 0,
                height: 44,
                lineHeight: 44,
                backgroundColor: semanticColors.buttonBackground,
                padding: '0 10px',
                verticalAlign: 'top',
                selectors: (_b = {
                        ':focus': {
                            outlineOffset: '-1px',
                        }
                    },
                    _b["." + IsFocusVisibleClassName + " &:focus::before"] = {
                        height: 'auto',
                        background: 'transparent',
                        transition: 'none',
                    },
                    _b),
            },
        ],
    ];
};
export var getStyles = function (props) {
    var _a, _b, _c;
    var className = props.className, rootIsLarge = props.rootIsLarge, rootIsTabs = props.rootIsTabs, theme = props.theme;
    var semanticColors = theme.semanticColors, fonts = theme.fonts;
    var classNames = getGlobalClassNames(globalClassNames, theme);
    return {
        root: [
            classNames.root,
            fonts.medium,
            normalize,
            {
                position: 'relative',
                color: semanticColors.link,
                whiteSpace: 'nowrap',
            },
            rootIsLarge && classNames.rootIsLarge,
            rootIsTabs && classNames.rootIsTabs,
            className,
        ],
        itemContainer: {
            selectors: {
                '&[hidden]': {
                    display: 'none',
                },
            },
        },
        link: __spreadArrays([
            classNames.link
        ], linkStyles(props), [
            rootIsTabs && {
                selectors: {
                    '&:hover, &:focus': {
                        color: semanticColors.buttonTextCheckedHovered,
                    },
                    '&:active, &:hover': {
                        color: semanticColors.primaryButtonText,
                        backgroundColor: semanticColors.primaryButtonBackground,
                    },
                },
            },
        ]),
        linkIsSelected: __spreadArrays([
            classNames.link,
            classNames.linkIsSelected
        ], linkStyles(props), [
            {
                fontWeight: FontWeights.semibold,
                selectors: (_a = {
                        ':before': {
                            backgroundColor: semanticColors.inputBackgroundChecked,
                            selectors: (_b = {},
                                _b[HighContrastSelector] = {
                                    backgroundColor: 'Highlight',
                                },
                                _b),
                        },
                        ':hover::before': {
                            left: 0,
                            right: 0,
                        }
                    },
                    _a[HighContrastSelector] = {
                        color: 'Highlight',
                    },
                    _a),
            },
            rootIsTabs && {
                backgroundColor: semanticColors.primaryButtonBackground,
                color: semanticColors.primaryButtonText,
                fontWeight: FontWeights.regular,
                selectors: (_c = {
                        ':before': {
                            backgroundColor: 'transparent',
                            transition: 'none',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            content: '""',
                            height: 0,
                        },
                        ':hover': {
                            backgroundColor: semanticColors.primaryButtonBackgroundHovered,
                            color: semanticColors.primaryButtonText,
                        },
                        '&:active': {
                            backgroundColor: semanticColors.primaryButtonBackgroundPressed,
                            color: semanticColors.primaryButtonText,
                        }
                    },
                    _c[HighContrastSelector] = {
                        fontWeight: FontWeights.semibold,
                        color: 'HighlightText',
                        background: 'Highlight',
                        MsHighContrastAdjust: 'none',
                    },
                    _c),
            },
        ]),
        linkContent: [
            classNames.linkContent,
            {
                flex: '0 1 100%',
                selectors: {
                    '& > * ': {
                        marginLeft: 4,
                    },
                    '& > *:first-child': {
                        marginLeft: 0,
                    },
                },
            },
        ],
        text: [
            classNames.text,
            {
                display: 'inline-block',
                verticalAlign: 'top',
            },
        ],
        count: [
            classNames.count,
            {
                display: 'inline-block',
                verticalAlign: 'top',
            },
        ],
        icon: classNames.icon,
    };
};
//# sourceMappingURL=Pivot.styles.js.map