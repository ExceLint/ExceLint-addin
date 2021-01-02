"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_1 = require("react");
var Utilities_1 = require("../../Utilities");
var Link_1 = require("../../Link");
var GroupSpacer_1 = require("./GroupSpacer");
var getClassNames = Utilities_1.classNamesFunction();
exports.GroupShowAllBase = function (props) {
    var group = props.group, groupLevel = props.groupLevel, _a = props.showAllLinkText, showAllLinkText = _a === void 0 ? 'Show All' : _a, styles = props.styles, theme = props.theme, onToggleSummarize = props.onToggleSummarize;
    var classNames = getClassNames(styles, { theme: theme });
    var memoizedOnClick = react_1.useCallback(function (ev) {
        onToggleSummarize(group);
        ev.stopPropagation();
        ev.preventDefault();
    }, [onToggleSummarize, group]);
    if (group) {
        return (React.createElement("div", { className: classNames.root },
            React.createElement(GroupSpacer_1.GroupSpacer, { count: groupLevel }),
            React.createElement(Link_1.Link, { onClick: memoizedOnClick }, showAllLinkText)));
    }
    return null;
};
//# sourceMappingURL=GroupShowAll.base.js.map