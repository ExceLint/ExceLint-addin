import * as React from 'react';
import { IAutofillProps, IAutofill } from './Autofill.types';
export interface IAutofillState {
    displayValue?: string;
}
/**
 * {@docCategory Autofill}
 */
export declare class Autofill extends React.Component<IAutofillProps, IAutofillState> implements IAutofill {
    static defaultProps: {
        enableAutofillOnKeyPress: number[];
    };
    private _inputElement;
    private _autoFillEnabled;
    private _value;
    private _isComposing;
    private _async;
    constructor(props: IAutofillProps);
    readonly cursorLocation: number | null;
    readonly isValueSelected: boolean;
    readonly value: string;
    readonly selectionStart: number | null;
    readonly selectionEnd: number | null;
    readonly inputElement: HTMLInputElement | null;
    UNSAFE_componentWillReceiveProps(nextProps: IAutofillProps): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    render(): JSX.Element;
    focus(): void;
    clear(): void;
    private _onCompositionStart;
    private _onCompositionUpdate;
    private _onCompositionEnd;
    private _onClick;
    private _onKeyDown;
    private _onInputChanged;
    private _onChanged;
    private _getCurrentInputValue;
    /**
     * Attempts to enable autofill. Whether or not autofill is enabled depends on the input value,
     * whether or not any text is selected, and only if the new input value is longer than the old input value.
     * Autofill should never be set to true if the value is composing. Once compositionEnd is called, then
     * it should be completed.
     * See https://developer.mozilla.org/en-US/docs/Web/API/CompositionEvent for more information on composition.
     * @param newValue - new input value
     * @param oldValue - old input value
     * @param isComposing - if true then the text is actively being composed and it has not completed.
     * @param isComposed - if the text is a composed text value.
     */
    private _tryEnableAutofill;
    private _notifyInputChange;
    /**
     * Updates the current input value as well as getting a new display value.
     * @param newValue - The new value from the input
     */
    private _updateValue;
    /**
     * Returns a string that should be used as the display value.
     * It evaluates this based on whether or not the suggested value starts with the input value
     * and whether or not autofill is enabled.
     * @param inputValue - the value that the input currently has.
     * @param suggestedDisplayValue - the possible full value
     */
    private _getDisplayValue;
    private _doesTextStartWith;
}
/**
 *  @deprecated do not use.
 * {@docCategory Autofill}
 */
export declare class BaseAutoFill extends Autofill {
}
