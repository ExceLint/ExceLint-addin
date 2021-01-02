import * as React from 'react';
import { IRefObject } from '../../Utilities';
import { ICalendarStrings, ICalendarIconStrings, ICalendarFormatDateCallbacks } from './Calendar.types';
export interface ICalendarMonth {
    focus(): void;
}
export interface ICalendarMonthProps extends React.ClassAttributes<CalendarMonth> {
    componentRef?: IRefObject<ICalendarMonth>;
    navigatedDate: Date;
    selectedDate: Date;
    strings: ICalendarStrings;
    onNavigateDate: (date: Date, focusOnNavigatedDay: boolean) => void;
    today?: Date;
    highlightCurrentMonth: boolean;
    highlightSelectedMonth: boolean;
    onHeaderSelect?: (focus: boolean) => void;
    navigationIcons: ICalendarIconStrings;
    dateTimeFormatter: ICalendarFormatDateCallbacks;
    minDate?: Date;
    maxDate?: Date;
    yearPickerHidden?: boolean;
}
export interface ICalendarMonthState {
    /** State used to show/hide month picker */
    isYearPickerVisible?: boolean;
}
export declare class CalendarMonth extends React.Component<ICalendarMonthProps, ICalendarMonthState> {
    /**
     * @deprecated unused, prefer 'ref' and 'componentRef' of ICalendarMonthProps.
     */
    refs: {
        [key: string]: React.ReactInstance;
        navigatedMonth: HTMLElement;
    };
    private _selectMonthCallbacks;
    private _calendarYearRef;
    private _navigatedMonthRef;
    private _focusOnUpdate;
    constructor(props: ICalendarMonthProps);
    componentDidUpdate(): void;
    render(): JSX.Element;
    focus(): void;
    private _onCalendarYearRef;
    private _isCurrentMonth;
    private _onKeyDown;
    private _onSelectYear;
    private _yearToString;
    private _yearRangeToString;
    private _yearRangeToNextDecadeLabel;
    private _yearRangeToPrevDecadeLabel;
    private _onRenderYear;
    private _onSelectNextYear;
    private _onSelectNextYearKeyDown;
    private _onSelectPrevYear;
    private _onSelectPrevYearKeyDown;
    private _onSelectMonthKeyDown;
    private _onSelectMonth;
    private _onHeaderSelect;
    private _onYearPickerHeaderSelect;
    private _onHeaderKeyDown;
}
