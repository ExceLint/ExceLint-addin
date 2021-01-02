import { __assign } from "tslib";
import * as React from 'react';
import { getId, classNamesFunction, styled } from '../../../../Utilities';
import { Persona, PersonaSize, } from '../../../../Persona';
import { IconButton } from '../../../../Button';
import { ValidationState } from '../../BasePicker.types';
import { getStyles } from './PeoplePickerItem.styles';
var getClassNames = classNamesFunction();
export var PeoplePickerItemBase = function (props) {
    var item = props.item, onRemoveItem = props.onRemoveItem, index = props.index, selected = props.selected, removeButtonAriaLabel = props.removeButtonAriaLabel, styles = props.styles, theme = props.theme, className = props.className, disabled = props.disabled;
    var itemId = getId();
    var classNames = getClassNames(styles, {
        theme: theme,
        className: className,
        selected: selected,
        disabled: disabled,
        invalid: item.ValidationState === ValidationState.warning,
    });
    var personaStyles = classNames.subComponentStyles
        ? classNames.subComponentStyles.persona
        : undefined;
    var personaCoinStyles = classNames.subComponentStyles
        ? classNames.subComponentStyles.personaCoin
        : undefined;
    return (React.createElement("div", { className: classNames.root, "data-is-focusable": !disabled, "data-is-sub-focuszone": true, "data-selection-index": index, role: 'listitem', "aria-labelledby": 'selectedItemPersona-' + itemId },
        React.createElement("div", { className: classNames.itemContent, id: 'selectedItemPersona-' + itemId },
            React.createElement(Persona, __assign({ size: PersonaSize.size24, styles: personaStyles, coinProps: { styles: personaCoinStyles } }, item))),
        React.createElement(IconButton, { onClick: onRemoveItem, disabled: disabled, iconProps: { iconName: 'Cancel', styles: { root: { fontSize: '12px' } } }, className: classNames.removeButton, ariaLabel: removeButtonAriaLabel })));
};
export var PeoplePickerItem = styled(PeoplePickerItemBase, getStyles, undefined, { scope: 'PeoplePickerItem' });
//# sourceMappingURL=PeoplePickerItem.js.map