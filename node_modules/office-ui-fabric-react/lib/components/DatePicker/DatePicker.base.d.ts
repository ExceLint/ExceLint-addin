import * as React from 'react';
import { IDatePicker, IDatePickerProps } from './DatePicker.types';
export interface IDatePickerState {
    selectedDate?: Date;
    formattedDate?: string;
    isDatePickerShown?: boolean;
    errorMessage?: string;
}
export declare class DatePickerBase extends React.Component<IDatePickerProps, IDatePickerState> implements IDatePicker {
    static defaultProps: IDatePickerProps;
    private _calendar;
    private _datePickerDiv;
    private _textField;
    private _preventFocusOpeningPicker;
    private _id;
    constructor(props: IDatePickerProps);
    UNSAFE_componentWillReceiveProps(nextProps: IDatePickerProps): void;
    componentDidUpdate(prevProps: IDatePickerProps, prevState: IDatePickerState): void;
    render(): JSX.Element;
    focus(): void;
    reset(): void;
    private _setErrorMessage;
    private _onSelectDate;
    private _onCalloutPositioned;
    private _onTextFieldFocus;
    private _onTextFieldBlur;
    private _onTextFieldChanged;
    private _onTextFieldKeyDown;
    private _onTextFieldClick;
    private _onIconClick;
    private _showDatePickerPopup;
    private _dismissDatePickerPopup;
    /**
     * Callback for closing the calendar callout
     */
    private _calendarDismissed;
    private _handleEscKey;
    private _validateTextInput;
    private _getDefaultState;
    private _isDateOutOfBounds;
    private _getErrorMessage;
}
