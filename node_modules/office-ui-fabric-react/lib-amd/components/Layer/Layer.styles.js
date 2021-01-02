define(["require", "exports", "../../Styling"], function (require, exports, Styling_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GlobalClassNames = {
        root: 'ms-Layer',
        rootNoHost: 'ms-Layer--fixed',
        content: 'ms-Layer-content',
    };
    exports.getStyles = function (props) {
        var className = props.className, isNotHost = props.isNotHost, theme = props.theme;
        var classNames = Styling_1.getGlobalClassNames(GlobalClassNames, theme);
        return {
            root: [
                classNames.root,
                theme.fonts.medium,
                isNotHost && [
                    classNames.rootNoHost,
                    {
                        position: 'fixed',
                        zIndex: Styling_1.ZIndexes.Layer,
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        visibility: 'hidden',
                    },
                ],
                className,
            ],
            content: [
                classNames.content,
                {
                    visibility: 'visible',
                },
            ],
        };
    };
});
//# sourceMappingURL=Layer.styles.js.map