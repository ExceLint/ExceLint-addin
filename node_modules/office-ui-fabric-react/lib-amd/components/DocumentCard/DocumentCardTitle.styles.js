define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentCardTitleGlobalClassNames = {
        root: 'ms-DocumentCardTitle',
    };
    exports.getStyles = function (props) {
        var theme = props.theme, className = props.className, showAsSecondaryTitle = props.showAsSecondaryTitle;
        var palette = theme.palette, fonts = theme.fonts;
        var classNames = Styling_1.getGlobalClassNames(exports.DocumentCardTitleGlobalClassNames, theme);
        return {
            root: [
                classNames.root,
                showAsSecondaryTitle ? fonts.medium : fonts.large,
                {
                    padding: '8px 16px',
                    display: 'block',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    height: showAsSecondaryTitle ? '45px' : '38px',
                    lineHeight: showAsSecondaryTitle ? '18px' : '21px',
                    color: showAsSecondaryTitle ? palette.neutralSecondary : palette.neutralPrimary,
                },
                className,
            ],
        };
    };
});
//# sourceMappingURL=DocumentCardTitle.styles.js.map