import { __assign } from "tslib";
import { concatStyleSets, getFocusStyle, HighContrastSelector, getScreenSelector, ScreenWidthMaxMedium, IconFontSizes, getEdgeChromiumNoHighContrastAdjustSelector, } from '../../Styling';
import { memoizeFunction } from '../../Utilities';
export var CONTEXTUAL_MENU_ITEM_HEIGHT = 36;
var MediumScreenSelector = getScreenSelector(0, ScreenWidthMaxMedium);
var getItemHighContrastStyles = memoizeFunction(function () {
    var _a;
    return {
        selectors: (_a = {},
            _a[HighContrastSelector] = {
                backgroundColor: 'Highlight',
                borderColor: 'Highlight',
                color: 'HighlightText',
                MsHighContrastAdjust: 'none',
            },
            _a),
    };
});
export var getMenuItemStyles = memoizeFunction(function (theme) {
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
            getFocusStyle(theme),
            fonts.medium,
            {
                color: semanticColors.bodyText,
                backgroundColor: 'transparent',
                border: 'none',
                width: '100%',
                height: CONTEXTUAL_MENU_ITEM_HEIGHT,
                lineHeight: CONTEXTUAL_MENU_ITEM_HEIGHT,
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
            selectors: __assign((_a = {}, _a[HighContrastSelector] = {
                color: 'GrayText',
                opacity: 1,
            }, _a), getEdgeChromiumNoHighContrastAdjustSelector()),
        },
        rootHovered: __assign({ backgroundColor: ContextualMenuItemBackgroundHoverColor, color: ContextualMenuItemTextHoverColor, selectors: {
                '.ms-ContextualMenu-icon': {
                    color: palette.themeDarkAlt,
                },
                '.ms-ContextualMenu-submenuIcon': {
                    color: palette.neutralPrimary,
                },
            } }, getItemHighContrastStyles()),
        rootFocused: __assign({ backgroundColor: palette.white }, getItemHighContrastStyles()),
        rootChecked: __assign({ selectors: {
                '.ms-ContextualMenu-checkmarkIcon': {
                    color: palette.neutralPrimary,
                },
            } }, getItemHighContrastStyles()),
        rootPressed: __assign({ backgroundColor: ContextualMenuItemBackgroundSelectedColor, selectors: {
                '.ms-ContextualMenu-icon': {
                    color: palette.themeDark,
                },
                '.ms-ContextualMenu-submenuIcon': {
                    color: palette.neutralPrimary,
                },
            } }, getItemHighContrastStyles()),
        rootExpanded: __assign({ backgroundColor: ContextualMenuItemBackgroundSelectedColor, color: semanticColors.bodyTextChecked }, getItemHighContrastStyles()),
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
            maxHeight: CONTEXTUAL_MENU_ITEM_HEIGHT,
            fontSize: IconFontSizes.medium,
            width: IconFontSizes.medium,
            margin: '0 4px',
            verticalAlign: 'middle',
            flexShrink: '0',
            selectors: (_b = {},
                _b[MediumScreenSelector] = {
                    fontSize: IconFontSizes.large,
                    width: IconFontSizes.large,
                },
                _b),
        },
        iconColor: {
            color: semanticColors.menuIcon,
            selectors: (_c = {},
                _c[HighContrastSelector] = {
                    color: 'inherit',
                },
                _c['$root:hover &'] = {
                    selectors: (_d = {},
                        _d[HighContrastSelector] = {
                            color: 'HighlightText',
                        },
                        _d),
                },
                _c['$root:focus &'] = {
                    selectors: (_e = {},
                        _e[HighContrastSelector] = {
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
                _f[HighContrastSelector] = {
                    color: 'HighlightText',
                },
                _f),
        },
        subMenuIcon: {
            height: CONTEXTUAL_MENU_ITEM_HEIGHT,
            lineHeight: CONTEXTUAL_MENU_ITEM_HEIGHT,
            color: palette.neutralSecondary,
            textAlign: 'center',
            display: 'inline-block',
            verticalAlign: 'middle',
            flexShrink: '0',
            fontSize: IconFontSizes.small,
            selectors: (_g = {
                    ':hover': {
                        color: palette.neutralPrimary,
                    },
                    ':active': {
                        color: palette.neutralPrimary,
                    }
                },
                _g[MediumScreenSelector] = {
                    fontSize: IconFontSizes.medium,
                },
                _g[HighContrastSelector] = {
                    color: 'HighlightText',
                },
                _g),
        },
        splitButtonFlexContainer: [
            getFocusStyle(theme),
            {
                display: 'flex',
                height: CONTEXTUAL_MENU_ITEM_HEIGHT,
                flexWrap: 'nowrap',
                justifyContent: 'center',
                alignItems: 'flex-start',
            },
        ],
    };
    return concatStyleSets(menuItemStyles);
});
//# sourceMappingURL=ContextualMenu.cnstyles.js.map