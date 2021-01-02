define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var inheritFont = { fontFamily: 'inherit' };
    var GlobalClassNames = {
        root: 'ms-Fabric',
        bodyThemed: 'ms-Fabric-bodyThemed',
    };
    exports.getStyles = function (props) {
        var theme = props.theme, className = props.className, applyTheme = props.applyTheme;
        var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
        return {
            root: [
                classNames.root,
                theme.fonts.medium,
                {
                    color: theme.palette.neutralPrimary,
                    selectors: {
                        '& button': inheritFont,
                        '& input': inheritFont,
                        '& textarea': inheritFont,
                    },
                },
                // apply theme to only if applyTheme is true
                applyTheme && {
                    color: theme.semanticColors.bodyText,
                    backgroundColor: theme.semanticColors.bodyBackground,
                },
                className,
            ],
            bodyThemed: [
                {
                    backgroundColor: theme.semanticColors.bodyBackground,
                },
            ],
        };
    };
});
//# sourceMappingURL=Fabric.styles.js.map