/** @jsx withSlots */
import * as React from 'react';
import { withSlots, createComponent, getSlots } from '../../../Foundation';
import { StackItemStyles as styles } from './StackItem.styles';
var StackItemView = function (props) {
    var children = props.children;
    if (React.Children.count(children) < 1) {
        return null;
    }
    var Slots = getSlots(props, {
        root: 'div',
    });
    return withSlots(Slots.root, null, children);
};
export var StackItem = createComponent(StackItemView, {
    displayName: 'StackItem',
    styles: styles,
});
export default StackItem;
//# sourceMappingURL=StackItem.js.map