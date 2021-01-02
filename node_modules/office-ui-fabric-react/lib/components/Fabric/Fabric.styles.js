import { getGlobalClassNames } from '../../Styling';
var inheritFont = { fontFamily: 'inherit' };
var GlobalClassNames = {
    root: 'ms-Fabric',
    bodyThemed: 'ms-Fabric-bodyThemed',
};
export var getStyles = function (props) {
    var theme = props.theme, className = props.className, applyTheme = props.applyTheme;
    var classNames = getGlobalClassNames(GlobalClassNames, theme);
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
//# sourceMappingURL=Fabric.styles.js.map