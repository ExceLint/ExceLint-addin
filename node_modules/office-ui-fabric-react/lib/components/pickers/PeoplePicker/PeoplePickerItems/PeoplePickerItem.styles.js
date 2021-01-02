import { getGlobalClassNames, getFocusStyle, HighContrastSelector } from '../../../../Styling';
import { ButtonGlobalClassNames } from '../../../Button/BaseButton.classNames';
var GlobalClassNames = {
    root: 'ms-PickerPersona-container',
    itemContent: 'ms-PickerItem-content',
    removeButton: 'ms-PickerItem-removeButton',
    isSelected: 'is-selected',
    isInvalid: 'is-invalid',
};
var REMOVE_BUTTON_SIZE = 24;
export function getStyles(props) {
    var _a, _b, _c, _d, _e, _f, _g;
    var className = props.className, theme = props.theme, selected = props.selected, invalid = props.invalid, disabled = props.disabled;
    var palette = theme.palette, semanticColors = theme.semanticColors, fonts = theme.fonts;
    var classNames = getGlobalClassNames(GlobalClassNames, theme);
    var personaPrimaryTextStyles = [
        selected &&
            !invalid &&
            !disabled && {
            color: palette.white,
            selectors: (_a = {
                    ':hover': {
                        color: palette.white,
                    }
                },
                _a[HighContrastSelector] = {
                    color: 'HighlightText',
                },
                _a),
        },
        ((invalid && !selected) || (invalid && selected && disabled)) && {
            color: palette.redDark,
            borderBottom: "2px dotted " + palette.redDark,
            selectors: (_b = {},
                _b["." + classNames.root + ":hover &"] = {
                    // override Persona root:hover selector
                    color: palette.redDark,
                },
                _b),
        },
        invalid &&
            selected &&
            !disabled && {
            color: palette.white,
            borderBottom: "2px dotted " + palette.white,
        },
        disabled && {
            selectors: (_c = {},
                _c[HighContrastSelector] = {
                    color: 'GrayText',
                },
                _c),
        },
    ];
    var personaCoinInitialsStyles = [
        invalid && {
            fontSize: fonts.xLarge.fontSize,
        },
    ];
    return {
        root: [
            classNames.root,
            getFocusStyle(theme, { inset: -2 }),
            {
                borderRadius: 15,
                display: 'inline-flex',
                alignItems: 'center',
                background: palette.neutralLighter,
                margin: '1px 2px',
                cursor: 'default',
                userSelect: 'none',
                maxWidth: 300,
                verticalAlign: 'middle',
                minWidth: 0,
                selectors: (_d = {
                        ':hover': {
                            background: !selected && !disabled ? palette.neutralLight : '',
                        }
                    },
                    _d[HighContrastSelector] = [{ border: '1px solid WindowText' }, disabled && { borderColor: 'GrayText' }],
                    _d),
            },
            selected &&
                !disabled && [
                classNames.isSelected,
                {
                    background: palette.themePrimary,
                    selectors: (_e = {},
                        _e[HighContrastSelector] = {
                            borderColor: 'HighLight',
                            background: 'Highlight',
                            MsHighContrastAdjust: 'none',
                        },
                        _e),
                },
            ],
            invalid && [classNames.isInvalid],
            invalid &&
                selected &&
                !disabled && {
                background: palette.redDark,
            },
            className,
        ],
        itemContent: [
            classNames.itemContent,
            {
                flex: '0 1 auto',
                minWidth: 0,
                // CSS below is needed for IE 11 to properly truncate long persona names in the picker
                // and to clip the presence indicator (in all browsers)
                maxWidth: '100%',
                overflow: 'hidden',
            },
        ],
        removeButton: [
            classNames.removeButton,
            {
                borderRadius: 15,
                color: palette.neutralPrimary,
                flex: '0 0 auto',
                width: REMOVE_BUTTON_SIZE,
                height: REMOVE_BUTTON_SIZE,
                selectors: {
                    ':hover': {
                        background: palette.neutralTertiaryAlt,
                        color: palette.neutralDark,
                    },
                },
            },
            selected && [
                {
                    color: palette.white,
                    selectors: (_f = {
                            ':hover': {
                                color: palette.white,
                                background: palette.themeDark,
                            },
                            ':active': {
                                color: palette.white,
                                background: palette.themeDarker,
                            }
                        },
                        _f[HighContrastSelector] = {
                            color: 'HighlightText',
                        },
                        _f),
                },
                invalid && {
                    selectors: {
                        ':hover': {
                            background: palette.red,
                        },
                        ':active': {
                            background: palette.redDark,
                        },
                    },
                },
            ],
            disabled && {
                selectors: (_g = {},
                    _g["." + ButtonGlobalClassNames.msButtonIcon] = {
                        color: semanticColors.buttonText,
                    },
                    _g),
            },
        ],
        subComponentStyles: {
            persona: {
                primaryText: personaPrimaryTextStyles,
            },
            personaCoin: {
                initials: personaCoinInitialsStyles,
            },
        },
    };
}
//# sourceMappingURL=PeoplePickerItem.styles.js.map