define(["require", "exports", "tslib", "../../Styling", "../../Utilities"], function (require, exports, tslib_1, Styling_1, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CONTEXTUAL_MENU_ITEM_HEIGHT = 36;
    var MediumScreenSelector = Styling_1.getScreenSelector(0, Styling_1.ScreenWidthMaxMedium);
    var getItemHighContrastStyles = Utilities_1.memoizeFunction(function () {
        var _a;
        return {
            selectors: (_a = {},
                _a[Styling_1.HighContrastSelector] = {
                    backgroundColor: 'Highlight',
                    borderColor: 'Highlight',
                    color: 'HighlightText',
                    MsHighContrastAdjust: 'none',
                },
                _a),
        };
    });
    exports.getMenuItemStyles = Utilities_1.memoizeFunction(function (theme) {
        var _a, _b, _c, _d, _e, _f, _g;
        var semanticColors = theme.semanticColors, fonts = theme.fonts, palette = theme.palette;
        var ContextualMenuItemBackgroundHoverColor = semanticColors.menuItemBackgroundHovered;
        var ContextualMenuItemTextHoverColor = semanticColors.menuItemTextHovered;
        var ContextualMenuItemBackgroundSelectedColor = semanticColors.menuItemBackgroundPressed;
        var ContextualMenuItemDividerColor = semanticColors.bodyDivider;
        var menuItemStyles = {
            item: [
                fonts.medium,
                {
                    color: semanticColors.bodyText,
                    position: 'relative',
                    boxSizing: 'border-box',
                },
            ],
            divider: {
                display: 'block',
                height: '1px',
                backgroundColor: ContextualMenuItemDividerColor,
                position: 'relative',
            },
            root: [
                Styling_1.getFocusStyle(theme),
                fonts.medium,
                {
                    color: semanticColors.bodyText,
                    backgroundColor: 'transparent',
                    border: 'none',
                    width: '100%',
                    height: exports.CONTEXTUAL_MENU_ITEM_HEIGHT,
                    lineHeight: exports.CONTEXTUAL_MENU_ITEM_HEIGHT,
                    display: 'block',
                    cursor: 'pointer',
                    padding: '0px 8px 0 4px',
                    textAlign: 'left',
                },
            ],
            rootDisabled: {
                color: semanticColors.disabledBodyText,
                cursor: 'default',
                pointerEvents: 'none',
                selectors: tslib_1.__assign((_a = {}, _a[Styling_1.HighContrastSelector] = {
                    color: 'GrayText',
                    opacity: 1,
                }, _a), Styling_1.getEdgeChromiumNoHighContrastAdjustSelector()),
            },
            rootHovered: tslib_1.__assign({ backgroundColor: ContextualMenuItemBackgroundHoverColor, color: ContextualMenuItemTextHoverColor, selectors: {
                    '.ms-ContextualMenu-icon': {
                        color: palette.themeDarkAlt,
                    },
                    '.ms-ContextualMenu-submenuIcon': {
                        color: palette.neutralPrimary,
                    },
                } }, getItemHighContrastStyles()),
            rootFocused: tslib_1.__assign({ backgroundColor: palette.white }, getItemHighContrastStyles()),
            rootChecked: tslib_1.__assign({ selectors: {
                    '.ms-ContextualMenu-checkmarkIcon': {
                        color: palette.neutralPrimary,
                    },
                } }, getItemHighContrastStyles()),
            rootPressed: tslib_1.__assign({ backgroundColor: ContextualMenuItemBackgroundSelectedColor, selectors: {
                    '.ms-ContextualMenu-icon': {
                        color: palette.themeDark,
                    },
                    '.ms-ContextualMenu-submenuIcon': {
                        color: palette.neutralPrimary,
                    },
                } }, getItemHighContrastStyles()),
            rootExpanded: tslib_1.__assign({ backgroundColor: ContextualMenuItemBackgroundSelectedColor, color: semanticColors.bodyTextChecked }, getItemHighContrastStyles()),
            linkContent: {
                whiteSpace: 'nowrap',
                height: 'inherit',
                display: 'flex',
                alignItems: 'center',
                maxWidth: '100%',
            },
            anchorLink: {
                padding: '0px 8px 0 4px',
                textRendering: 'auto',
                color: 'inherit',
                letterSpacing: 'normal',
                wordSpacing: 'normal',
                textTransform: 'none',
                textIndent: '0px',
                textShadow: 'none',
                textDecoration: 'none',
                boxSizing: 'border-box',
            },
            label: {
                margin: '0 4px',
                verticalAlign: 'middle',
                display: 'inline-block',
                flexGrow: '1',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
            },
            secondaryText: {
                color: theme.palette.neutralSecondary,
                paddingLeft: '20px',
                textAlign: 'right',
            },
            icon: {
                display: 'inline-block',
                minHeight: '1px',
                maxHeight: exports.CONTEXTUAL_MENU_ITEM_HEIGHT,
                fontSize: Styling_1.IconFontSizes.medium,
                width: Styling_1.IconFontSizes.medium,
                margin: '0 4px',
                verticalAlign: 'middle',
                flexShrink: '0',
                selectors: (_b = {},
                    _b[MediumScreenSelector] = {
                        fontSize: Styling_1.IconFontSizes.large,
                        width: Styling_1.IconFontSizes.large,
                    },
                    _b),
            },
            iconColor: {
                color: semanticColors.menuIcon,
                selectors: (_c = {},
                    _c[Styling_1.HighContrastSelector] = {
                        color: 'inherit',
                    },
                    _c['$root:hover &'] = {
                        selectors: (_d = {},
                            _d[Styling_1.HighContrastSelector] = {
                                color: 'HighlightText',
                            },
                            _d),
                    },
                    _c['$root:focus &'] = {
                        selectors: (_e = {},
                            _e[Styling_1.HighContrastSelector] = {
                                color: 'HighlightText',
                            },
                            _e),
                    },
                    _c),
            },
            iconDisabled: {
                color: semanticColors.disabledBodyText,
            },
            checkmarkIcon: {
                color: semanticColors.bodySubtext,
                selectors: (_f = {},
                    _f[Styling_1.HighContrastSelector] = {
                        color: 'HighlightText',
                    },
                    _f),
            },
            subMenuIcon: {
                height: exports.CONTEXTUAL_MENU_ITEM_HEIGHT,
                lineHeight: exports.CONTEXTUAL_MENU_ITEM_HEIGHT,
                color: palette.neutralSecondary,
                textAlign: 'center',
                display: 'inline-block',
                verticalAlign: 'middle',
                flexShrink: '0',
                fontSize: Styling_1.IconFontSizes.small,
                selectors: (_g = {
                        ':hover': {
                            color: palette.neutralPrimary,
                        },
                        ':active': {
                            color: palette.neutralPrimary,
                        }
                    },
                    _g[MediumScreenSelector] = {
                        fontSize: Styling_1.IconFontSizes.medium,
                    },
                    _g[Styling_1.HighContrastSelector] = {
                        color: 'HighlightText',
                    },
                    _g),
            },
            splitButtonFlexContainer: [
                Styling_1.getFocusStyle(theme),
                {
                    display: 'flex',
                    height: exports.CONTEXTUAL_MENU_ITEM_HEIGHT,
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                },
            ],
        };
        return Styling_1.concatStyleSets(menuItemStyles);
    });
});
//# sourceMappingURL=ContextualMenu.cnstyles.js.map