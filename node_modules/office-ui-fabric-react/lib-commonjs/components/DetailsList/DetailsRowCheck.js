"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var Check_1 = require("../../Check");
var DetailsRowCheck_styles_1 = require("./DetailsRowCheck.styles");
var utilities_1 = require("@uifabric/utilities");
var getClassNames = Utilities_1.classNamesFunction();
var DetailsRowCheckBase = function (props) {
    var _a = props.isVisible, isVisible = _a === void 0 ? false : _a, _b = props.canSelect, canSelect = _b === void 0 ? false : _b, _c = props.anySelected, anySelected = _c === void 0 ? false : _c, _d = props.selected, selected = _d === void 0 ? false : _d, _e = props.isHeader, isHeader = _e === void 0 ? false : _e, className = props.className, checkClassName = props.checkClassName, styles = props.styles, theme = props.theme, compact = props.compact, onRenderDetailsCheckbox = props.onRenderDetailsCheckbox, _f = props.useFastIcons, useFastIcons = _f === void 0 ? true : _f, // must be removed from buttonProps
    buttonProps = tslib_1.__rest(props, ["isVisible", "canSelect", "anySelected", "selected", "isHeader", "className", "checkClassName", "styles", "theme", "compact", "onRenderDetailsCheckbox", "useFastIcons"]);
    var defaultCheckboxRender = useFastIcons ? _fastDefaultCheckboxRender : _defaultCheckboxRender;
    var onRenderCheckbox = onRenderDetailsCheckbox
        ? utilities_1.composeRenderFunction(onRenderDetailsCheckbox, defaultCheckboxRender)
        : defaultCheckboxRender;
    var classNames = getClassNames(styles, {
        theme: theme,
        canSelect: canSelect,
        selected: selected,
        anySelected: anySelected,
        className: className,
        isHeader: isHeader,
        isVisible: isVisible,
        compact: compact,
    });
    var detailsCheckboxProps = {
        checked: selected,
        theme: theme,
    };
    return canSelect ? (React.createElement("div", tslib_1.__assign({}, buttonProps, { role: "checkbox", 
        // eslint-disable-next-line deprecation/deprecation
        className: Utilities_1.css(classNames.root, classNames.check), "aria-checked": selected, "data-selection-toggle": true, "data-automationid": "DetailsRowCheck" }), onRenderCheckbox(detailsCheckboxProps))) : (
    // eslint-disable-next-line deprecation/deprecation
    React.createElement("div", tslib_1.__assign({}, buttonProps, { className: Utilities_1.css(classNames.root, classNames.check) })));
};
var FastCheck = React.memo(function (props) {
    return React.createElement(Check_1.Check, { theme: props.theme, checked: props.checked, className: props.className, useFastIcons: true });
});
function _defaultCheckboxRender(checkboxProps) {
    return React.createElement(Check_1.Check, { checked: checkboxProps.checked });
}
function _fastDefaultCheckboxRender(checkboxProps) {
    return React.createElement(FastCheck, { theme: checkboxProps.theme, checked: checkboxProps.checked });
}
exports.DetailsRowCheck = Utilities_1.styled(DetailsRowCheckBase, DetailsRowCheck_styles_1.getStyles, undefined, { scope: 'DetailsRowCheck' }, true);
//# sourceMappingURL=DetailsRowCheck.js.map