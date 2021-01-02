define(["require", "exports", "../../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalClassNames = {
        root: 'ms-StackItem',
    };
    var alignMap = {
        start: 'flex-start',
        end: 'flex-end',
    };
    exports.StackItemStyles = function (props, theme, tokens) {
        var grow = props.grow, shrink = props.shrink, disableShrink = props.disableShrink, align = props.align, verticalFill = props.verticalFill, order = props.order, className = props.className;
        var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
        return {
            root: [
                theme.fonts.medium,
                classNames.root,
                {
                    margin: tokens.margin,
                    padding: tokens.padding,
                    height: verticalFill ? '100%' : 'auto',
                    width: 'auto',
                },
                grow && { flexGrow: grow === true ? 1 : grow },
                (disableShrink || (!grow && !shrink)) && {
                    flexShrink: 0,
                },
                shrink &&
                    !disableShrink && {
                    flexShrink: 1,
                },
                align && {
                    alignSelf: alignMap[align] || align,
                },
                order && {
                    order: order,
                },
                className,
            ],
        };
    };
});
//# sourceMappingURL=StackItem.styles.js.map