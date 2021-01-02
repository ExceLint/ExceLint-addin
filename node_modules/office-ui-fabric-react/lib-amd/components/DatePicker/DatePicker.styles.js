define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalClassNames = {
        root: 'ms-DatePicker',
        callout: 'ms-DatePicker-callout',
        withLabel: 'ms-DatePicker-event--with-label',
        withoutLabel: 'ms-DatePicker-event--without-label',
        disabled: 'msDatePickerDisabled ',
    };
    exports.styles = function (props) {
        var className = props.className, theme = props.theme, disabled = props.disabled, label = props.label, isDatePickerShown = props.isDatePickerShown;
        var palette = theme.palette, semanticColors = theme.semanticColors, effects = theme.effects, fonts = theme.fonts;
        var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
        var DatePickerIcon = {
            color: palette.neutralSecondary,
            fontSize: fonts.mediumPlus.fontSize,
            lineHeight: '18px',
            pointerEvents: 'none',
            position: 'absolute',
            right: '4px',
            padding: '5px',
        };
        return {
            root: [classNames.root, theme.fonts.medium, isDatePickerShown && 'is-open', Styling_1.normalize, className],
            textField: [
                {
                    position: 'relative',
                    selectors: {
                        '& input[readonly]': {
                            cursor: 'pointer',
                        },
                        input: {
                            selectors: {
                                '::-ms-clear': {
                                    display: 'none',
                                },
                            },
                        },
                    },
                },
                disabled && {
                    selectors: {
                        '& input[readonly]': {
                            cursor: 'default',
                        },
                    },
                },
            ],
            callout: [classNames.callout, { boxShadow: effects.elevation8 }],
            icon: [
                DatePickerIcon,
                label ? classNames.withLabel : classNames.withoutLabel,
                { paddingTop: '7px' },
                !disabled && [
                    classNames.disabled,
                    {
                        pointerEvents: 'initial',
                        cursor: 'pointer',
                    },
                ],
                disabled && {
                    color: semanticColors.disabledText,
                    cursor: 'default',
                },
            ],
        };
    };
});
//# sourceMappingURL=DatePicker.styles.js.map