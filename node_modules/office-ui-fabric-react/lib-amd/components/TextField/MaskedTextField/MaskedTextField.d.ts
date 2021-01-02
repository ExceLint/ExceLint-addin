import * as React from 'react';
import { ITextField, IMaskedTextFieldProps } from '../TextField.types';
/**
 * State for the MaskedTextField component.
 */
export interface IMaskedTextFieldState {
    /**
     * The mask string formatted with the input value.
     * This is what is displayed inside the TextField
     * @example
     *  `Phone Number: 12_ - 4___`
     */
    displayValue: string;
    /** The index into the rendered value of the first unfilled format character */
    maskCursorPosition?: number;
}
export declare const DEFAULT_MASK_CHAR = "_";
export declare class MaskedTextField extends React.Component<IMaskedTextFieldProps, IMaskedTextFieldState> implements ITextField {
    static defaultProps: IMaskedTextFieldProps;
    private _textField;
    /**
     *  An array of data containing information regarding the format characters,
     *  their indices inside the display text, and their corresponding values.
     * @example
     * ```
     *  [
     *    { value: '1', displayIndex: 16, format: /[0-9]/ },
     *    { value: '2', displayIndex: 17, format: /[0-9]/ },
     *    { displayIndex: 18, format: /[0-9]/ },
     *    { value: '4', displayIndex: 22, format: /[0-9]/ },
     *    ...
     *  ]
     * ```
     */
    private _maskCharData;
    /** True if the TextField is focused */
    private _isFocused;
    /** True if the TextField was not focused and it was clicked into */
    private _moveCursorOnMouseUp;
    /** The stored selection data prior to input change events. */
    private _changeSelectionData;
    constructor(props: IMaskedTextFieldProps);
    UNSAFE_componentWillReceiveProps(newProps: IMaskedTextFieldProps): void;
    componentDidUpdate(): void;
    render(): JSX.Element;
    /**
     * @returns The value of all filled format characters or undefined if not all format characters are filled
     */
    readonly value: string | undefined;
    setValue(newValue: string): void;
    focus(): void;
    blur(): void;
    select(): void;
    setSelectionStart(value: number): void;
    setSelectionEnd(value: number): void;
    setSelectionRange(start: number, end: number): void;
    readonly selectionStart: number | null;
    readonly selectionEnd: number | null;
    private _onFocus;
    private _onBlur;
    private _onMouseDown;
    private _onMouseUp;
    private _onInputChange;
    private _onKeyDown;
    private _onPaste;
}
