"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Utilities_1 = require("../../../Utilities");
var TagItemSuggestion_styles_1 = require("./TagItemSuggestion.styles");
var getClassNames = Utilities_1.classNamesFunction();
/**
 * {@docCategory TagPicker}
 */
exports.TagItemSuggestionBase = function (props) {
    var styles = props.styles, theme = props.theme, children = props.children;
    var classNames = getClassNames(styles, {
        theme: theme,
    });
    return React.createElement("div", { className: classNames.suggestionTextOverflow },
        " ",
        children,
        " ");
};
exports.TagItemSuggestion = Utilities_1.styled(exports.TagItemSuggestionBase, TagItemSuggestion_styles_1.getStyles, undefined, { scope: 'TagItemSuggestion' });
//# sourceMappingURL=TagItemSuggestion.js.map