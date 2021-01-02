"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Icon_1 = require("../../Icon");
var Utilities_1 = require("../../Utilities");
var getClassNames = Utilities_1.classNamesFunction();
exports.CheckBase = function (props) {
    var _a = props.checked, checked = _a === void 0 ? false : _a, className = props.className, theme = props.theme, styles = props.styles, _b = props.useFastIcons, useFastIcons = _b === void 0 ? true : _b;
    var classNames = getClassNames(styles, { theme: theme, className: className, checked: checked });
    var IconComponent = useFastIcons ? Icon_1.FontIcon : Icon_1.Icon;
    return (React.createElement("div", { className: classNames.root },
        React.createElement(IconComponent, { iconName: "CircleRing", className: classNames.circle }),
        React.createElement(IconComponent, { iconName: "StatusCircleCheckmark", className: classNames.check })));
};
exports.CheckBase.displayName = 'CheckBase';
//# sourceMappingURL=Check.base.js.map