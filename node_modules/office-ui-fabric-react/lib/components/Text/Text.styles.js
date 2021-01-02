export var TextStyles = function (props, theme) {
    var as = props.as, className = props.className, block = props.block, nowrap = props.nowrap, variant = props.variant;
    var fonts = theme.fonts;
    var variantObject = fonts[variant || 'medium'];
    return {
        root: [
            theme.fonts.medium,
            {
                display: block ? (as === 'td' ? 'table-cell' : 'block') : 'inline',
                fontFamily: variantObject.fontFamily,
                fontSize: variantObject.fontSize,
                fontWeight: variantObject.fontWeight,
                color: variantObject.color,
                mozOsxFontSmoothing: variantObject.MozOsxFontSmoothing,
                webkitFontSmoothing: variantObject.WebkitFontSmoothing,
            },
            nowrap && {
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            className,
        ],
    };
};
//# sourceMappingURL=Text.styles.js.map