"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Styling_1 = require("../../Styling");
var Utilities_1 = require("../../Utilities");
exports.DetailsRowGlobalClassNames = {
    root: 'ms-DetailsRow',
    // TODO: in Fabric 7.0 lowercase the 'Compact' for consistency across other components.
    compact: 'ms-DetailsList--Compact',
    cell: 'ms-DetailsRow-cell',
    cellAnimation: 'ms-DetailsRow-cellAnimation',
    cellCheck: 'ms-DetailsRow-cellCheck',
    check: 'ms-DetailsRow-check',
    cellMeasurer: 'ms-DetailsRow-cellMeasurer',
    listCellFirstChild: 'ms-List-cell:first-child',
    isContentUnselectable: 'is-contentUnselectable',
    isSelected: 'is-selected',
    isCheckVisible: 'is-check-visible',
    isRowHeader: 'is-row-header',
    fields: 'ms-DetailsRow-fields',
};
var IsFocusableSelector = "[data-is-focusable='true']";
exports.DEFAULT_CELL_STYLE_PROPS = {
    cellLeftPadding: 12,
    cellRightPadding: 8,
    cellExtraRightPadding: 24,
};
// Source of default row heights to share.
exports.DEFAULT_ROW_HEIGHTS = {
    rowHeight: 42,
    compactRowHeight: 32,
};
// Constant values
var values = tslib_1.__assign(tslib_1.__assign({}, exports.DEFAULT_ROW_HEIGHTS), { rowVerticalPadding: 11, compactRowVerticalPadding: 6 });
exports.getDetailsRowStyles = function (props) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var theme = props.theme, isSelected = props.isSelected, canSelect = props.canSelect, droppingClassName = props.droppingClassName, anySelected = props.anySelected, isCheckVisible = props.isCheckVisible, checkboxCellClassName = props.checkboxCellClassName, compact = props.compact, className = props.className, _o = props.cellStyleProps, cellStyleProps = _o === void 0 ? exports.DEFAULT_CELL_STYLE_PROPS : _o, enableUpdateAnimations = props.enableUpdateAnimations;
    var palette = theme.palette, fonts = theme.fonts;
    var neutralPrimary = palette.neutralPrimary, white = palette.white, neutralSecondary = palette.neutralSecondary, neutralLighter = palette.neutralLighter, neutralLight = palette.neutralLight, neutralDark = palette.neutralDark, neutralQuaternaryAlt = palette.neutralQuaternaryAlt;
    var focusBorder = theme.semanticColors.focusBorder;
    var classNames = Styling_1.getGlobalClassNames(exports.DetailsRowGlobalClassNames, theme);
    var colors = {
        // Default
        defaultHeaderText: neutralPrimary,
        defaultMetaText: neutralSecondary,
        defaultBackground: white,
        // Default Hover
        defaultHoverHeaderText: neutralDark,
        defaultHoverMetaText: neutralPrimary,
        defaultHoverBackground: neutralLighter,
        // Selected
        selectedHeaderText: neutralDark,
        selectedMetaText: neutralPrimary,
        selectedBackground: neutralLight,
        // Selected Hover
        selectedHoverHeaderText: neutralDark,
        selectedHoverMetaText: neutralPrimary,
        selectedHoverBackground: neutralQuaternaryAlt,
        // Focus
        focusHeaderText: neutralDark,
        focusMetaText: neutralPrimary,
        focusBackground: neutralLight,
        focusHoverBackground: neutralQuaternaryAlt,
    };
    // Selected row styles
    var selectedStyles = [
        Styling_1.getFocusStyle(theme, { inset: -1, borderColor: focusBorder, outlineColor: white }),
        classNames.isSelected,
        {
            color: colors.selectedMetaText,
            background: colors.selectedBackground,
            borderBottom: "1px solid " + white,
            selectors: (_a = {
                    '&:before': {
                        position: 'absolute',
                        display: 'block',
                        top: -1,
                        height: 1,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        content: '',
                        borderTop: "1px solid " + white,
                    },
                    // Selected State hover
                    '&:hover': {
                        background: colors.selectedHoverBackground,
                        color: colors.selectedHoverMetaText,
                        selectors: (_b = {},
                            // Selected State hover meta cell
                            _b["." + classNames.cell + " " + Styling_1.HighContrastSelector] = {
                                color: 'HighlightText',
                                selectors: {
                                    '> a': {
                                        color: 'HighlightText',
                                    },
                                },
                            },
                            // Selected State hover Header cell
                            _b["." + classNames.isRowHeader] = {
                                color: colors.selectedHoverHeaderText,
                                selectors: (_c = {},
                                    _c[Styling_1.HighContrastSelector] = {
                                        color: 'HighlightText',
                                    },
                                    _c),
                            },
                            // Ensure high-contrast mode overrides default hover background
                            _b[Styling_1.HighContrastSelector] = {
                                background: 'Highlight',
                            },
                            _b),
                    },
                    // Focus state
                    '&:focus': {
                        background: colors.focusBackground,
                        selectors: (_d = {},
                            // Selected State hover meta cell
                            _d["." + classNames.cell] = {
                                color: colors.focusMetaText,
                                selectors: (_e = {},
                                    _e[Styling_1.HighContrastSelector] = {
                                        color: 'HighlightText',
                                        selectors: {
                                            '> a': {
                                                color: 'HighlightText',
                                            },
                                        },
                                    },
                                    _e),
                            },
                            // Row header cell
                            _d["." + classNames.isRowHeader] = {
                                color: colors.focusHeaderText,
                                selectors: (_f = {},
                                    _f[Styling_1.HighContrastSelector] = {
                                        color: 'HighlightText',
                                    },
                                    _f),
                            },
                            // Ensure high-contrast mode overrides default focus background
                            _d[Styling_1.HighContrastSelector] = {
                                background: 'Highlight',
                            },
                            _d),
                    }
                },
                _a[Styling_1.HighContrastSelector] = {
                    background: 'Highlight',
                    color: 'HighlightText',
                    MsHighContrastAdjust: 'none',
                    selectors: {
                        a: {
                            color: 'HighlightText',
                        },
                    },
                },
                // Focus and hover state
                _a['&:focus:hover'] = {
                    background: colors.focusHoverBackground,
                },
                _a),
        },
    ];
    var cannotSelectStyles = [
        classNames.isContentUnselectable,
        {
            userSelect: 'none',
            cursor: 'default',
        },
    ];
    var rootCompactStyles = {
        minHeight: values.compactRowHeight,
        border: 0,
    };
    var cellCompactStyles = {
        minHeight: values.compactRowHeight,
        paddingTop: values.compactRowVerticalPadding,
        paddingBottom: values.compactRowVerticalPadding,
        paddingLeft: cellStyleProps.cellLeftPadding + "px",
    };
    var defaultCellStyles = [
        Styling_1.getFocusStyle(theme, { inset: -1 }),
        classNames.cell,
        {
            display: 'inline-block',
            position: 'relative',
            boxSizing: 'border-box',
            minHeight: values.rowHeight,
            verticalAlign: 'top',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingTop: values.rowVerticalPadding,
            paddingBottom: values.rowVerticalPadding,
            paddingLeft: cellStyleProps.cellLeftPadding + "px",
            selectors: (_g = {
                    '& > button': {
                        maxWidth: '100%',
                    }
                },
                _g[IsFocusableSelector] = Styling_1.getFocusStyle(theme, { inset: -1, borderColor: neutralSecondary, outlineColor: white }),
                _g),
        },
        isSelected && {
            selectors: (_h = {},
                _h[Styling_1.HighContrastSelector] = {
                    background: 'Highlight',
                    color: 'HighlightText',
                    MsHighContrastAdjust: 'none',
                    selectors: {
                        a: {
                            color: 'HighlightText',
                        },
                    },
                },
                _h),
        },
        compact && cellCompactStyles,
    ];
    return {
        root: [
            classNames.root,
            Styling_1.AnimationClassNames.fadeIn400,
            droppingClassName,
            theme.fonts.small,
            isCheckVisible && classNames.isCheckVisible,
            Styling_1.getFocusStyle(theme, { borderColor: focusBorder, outlineColor: white }),
            {
                borderBottom: "1px solid " + neutralLighter,
                background: colors.defaultBackground,
                color: colors.defaultMetaText,
                // This ensures that the row always tries to consume is minimum width and does not compress.
                display: 'inline-flex',
                minWidth: '100%',
                minHeight: values.rowHeight,
                whiteSpace: 'nowrap',
                padding: 0,
                boxSizing: 'border-box',
                verticalAlign: 'top',
                textAlign: 'left',
                selectors: (_j = {},
                    _j["." + classNames.listCellFirstChild + " &:before"] = {
                        display: 'none',
                    },
                    _j['&:hover'] = {
                        background: colors.defaultHoverBackground,
                        color: colors.defaultHoverMetaText,
                        selectors: (_k = {},
                            _k["." + classNames.isRowHeader] = {
                                color: colors.defaultHoverHeaderText,
                            },
                            _k),
                    },
                    _j["&:hover ." + classNames.check] = {
                        opacity: 1,
                    },
                    _j["." + Utilities_1.IsFocusVisibleClassName + " &:focus ." + classNames.check] = {
                        opacity: 1,
                    },
                    _j),
            },
            isSelected && selectedStyles,
            !canSelect && cannotSelectStyles,
            compact && rootCompactStyles,
            className,
        ],
        cellUnpadded: {
            paddingRight: cellStyleProps.cellRightPadding + "px",
        },
        cellPadded: {
            paddingRight: cellStyleProps.cellExtraRightPadding + cellStyleProps.cellRightPadding + "px",
            selectors: (_l = {},
                _l["&." + classNames.cellCheck] = {
                    paddingRight: 0,
                },
                _l),
        },
        cell: defaultCellStyles,
        cellAnimation: enableUpdateAnimations && Styling_1.AnimationStyles.slideLeftIn40,
        cellMeasurer: [
            classNames.cellMeasurer,
            {
                overflow: 'visible',
                whiteSpace: 'nowrap',
            },
        ],
        checkCell: [
            defaultCellStyles,
            classNames.cellCheck,
            checkboxCellClassName,
            {
                padding: 0,
                // Ensure that the check cell covers the top border of the cell.
                // This ensures the click target does not leave a spot which would
                // cause other items to be deselected.
                paddingTop: 1,
                marginTop: -1,
                flexShrink: 0,
            },
        ],
        checkCover: {
            position: 'absolute',
            top: -1,
            left: 0,
            bottom: 0,
            right: 0,
            display: anySelected ? 'block' : 'none',
        },
        fields: [
            classNames.fields,
            {
                display: 'flex',
                alignItems: 'stretch',
            },
        ],
        isRowHeader: [
            classNames.isRowHeader,
            {
                color: colors.defaultHeaderText,
                fontSize: fonts.medium.fontSize,
            },
            isSelected && {
                color: colors.selectedHeaderText,
                fontWeight: Styling_1.FontWeights.semibold,
                selectors: (_m = {},
                    _m[Styling_1.HighContrastSelector] = {
                        color: 'HighlightText',
                    },
                    _m),
            },
        ],
        isMultiline: [
            defaultCellStyles,
            {
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                textOverflow: 'clip',
            },
        ],
        check: [classNames.check],
    };
};
//# sourceMappingURL=DetailsRow.styles.js.map