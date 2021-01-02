"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Utilities_1 = require("../../Utilities");
var getClassNames = Utilities_1.classNamesFunction();
exports.VerticalDividerBase = function (props) {
    // eslint-disable-next-line deprecation/deprecation
    var styles = props.styles, theme = props.theme, deprecatedGetClassNames = props.getClassNames, className = props.className;
    var classNames = getClassNames(styles, { theme: theme, getClassNames: deprecatedGetClassNames, className: className });
    return (React.createElement("span", { className: classNames.wrapper },
        React.createElement("span", { className: classNames.divider })));
};
exports.VerticalDividerBase.displayName = 'VerticalDividerBase';
//# sourceMappingURL=VerticalDivider.base.js.map