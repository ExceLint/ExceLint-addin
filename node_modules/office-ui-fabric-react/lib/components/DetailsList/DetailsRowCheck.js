import { __assign, __rest } from "tslib";
import * as React from 'react';
import { css, styled, classNamesFunction } from '../../Utilities';
import { Check } from '../../Check';
import { getStyles } from './DetailsRowCheck.styles';
import { composeRenderFunction } from '@uifabric/utilities';
var getClassNames = classNamesFunction();
var DetailsRowCheckBase = function (props) {
    var _a = props.isVisible, isVisible = _a === void 0 ? false : _a, _b = props.canSelect, canSelect = _b === void 0 ? false : _b, _c = props.anySelected, anySelected = _c === void 0 ? false : _c, _d = props.selected, selected = _d === void 0 ? false : _d, _e = props.isHeader, isHeader = _e === void 0 ? false : _e, className = props.className, checkClassName = props.checkClassName, styles = props.styles, theme = props.theme, compact = props.compact, onRenderDetailsCheckbox = props.onRenderDetailsCheckbox, _f = props.useFastIcons, useFastIcons = _f === void 0 ? true : _f, // must be removed from buttonProps
    buttonProps = __rest(props, ["isVisible", "canSelect", "anySelected", "selected", "isHeader", "className", "checkClassName", "styles", "theme", "compact", "onRenderDetailsCheckbox", "useFastIcons"]);
    var defaultCheckboxRender = useFastIcons ? _fastDefaultCheckboxRender : _defaultCheckboxRender;
    var onRenderCheckbox = onRenderDetailsCheckbox
        ? composeRenderFunction(onRenderDetailsCheckbox, defaultCheckboxRender)
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
    return canSelect ? (React.createElement("div", __assign({}, buttonProps, { role: "checkbox", 
        // eslint-disable-next-line deprecation/deprecation
        className: css(classNames.root, classNames.check), "aria-checked": selected, "data-selection-toggle": true, "data-automationid": "DetailsRowCheck" }), onRenderCheckbox(detailsCheckboxProps))) : (
    // eslint-disable-next-line deprecation/deprecation
    React.createElement("div", __assign({}, buttonProps, { className: css(classNames.root, classNames.check) })));
};
var FastCheck = React.memo(function (props) {
    return React.createElement(Check, { theme: props.theme, checked: props.checked, className: props.className, useFastIcons: true });
});
function _defaultCheckboxRender(checkboxProps) {
    return React.createElement(Check, { checked: checkboxProps.checked });
}
function _fastDefaultCheckboxRender(checkboxProps) {
    return React.createElement(FastCheck, { theme: checkboxProps.theme, checked: checkboxProps.checked });
}
export var DetailsRowCheck = styled(DetailsRowCheckBase, getStyles, undefined, { scope: 'DetailsRowCheck' }, true);
//# sourceMappingURL=DetailsRowCheck.js.map