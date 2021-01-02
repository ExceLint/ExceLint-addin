import { ISpinButtonClassNames, ISpinButtonStyles } from './SpinButton.types';
import { KeyboardSpinDirection } from './SpinButton';
import { Position } from '../../utilities/positioning';
export declare const getClassNames: (styles: ISpinButtonStyles, disabled: boolean, isFocused: boolean, keyboardSpinDirection: KeyboardSpinDirection, labelPosition?: Position, className?: string | undefined) => ISpinButtonClassNames;
