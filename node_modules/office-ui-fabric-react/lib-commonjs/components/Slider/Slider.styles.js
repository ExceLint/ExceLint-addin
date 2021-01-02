"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Styling_1 = require("../../Styling");
var utilities_1 = require("@uifabric/utilities");
var GlobalClassNames = {
    root: 'ms-Slider',
    enabled: 'ms-Slider-enabled',
    disabled: 'ms-Slider-disabled',
    row: 'ms-Slider-row',
    column: 'ms-Slider-column',
    container: 'ms-Slider-container',
    slideBox: 'ms-Slider-slideBox',
    line: 'ms-Slider-line',
    thumb: 'ms-Slider-thumb',
    activeSection: 'ms-Slider-active',
    inactiveSection: 'ms-Slider-inactive',
    valueLabel: 'ms-Slider-value',
    showValue: 'ms-Slider-showValue',
    showTransitions: 'ms-Slider-showTransitions',
    zeroTick: 'ms-Slider-zeroTick',
};
exports.getStyles = function (props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var className = props.className, titleLabelClassName = props.titleLabelClassName, theme = props.theme, vertical = props.vertical, disabled = props.disabled, showTransitions = props.showTransitions, showValue = props.showValue;
    var semanticColors = theme.semanticColors;
    var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
    /** Tokens:
     *   The word "active" in the token refers to the selected section of the slider
     *   The word "inactive" in the token refers to the unselected section of the slider */
    var pressedActiveSectionColor = semanticColors.inputBackgroundCheckedHovered;
    var hoveredActiveSectionColor = semanticColors.inputBackgroundChecked;
    var hoveredPressedinactiveSectionColor = semanticColors.inputPlaceholderBackgroundChecked;
    var restActiveSectionColor = semanticColors.smallInputBorder;
    var restInactiveSectionColor = semanticColors.disabledBorder;
    var disabledActiveSectionColor = semanticColors.disabledText;
    var disabledInactiveSectionColor = semanticColors.disabledBackground;
    var thumbBackgroundColor = semanticColors.inputBackground;
    var thumbBorderColor = semanticColors.smallInputBorder;
    var thumbDisabledBorderColor = semanticColors.disabledBorder;
    var slideBoxActiveSectionStyles = !disabled && {
        backgroundColor: pressedActiveSectionColor,
        selectors: (_a = {},
            _a[Styling_1.HighContrastSelector] = {
                backgroundColor: 'Highlight',
            },
            _a),
    };
    var slideBoxInactiveSectionStyles = !disabled && {
        backgroundColor: hoveredPressedinactiveSectionColor,
        selectors: (_b = {},
            _b[Styling_1.HighContrastSelector] = {
                borderColor: 'Highlight',
            },
            _b),
    };
    var slideHoverSectionStyles = !disabled && {
        backgroundColor: hoveredActiveSectionColor,
        selectors: (_c = {},
            _c[Styling_1.HighContrastSelector] = {
                backgroundColor: 'Highlight',
            },
            _c),
    };
    var slideBoxActiveThumbStyles = !disabled && {
        border: "2px solid " + pressedActiveSectionColor,
        selectors: (_d = {},
            _d[Styling_1.HighContrastSelector] = {
                borderColor: 'Highlight',
            },
            _d),
    };
    var slideBoxActiveZeroTickStyles = !props.disabled && {
        backgroundColor: semanticColors.inputPlaceholderBackgroundChecked,
        selectors: (_e = {},
            _e[Styling_1.HighContrastSelector] = {
                backgroundColor: 'Highlight',
            },
            _e),
    };
    return {
        root: tslib_1.__spreadArrays([
            classNames.root,
            theme.fonts.medium,
            {
                userSelect: 'none',
            },
            vertical && {
                marginRight: 8,
            }
        ], [!disabled ? classNames.enabled : undefined], [disabled ? classNames.disabled : undefined], [!vertical ? classNames.row : undefined], [vertical ? classNames.column : undefined], [
            className,
        ]),
        titleLabel: [
            {
                padding: 0,
            },
            titleLabelClassName,
        ],
        container: [
            classNames.container,
            {
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
            },
            vertical && {
                flexDirection: 'column',
                height: '100%',
                textAlign: 'center',
                margin: '8px 0',
            },
        ],
        slideBox: tslib_1.__spreadArrays([
            classNames.slideBox,
            Styling_1.getFocusStyle(theme),
            {
                background: 'transparent',
                border: 'none',
                flexGrow: 1,
                lineHeight: 28,
                display: 'flex',
                alignItems: 'center',
                selectors: tslib_1.__assign((_f = {}, _f[":active ." + classNames.activeSection] = slideBoxActiveSectionStyles, _f[":hover ." + classNames.activeSection] = slideHoverSectionStyles, _f[":active ." + classNames.inactiveSection] = slideBoxInactiveSectionStyles, _f[":hover ." + classNames.inactiveSection] = slideBoxInactiveSectionStyles, _f[":active ." + classNames.thumb] = slideBoxActiveThumbStyles, _f[":hover ." + classNames.thumb] = slideBoxActiveThumbStyles, _f[":active ." + classNames.zeroTick] = slideBoxActiveZeroTickStyles, _f[":hover ." + classNames.zeroTick] = slideBoxActiveZeroTickStyles, _f), Styling_1.getEdgeChromiumNoHighContrastAdjustSelector()),
            },
            vertical
                ? {
                    height: '100%',
                    width: 28,
                    padding: '8px 0',
                }
                : {
                    height: 28,
                    width: 'auto',
                    padding: '0 8px',
                }
        ], [showValue ? classNames.showValue : undefined], [showTransitions ? classNames.showTransitions : undefined]),
        thumb: [
            classNames.thumb,
            {
                borderWidth: 2,
                borderStyle: 'solid',
                borderColor: thumbBorderColor,
                borderRadius: 10,
                boxSizing: 'border-box',
                background: thumbBackgroundColor,
                display: 'block',
                width: 16,
                height: 16,
                position: 'absolute',
            },
            vertical
                ? {
                    left: -6,
                    margin: '0 auto',
                    transform: 'translateY(8px)',
                }
                : {
                    top: -6,
                    transform: utilities_1.getRTL(theme) ? 'translateX(50%)' : 'translateX(-50%)',
                },
            showTransitions && {
                transition: "left " + Styling_1.AnimationVariables.durationValue3 + " " + Styling_1.AnimationVariables.easeFunction1,
            },
            disabled && {
                borderColor: thumbDisabledBorderColor,
                selectors: (_g = {},
                    _g[Styling_1.HighContrastSelector] = {
                        borderColor: 'GrayText',
                    },
                    _g),
            },
        ],
        line: [
            classNames.line,
            {
                display: 'flex',
                position: 'relative',
            },
            vertical
                ? {
                    height: '100%',
                    width: 4,
                    margin: '0 auto',
                    flexDirection: 'column-reverse',
                }
                : {
                    width: '100%',
                },
        ],
        lineContainer: [
            {
                borderRadius: 4,
                boxSizing: 'border-box',
            },
            vertical
                ? {
                    width: 4,
                    height: '100%',
                }
                : {
                    height: 4,
                    width: '100%',
                },
        ],
        activeSection: [
            classNames.activeSection,
            {
                background: restActiveSectionColor,
                selectors: (_h = {},
                    _h[Styling_1.HighContrastSelector] = {
                        backgroundColor: 'WindowText',
                    },
                    _h),
            },
            showTransitions && {
                transition: "width " + Styling_1.AnimationVariables.durationValue3 + " " + Styling_1.AnimationVariables.easeFunction1,
            },
            disabled && {
                background: disabledActiveSectionColor,
                selectors: (_j = {},
                    _j[Styling_1.HighContrastSelector] = {
                        backgroundColor: 'GrayText',
                        borderColor: 'GrayText',
                    },
                    _j),
            },
        ],
        inactiveSection: [
            classNames.inactiveSection,
            {
                background: restInactiveSectionColor,
                selectors: (_k = {},
                    _k[Styling_1.HighContrastSelector] = {
                        border: '1px solid WindowText',
                    },
                    _k),
            },
            showTransitions && {
                transition: "width " + Styling_1.AnimationVariables.durationValue3 + " " + Styling_1.AnimationVariables.easeFunction1,
            },
            disabled && {
                background: disabledInactiveSectionColor,
                selectors: (_l = {},
                    _l[Styling_1.HighContrastSelector] = {
                        borderColor: 'GrayText',
                    },
                    _l),
            },
        ],
        zeroTick: [
            classNames.zeroTick,
            {
                position: 'absolute',
                background: semanticColors.disabledBorder,
                selectors: (_m = {},
                    _m[Styling_1.HighContrastSelector] = {
                        backgroundColor: 'WindowText',
                    },
                    _m),
            },
            props.disabled && {
                background: semanticColors.disabledBackground,
                selectors: (_o = {},
                    _o[Styling_1.HighContrastSelector] = {
                        backgroundColor: 'GrayText',
                    },
                    _o),
            },
            props.vertical
                ? {
                    width: '16px',
                    height: '1px',
                    transform: utilities_1.getRTL(theme) ? 'translateX(6px)' : 'translateX(-6px)',
                }
                : {
                    width: '1px',
                    height: '16px',
                    transform: 'translateY(-6px)',
                },
        ],
        valueLabel: [
            classNames.valueLabel,
            {
                flexShrink: 1,
                width: 30,
                lineHeight: '1',
            },
            vertical
                ? {
                    margin: '0 auto',
                    whiteSpace: 'nowrap',
                    width: 40,
                }
                : {
                    margin: '0 8px',
                    whiteSpace: 'nowrap',
                    width: 40,
                },
        ],
    };
};
//# sourceMappingURL=Slider.styles.js.map