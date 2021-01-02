"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Styling_1 = require("../../../Styling");
var BaseButton_classNames_1 = require("../../Button/BaseButton.classNames");
var Utilities_1 = require("../../../Utilities");
var GlobalClassNames = {
    root: 'ms-TagItem',
    text: 'ms-TagItem-text',
    close: 'ms-TagItem-close',
    isSelected: 'is-selected',
};
var TAG_HEIGHT = 26;
function getStyles(props) {
    var _a, _b, _c, _d;
    var className = props.className, theme = props.theme, selected = props.selected, disabled = props.disabled;
    var palette = theme.palette, effects = theme.effects, fonts = theme.fonts, semanticColors = theme.semanticColors;
    var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
    return {
        root: [
            classNames.root,
            fonts.medium,
            Styling_1.getFocusStyle(theme),
            {
                boxSizing: 'content-box',
                flexShrink: '1',
                margin: 2,
                height: TAG_HEIGHT,
                lineHeight: TAG_HEIGHT,
                cursor: 'default',
                userSelect: 'none',
                display: 'flex',
                flexWrap: 'nowrap',
                maxWidth: 300,
                minWidth: 0,
                borderRadius: effects.roundedCorner2,
                color: semanticColors.inputText,
                background: !selected || disabled ? palette.neutralLighter : palette.themePrimary,
                selectors: (_a = {
                        ':hover': [
                            !disabled &&
                                !selected && {
                                color: palette.neutralDark,
                                background: palette.neutralLight,
                                selectors: {
                                    '.ms-TagItem-close': {
                                        color: palette.neutralPrimary,
                                    },
                                },
                            },
                            disabled && { background: palette.neutralLighter },
                            selected && !disabled && { background: palette.themePrimary },
                        ]
                    },
                    _a[Styling_1.HighContrastSelector] = {
                        border: "1px solid " + (!selected ? 'WindowText' : 'WindowFrame'),
                    },
                    _a),
            },
            disabled && {
                selectors: (_b = {},
                    _b[Styling_1.HighContrastSelector] = {
                        borderColor: 'GrayText',
                    },
                    _b),
            },
            selected &&
                !disabled && [
                classNames.isSelected,
                {
                    color: palette.white,
                },
            ],
            className,
        ],
        text: [
            classNames.text,
            {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 30,
                margin: '0 8px',
            },
            disabled && {
                selectors: (_c = {},
                    _c[Styling_1.HighContrastSelector] = {
                        color: 'GrayText',
                    },
                    _c),
            },
        ],
        close: [
            classNames.close,
            {
                color: palette.neutralSecondary,
                width: 30,
                height: '100%',
                flex: '0 0 auto',
                borderRadius: Utilities_1.getRTL(theme)
                    ? effects.roundedCorner2 + " 0 0 " + effects.roundedCorner2
                    : "0 " + effects.roundedCorner2 + " " + effects.roundedCorner2 + " 0",
                selectors: {
                    ':hover': {
                        background: palette.neutralQuaternaryAlt,
                        color: palette.neutralPrimary,
                    },
                    ':active': {
                        color: palette.white,
                        backgroundColor: palette.themeDark,
                    },
                },
            },
            selected && {
                color: palette.white,
                selectors: {
                    ':hover': {
                        color: palette.white,
                        background: palette.themeDark,
                    },
                },
            },
            disabled && {
                selectors: (_d = {},
                    _d["." + BaseButton_classNames_1.ButtonGlobalClassNames.msButtonIcon] = {
                        color: palette.neutralSecondary,
                    },
                    _d),
            },
        ],
    };
}
exports.getStyles = getStyles;
//# sourceMappingURL=TagItem.styles.js.map