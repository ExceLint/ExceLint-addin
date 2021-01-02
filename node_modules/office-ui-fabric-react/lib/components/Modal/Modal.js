import { styled } from '../../Utilities';
import { ModalBase } from './Modal.base';
import { getStyles } from './Modal.styles';
export var Modal = styled(ModalBase, getStyles, undefined, {
    scope: 'Modal',
    fields: ['theme', 'styles', 'enableAriaHiddenSiblings'],
});
//# sourceMappingURL=Modal.js.map