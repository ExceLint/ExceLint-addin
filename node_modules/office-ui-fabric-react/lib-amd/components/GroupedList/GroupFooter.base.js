define(["require", "exports", "react", "../../Utilities", "./GroupSpacer"], function (require, exports, React, Utilities_1, GroupSpacer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    exports.GroupFooterBase = function (props) {
        var group = props.group, groupLevel = props.groupLevel, footerText = props.footerText, indentWidth = props.indentWidth, styles = props.styles, theme = props.theme;
        var classNames = getClassNames(styles, { theme: theme });
        if (group && footerText) {
            return (React.createElement("div", { className: classNames.root },
                React.createElement(GroupSpacer_1.GroupSpacer, { indentWidth: indentWidth, count: groupLevel }),
                footerText));
        }
        return null;
    };
});
//# sourceMappingURL=GroupFooter.base.js.map