import { getGlobalClassNames, HighContrastSelector } from '../../../Styling';
export var SuggestionsItemGlobalClassNames = {
    root: 'ms-Suggestions-item',
    itemButton: 'ms-Suggestions-itemButton',
    closeButton: 'ms-Suggestions-closeButton',
    isSuggested: 'is-suggested',
};
export function getStyles(props) {
    var _a, _b, _c;
    var className = props.className, theme = props.theme, suggested = props.suggested;
    var palette = theme.palette, semanticColors = theme.semanticColors;
    var classNames = getGlobalClassNames(SuggestionsItemGlobalClassNames, theme);
    return {
        root: [
            classNames.root,
            {
                display: 'flex',
                alignItems: 'stretch',
                boxSizing: 'border-box',
                width: '100%',
                position: 'relative',
                selectors: {
                    '&:hover': {
                        background: semanticColors.menuItemBackgroundHovered,
                    },
                    '&:hover .ms-Suggestions-closeButton': {
                        display: 'block',
                    },
                },
            },
            suggested && {
                selectors: {
                    ':after': {
                        pointerEvents: 'none',
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        right: 0,
                        border: "1px solid " + theme.semanticColors.focusBorder,
                    },
                },
            },
            className,
        ],
        itemButton: [
            classNames.itemButton,
            {
                width: '100%',
                padding: 0,
                border: 'none',
                height: '100%',
                // Force the item button to be collapsible so it can always shrink
                // to accommodate the close button as a peer in its flex container.
                minWidth: 0,
                // Require for IE11 to truncate the component.
                overflow: 'hidden',
                selectors: (_a = {},
                    _a[HighContrastSelector] = {
                        color: 'WindowText',
                        selectors: {
                            ':hover': {
                                background: 'Highlight',
                                color: 'HighlightText',
                                MsHighContrastAdjust: 'none',
                            },
                        },
                    },
                    _a[':hover'] = {
                        color: semanticColors.menuItemTextHovered,
                    },
                    _a),
            },
            suggested && [
                classNames.isSuggested,
                {
                    background: semanticColors.menuItemBackgroundPressed,
                    selectors: (_b = {
                            ':hover': {
                                background: semanticColors.menuDivider,
                            }
                        },
                        _b[HighContrastSelector] = {
                            background: 'Highlight',
                            color: 'HighlightText',
                            MsHighContrastAdjust: 'none',
                        },
                        _b),
                },
            ],
        ],
        closeButton: [
            classNames.closeButton,
            {
                display: 'none',
                color: palette.neutralSecondary,
                padding: '0 4px',
                height: 'auto',
                width: 32,
                selectors: (_c = {
                        ':hover, :active': {
                            background: palette.neutralTertiaryAlt,
                            color: palette.neutralDark,
                        }
                    },
                    _c[HighContrastSelector] = {
                        color: 'WindowText',
                    },
                    _c),
            },
            suggested && {
                selectors: {
                    ':hover, :active': {
                        background: palette.neutralTertiary,
                        color: palette.neutralPrimary,
                    },
                },
            },
        ],
    };
}
//# sourceMappingURL=SuggestionsItem.styles.js.map