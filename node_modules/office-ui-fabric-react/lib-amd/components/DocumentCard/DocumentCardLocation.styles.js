define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentCardLocationGlobalClassNames = {
        root: 'ms-DocumentCardLocation',
    };
    exports.getStyles = function (props) {
        var theme = props.theme, className = props.className;
        var palette = theme.palette, fonts = theme.fonts;
        var classNames = Styling_1.getGlobalClassNames(exports.DocumentCardLocationGlobalClassNames, theme);
        return {
            root: [
                classNames.root,
                fonts.small,
                {
                    color: palette.themePrimary,
                    display: 'block',
                    fontWeight: Styling_1.FontWeights.semibold,
                    overflow: 'hidden',
                    padding: '8px 16px',
                    position: 'relative',
                    textDecoration: 'none',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    selectors: {
                        ':hover': {
                            color: palette.themePrimary,
                            cursor: 'pointer',
                        },
                    },
                },
                className,
            ],
        };
    };
});
//# sourceMappingURL=DocumentCardLocation.styles.js.map