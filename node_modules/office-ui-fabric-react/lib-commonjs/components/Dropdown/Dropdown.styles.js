"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Utilities_1 = require("../../Utilities");
var positioning_1 = require("../../utilities/positioning");
var Styling_1 = require("../../Styling");
var GlobalClassNames = {
    root: 'ms-Dropdown-container',
    label: 'ms-Dropdown-label',
    dropdown: 'ms-Dropdown',
    title: 'ms-Dropdown-title',
    caretDownWrapper: 'ms-Dropdown-caretDownWrapper',
    caretDown: 'ms-Dropdown-caretDown',
    callout: 'ms-Dropdown-callout',
    panel: 'ms-Dropdown-panel',
    dropdownItems: 'ms-Dropdown-items',
    dropdownItem: 'ms-Dropdown-item',
    dropdownDivider: 'ms-Dropdown-divider',
    dropdownOptionText: 'ms-Dropdown-optionText',
    dropdownItemHeader: 'ms-Dropdown-header',
    titleIsPlaceHolder: 'ms-Dropdown-titleIsPlaceHolder',
    titleHasError: 'ms-Dropdown-title--hasError',
};
var DROPDOWN_HEIGHT = 32;
var DROPDOWN_ITEM_HEIGHT = 36;
var highContrastAdjustMixin = (_a = {},
    _a[Styling_1.HighContrastSelector + ", " + Styling_1.HighContrastSelectorWhite.replace('@media ', '')] = {
        MsHighContrastAdjust: 'none',
    },
    _a);
var highContrastItemAndTitleStateMixin = {
    selectors: tslib_1.__assign((_b = {}, _b[Styling_1.HighContrastSelector] = {
        backgroundColor: 'Highlight',
        borderColor: 'Highlight',
        color: 'HighlightText',
    }, _b), highContrastAdjustMixin),
};
var highContrastBorderState = {
    selectors: (_c = {},
        _c[Styling_1.HighContrastSelector] = {
            borderColor: 'Highlight',
        },
        _c),
};
var MinimumScreenSelector = Styling_1.getScreenSelector(0, Styling_1.ScreenWidthMinMedium);
exports.getStyles = function (props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var theme = props.theme, hasError = props.hasError, hasLabel = props.hasLabel, className = props.className, isOpen = props.isOpen, disabled = props.disabled, required = props.required, isRenderingPlaceholder = props.isRenderingPlaceholder, panelClassName = props.panelClassName, calloutClassName = props.calloutClassName, calloutRenderEdge = props.calloutRenderEdge;
    if (!theme) {
        throw new Error('theme is undefined or null in base Dropdown getStyles function.');
    }
    var globalClassnames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
    var palette = theme.palette, semanticColors = theme.semanticColors, effects = theme.effects, fonts = theme.fonts;
    var rootHoverFocusActiveSelectorNeutralDarkMixin = {
        color: semanticColors.menuItemTextHovered,
    };
    var rootHoverFocusActiveSelectorNeutralPrimaryMixin = {
        color: semanticColors.menuItemText,
    };
    var borderColorError = {
        borderColor: semanticColors.errorText,
    };
    var dropdownItemStyle = [
        globalClassnames.dropdownItem,
        {
            backgroundColor: 'transparent',
            boxSizing: 'border-box',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            width: '100%',
            minHeight: DROPDOWN_ITEM_HEIGHT,
            lineHeight: 20,
            height: 0,
            position: 'relative',
            border: '1px solid transparent',
            borderRadius: 0,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            textAlign: 'left',
            '.ms-Button-flexContainer': {
                width: '100%',
            },
        },
    ];
    var selectedItemBackgroundColor = semanticColors.menuItemBackgroundPressed;
    var itemSelectors = function (isSelected) {
        var _a;
        if (isSelected === void 0) { isSelected = false; }
        return {
            selectors: (_a = {
                    '&:hover:focus': [
                        {
                            color: semanticColors.menuItemTextHovered,
                            backgroundColor: !isSelected ? semanticColors.menuItemBackgroundHovered : selectedItemBackgroundColor,
                        },
                        highContrastItemAndTitleStateMixin,
                    ],
                    '&:focus': [
                        {
                            backgroundColor: !isSelected ? 'transparent' : selectedItemBackgroundColor,
                        },
                        highContrastItemAndTitleStateMixin,
                    ],
                    '&:active': [
                        {
                            color: semanticColors.menuItemTextHovered,
                            backgroundColor: !isSelected ? semanticColors.menuBackground : semanticColors.menuItemBackgroundHovered,
                        },
                        highContrastItemAndTitleStateMixin,
                    ]
                },
                _a["." + Utilities_1.IsFocusVisibleClassName + " &:focus:after"] = {
                    left: 0,
                    top: 0,
                    bottom: 0,
                    right: 0,
                },
                _a[Styling_1.HighContrastSelector] = {
                    border: 'none',
                },
                _a),
        };
    };
    var dropdownItemSelected = tslib_1.__spreadArrays(dropdownItemStyle, [
        {
            backgroundColor: selectedItemBackgroundColor,
            color: semanticColors.menuItemTextHovered,
        },
        itemSelectors(true),
        highContrastItemAndTitleStateMixin,
    ]);
    var dropdownItemDisabled = tslib_1.__spreadArrays(dropdownItemStyle, [
        {
            color: semanticColors.disabledText,
            cursor: 'default',
            selectors: (_a = {},
                _a[Styling_1.HighContrastSelector] = {
                    color: 'GrayText',
                    border: 'none',
                },
                _a),
        },
    ]);
    var titleOpenBorderRadius = calloutRenderEdge === positioning_1.RectangleEdge.bottom
        ? effects.roundedCorner2 + " " + effects.roundedCorner2 + " 0 0"
        : "0 0 " + effects.roundedCorner2 + " " + effects.roundedCorner2;
    var calloutOpenBorderRadius = calloutRenderEdge === positioning_1.RectangleEdge.bottom
        ? "0 0 " + effects.roundedCorner2 + " " + effects.roundedCorner2
        : effects.roundedCorner2 + " " + effects.roundedCorner2 + " 0 0";
    return {
        root: [globalClassnames.root, className],
        label: globalClassnames.label,
        dropdown: [
            globalClassnames.dropdown,
            Styling_1.normalize,
            fonts.medium,
            {
                color: semanticColors.menuItemText,
                borderColor: semanticColors.focusBorder,
                position: 'relative',
                outline: 0,
                userSelect: 'none',
                selectors: (_b = {},
                    _b['&:hover .' + globalClassnames.title] = [
                        !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
                        { borderColor: isOpen ? palette.neutralSecondary : palette.neutralPrimary },
                        highContrastBorderState,
                    ],
                    _b['&:focus .' + globalClassnames.title] = [
                        !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
                        { selectors: (_c = {}, _c[Styling_1.HighContrastSelector] = { color: 'Highlight' }, _c) },
                    ],
                    _b['&:focus:after'] = [
                        {
                            pointerEvents: 'none',
                            content: "''",
                            position: 'absolute',
                            boxSizing: 'border-box',
                            top: '0px',
                            left: '0px',
                            width: '100%',
                            height: '100%',
                            // see https://github.com/microsoft/fluentui/pull/9182 for semantic color disc
                            border: !disabled ? "2px solid " + palette.themePrimary : 'none',
                            borderRadius: '2px',
                            selectors: (_d = {},
                                _d[Styling_1.HighContrastSelector] = {
                                    color: 'Highlight',
                                },
                                _d),
                        },
                    ],
                    _b['&:active .' + globalClassnames.title] = [
                        !disabled && rootHoverFocusActiveSelectorNeutralDarkMixin,
                        { borderColor: palette.themePrimary },
                        highContrastBorderState,
                    ],
                    _b['&:hover .' + globalClassnames.caretDown] = !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
                    _b['&:focus .' + globalClassnames.caretDown] = [
                        !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
                        { selectors: (_e = {}, _e[Styling_1.HighContrastSelector] = { color: 'Highlight' }, _e) },
                    ],
                    _b['&:active .' + globalClassnames.caretDown] = !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
                    _b['&:hover .' + globalClassnames.titleIsPlaceHolder] = !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
                    _b['&:focus .' + globalClassnames.titleIsPlaceHolder] = !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
                    _b['&:active .' + globalClassnames.titleIsPlaceHolder] = !disabled && rootHoverFocusActiveSelectorNeutralPrimaryMixin,
                    _b['&:hover .' + globalClassnames.titleHasError] = borderColorError,
                    _b['&:active .' + globalClassnames.titleHasError] = borderColorError,
                    _b),
            },
            isOpen && 'is-open',
            disabled && 'is-disabled',
            required && 'is-required',
            required &&
                !hasLabel && {
                selectors: (_f = {
                        ':before': {
                            content: "'*'",
                            color: semanticColors.errorText,
                            position: 'absolute',
                            top: -5,
                            right: -10,
                        }
                    },
                    _f[Styling_1.HighContrastSelector] = {
                        selectors: {
                            ':after': {
                                right: -14,
                            },
                        },
                    },
                    _f),
            },
        ],
        title: [
            globalClassnames.title,
            Styling_1.normalize,
            {
                backgroundColor: semanticColors.inputBackground,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: semanticColors.inputBorder,
                borderRadius: isOpen ? titleOpenBorderRadius : effects.roundedCorner2,
                cursor: 'pointer',
                display: 'block',
                height: DROPDOWN_HEIGHT,
                lineHeight: DROPDOWN_HEIGHT - 2,
                padding: "0 28px 0 8px",
                position: 'relative',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
            },
            isRenderingPlaceholder && [globalClassnames.titleIsPlaceHolder, { color: semanticColors.inputPlaceholderText }],
            hasError && [globalClassnames.titleHasError, borderColorError],
            disabled && {
                backgroundColor: semanticColors.disabledBackground,
                border: 'none',
                color: semanticColors.disabledText,
                cursor: 'default',
                selectors: tslib_1.__assign((_g = {}, _g[Styling_1.HighContrastSelector] = {
                    border: '1px solid GrayText',
                    color: 'GrayText',
                    backgroundColor: 'Window',
                }, _g), Styling_1.getEdgeChromiumNoHighContrastAdjustSelector()),
            },
        ],
        caretDownWrapper: [
            globalClassnames.caretDownWrapper,
            {
                position: 'absolute',
                top: 1,
                right: 8,
                height: DROPDOWN_HEIGHT,
                lineHeight: DROPDOWN_HEIGHT - 2,
            },
            !disabled && {
                cursor: 'pointer',
            },
        ],
        caretDown: [
            globalClassnames.caretDown,
            { color: palette.neutralSecondary, fontSize: fonts.small.fontSize, pointerEvents: 'none' },
            disabled && {
                color: semanticColors.disabledText,
                selectors: tslib_1.__assign((_h = {}, _h[Styling_1.HighContrastSelector] = { color: 'GrayText' }, _h), Styling_1.getEdgeChromiumNoHighContrastAdjustSelector()),
            },
        ],
        errorMessage: tslib_1.__assign(tslib_1.__assign({ color: semanticColors.errorText }, theme.fonts.small), { paddingTop: 5 }),
        callout: [
            globalClassnames.callout,
            {
                boxShadow: effects.elevation8,
                borderRadius: calloutOpenBorderRadius,
                selectors: (_j = {},
                    _j['.ms-Callout-main'] = { borderRadius: calloutOpenBorderRadius },
                    _j),
            },
            calloutClassName,
        ],
        dropdownItemsWrapper: { selectors: { '&:focus': { outline: 0 } } },
        dropdownItems: [globalClassnames.dropdownItems, { display: 'block' }],
        dropdownItem: tslib_1.__spreadArrays(dropdownItemStyle, [itemSelectors()]),
        dropdownItemSelected: dropdownItemSelected,
        dropdownItemDisabled: dropdownItemDisabled,
        dropdownItemSelectedAndDisabled: [dropdownItemSelected, dropdownItemDisabled, { backgroundColor: 'transparent' }],
        dropdownItemHidden: tslib_1.__spreadArrays(dropdownItemStyle, [{ display: 'none' }]),
        dropdownDivider: [globalClassnames.dropdownDivider, { height: 1, backgroundColor: semanticColors.bodyDivider }],
        dropdownOptionText: [
            globalClassnames.dropdownOptionText,
            {
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                minWidth: 0,
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                margin: '1px',
            },
        ],
        dropdownItemHeader: [
            globalClassnames.dropdownItemHeader,
            tslib_1.__assign(tslib_1.__assign({}, fonts.medium), { fontWeight: Styling_1.FontWeights.semibold, color: semanticColors.menuHeader, background: 'none', backgroundColor: 'transparent', border: 'none', height: DROPDOWN_ITEM_HEIGHT, lineHeight: DROPDOWN_ITEM_HEIGHT, cursor: 'default', padding: '0 8px', userSelect: 'none', textAlign: 'left', selectors: tslib_1.__assign((_k = {}, _k[Styling_1.HighContrastSelector] = {
                    color: 'GrayText',
                }, _k), Styling_1.getEdgeChromiumNoHighContrastAdjustSelector()) }),
        ],
        subComponentStyles: {
            label: { root: { display: 'inline-block' } },
            multiSelectItem: {
                root: {
                    padding: 0,
                },
                label: {
                    alignSelf: 'stretch',
                    padding: '0 8px',
                    width: '100%',
                },
            },
            panel: {
                root: [panelClassName],
                main: {
                    selectors: (_l = {},
                        // In case of extra small screen sizes
                        _l[MinimumScreenSelector] = {
                            // panelWidth xs
                            width: 272,
                        },
                        _l),
                },
                contentInner: { padding: '0 0 20px' },
            },
        },
    };
};
//# sourceMappingURL=Dropdown.styles.js.map