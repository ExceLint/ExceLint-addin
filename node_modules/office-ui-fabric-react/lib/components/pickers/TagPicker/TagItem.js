import * as React from 'react';
import { styled, classNamesFunction } from '../../../Utilities';
import { IconButton } from '../../../Button';
import { getStyles } from './TagItem.styles';
var getClassNames = classNamesFunction();
/**
 * {@docCategory TagPicker}
 */
export var TagItemBase = function (props) {
    var theme = props.theme, styles = props.styles, selected = props.selected, disabled = props.disabled, enableTagFocusInDisabledPicker = props.enableTagFocusInDisabledPicker, children = props.children, className = props.className, index = props.index, onRemoveItem = props.onRemoveItem, removeButtonAriaLabel = props.removeButtonAriaLabel, _a = props.title, title = _a === void 0 ? typeof props.children === 'string' ? props.children : props.item.name : _a;
    var classNames = getClassNames(styles, {
        theme: theme,
        className: className,
        selected: selected,
        disabled: disabled,
    });
    return (React.createElement("div", { className: classNames.root, role: 'listitem', key: index, "data-selection-index": index, "data-is-focusable": (enableTagFocusInDisabledPicker || !disabled) && true },
        React.createElement("span", { className: classNames.text, "aria-label": title, title: title }, children),
        React.createElement(IconButton, { onClick: onRemoveItem, disabled: disabled, iconProps: { iconName: 'Cancel', styles: { root: { fontSize: '12px' } } }, className: classNames.close, ariaLabel: removeButtonAriaLabel })));
};
export var TagItem = styled(TagItemBase, getStyles, undefined, {
    scope: 'TagItem',
});
//# sourceMappingURL=TagItem.js.map