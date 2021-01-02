define(["require", "exports", "react", "../../Utilities"], function (require, exports, React, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    exports.SeparatorBase = function (props) {
        var styles = props.styles, theme = props.theme, className = props.className, vertical = props.vertical, alignContent = props.alignContent;
        var _classNames = getClassNames(styles, {
            theme: theme,
            className: className,
            alignContent: alignContent,
            vertical: vertical,
        });
        return (React.createElement("div", { className: _classNames.root },
            React.createElement("div", { className: _classNames.content, role: "separator", "aria-orientation": vertical ? 'vertical' : 'horizontal' }, props.children)));
    };
});
//# sourceMappingURL=Separator.base.js.map