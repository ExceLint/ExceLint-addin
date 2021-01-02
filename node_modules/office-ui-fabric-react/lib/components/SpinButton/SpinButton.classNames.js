import { memoizeFunction } from '../../Utilities';
import { mergeStyles } from '../../Styling';
import { Position } from '../../utilities/positioning';
export var getClassNames = memoizeFunction(function (styles, disabled, isFocused, keyboardSpinDirection, labelPosition, className) {
    if (labelPosition === void 0) { labelPosition = Position.start; }
    if (className === void 0) { className = undefined; }
    return {
        root: mergeStyles(styles.root, className),
        labelWrapper: mergeStyles(styles.labelWrapper, _getStyleForLabelBasedOnPosition(labelPosition, styles)),
        icon: mergeStyles(styles.icon, disabled && styles.iconDisabled),
        label: mergeStyles(styles.label),
        spinButtonWrapper: mergeStyles(styles.spinButtonWrapper, _getStyleForRootBasedOnPosition(labelPosition, styles), !disabled && [
            {
                selectors: {
                    ':hover': styles.spinButtonWrapperHovered,
                },
            },
            isFocused && {
                // This is to increase the specificity of the focus styles
                // and make it equal to that of the hover styles.
                selectors: {
                    '&&': styles.spinButtonWrapperFocused,
                },
            },
        ], disabled && styles.spinButtonWrapperDisabled),
        input: mergeStyles('ms-spinButton-input', styles.input, !disabled && {
            selectors: {
                '::selection': styles.inputTextSelected,
            },
        }, disabled && styles.inputDisabled),
        arrowBox: mergeStyles(styles.arrowButtonsContainer, disabled && styles.arrowButtonsContainerDisabled),
    };
});
/**
 * Returns the Style corresponding to the label position
 */
function _getStyleForLabelBasedOnPosition(labelPosition, styles) {
    switch (labelPosition) {
        case Position.start:
            return styles.labelWrapperStart;
        case Position.end:
            return styles.labelWrapperEnd;
        case Position.top:
            return styles.labelWrapperTop;
        case Position.bottom:
            return styles.labelWrapperBottom;
    }
}
/**
 * Returns the Style corresponding to the label position
 */
function _getStyleForRootBasedOnPosition(labelPosition, styles) {
    switch (labelPosition) {
        case Position.top:
        case Position.bottom:
            return styles.spinButtonWrapperTopBottom;
        default:
            return {};
    }
}
//# sourceMappingURL=SpinButton.classNames.js.map