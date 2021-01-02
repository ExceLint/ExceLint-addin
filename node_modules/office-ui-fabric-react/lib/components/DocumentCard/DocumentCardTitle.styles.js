import { getGlobalClassNames } from '../../Styling';
export var DocumentCardTitleGlobalClassNames = {
    root: 'ms-DocumentCardTitle',
};
export var getStyles = function (props) {
    var theme = props.theme, className = props.className, showAsSecondaryTitle = props.showAsSecondaryTitle;
    var palette = theme.palette, fonts = theme.fonts;
    var classNames = getGlobalClassNames(DocumentCardTitleGlobalClassNames, theme);
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
//# sourceMappingURL=DocumentCardTitle.styles.js.map