define(["require", "exports", "../../../Styling", "../../../Utilities", "../BaseButton.styles"], function (require, exports, Styling_1, Utilities_1, BaseButton_styles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_BUTTON_HEIGHT = '40px';
    var DEFAULT_PADDING = '0 4px';
    exports.getStyles = Utilities_1.memoizeFunction(function (theme, customStyles) {
        var _a;
        var baseButtonStyles = BaseButton_styles_1.getStyles(theme);
        var actionButtonStyles = {
            root: {
                padding: DEFAULT_PADDING,
                height: DEFAULT_BUTTON_HEIGHT,
                color: theme.palette.neutralPrimary,
                backgroundColor: 'transparent',
                border: '1px solid transparent',
            },
            rootHovered: {
                color: theme.palette.themePrimary,
                selectors: (_a = {},
                    _a[Styling_1.HighContrastSelector] = {
                        borderColor: 'Highlight',
                        color: 'Highlight',
                    },
                    _a),
            },
            iconHovered: {
                color: theme.palette.themePrimary,
            },
            rootPressed: {
                color: theme.palette.black,
            },
            rootExpanded: {
                color: theme.palette.themePrimary,
            },
            iconPressed: {
                color: theme.palette.themeDarker,
            },
            rootDisabled: {
                color: theme.palette.neutralTertiary,
                backgroundColor: 'transparent',
                borderColor: 'transparent',
            },
            rootChecked: {
                color: theme.palette.black,
            },
            iconChecked: {
                color: theme.palette.themeDarker,
            },
            flexContainer: {
                justifyContent: 'flex-start',
            },
            icon: {
                color: theme.palette.themeDarkAlt,
            },
            iconDisabled: {
                color: 'inherit',
            },
            menuIcon: {
                color: theme.palette.neutralSecondary,
            },
            textContainer: {
                flexGrow: 0,
            },
        };
        return Styling_1.concatStyleSets(baseButtonStyles, actionButtonStyles, customStyles);
    });
});
//# sourceMappingURL=ActionButton.styles.js.map