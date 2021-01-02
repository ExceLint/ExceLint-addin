import * as React from 'react';
import { IRefObject } from '../../Utilities';
import { ICalendarStrings, ICalendarIconStrings, ICalendarFormatDateCallbacks } from './Calendar.types';
import { DayOfWeek, FirstWeekOfYear, DateRangeType } from '../../utilities/dateValues/DateValues';
export interface IDayInfo {
    key: string;
    date: string;
    originalDate: Date;
    isInMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isInBounds: boolean;
    onSelected: (ev: React.SyntheticEvent<HTMLElement>) => void;
}
export interface ICalendarDay {
    focus(): void;
}
export interface ICalendarDayProps extends React.ClassAttributes<CalendarDay> {
    componentRef?: IRefObject<ICalendarDay>;
    strings: ICalendarStrings;
    selectedDate: Date;
    navigatedDate: Date;
    onSelectDate: (date: Date, selectedDateRangeArray?: Date[]) => void;
    onNavigateDate: (date: Date, focusOnNavigatedDay: boolean) => void;
    onDismiss?: () => void;
    firstDayOfWeek: DayOfWeek;
    dateRangeType: DateRangeType;
    autoNavigateOnSelection: boolean;
    navigationIcons: ICalendarIconStrings;
    today?: Date;
    onHeaderSelect?: (focus: boolean) => void;
    showWeekNumbers?: boolean;
    firstWeekOfYear: FirstWeekOfYear;
    dateTimeFormatter: ICalendarFormatDateCallbacks;
    showSixWeeksByDefault?: boolean;
    minDate?: Date;
    maxDate?: Date;
    restrictedDates?: Date[];
    workWeekDays?: DayOfWeek[];
    showCloseButton?: boolean;
    allFocusable?: boolean;
}
export interface ICalendarDayState {
    activeDescendantId?: string;
    weeks?: IDayInfo[][];
}
export declare class CalendarDay extends React.Component<ICalendarDayProps, ICalendarDayState> {
    private navigatedDay;
    private days;
    constructor(props: ICalendarDayProps);
    UNSAFE_componentWillReceiveProps(nextProps: ICalendarDayProps): void;
    render(): JSX.Element;
    focus(): void;
    private _setDayRef;
    private _setDayCellRef;
    private _getWeekCornerStyles;
    private _getHighlightedCornerStyle;
    private _navigateMonthEdge;
    private _onKeyDown;
    private _onDayKeyDown;
    private _onDayMouseDown;
    private _onDayMouseUp;
    private _onDayMouseOver;
    private _onDayMouseLeave;
    private _onTableMouseLeave;
    private _onTableMouseUp;
    private _applyFunctionToDayRefs;
    private _onSelectDate;
    private _onSelectNextMonth;
    private _onSelectPrevMonth;
    private _onClose;
    private _onHeaderSelect;
    private _onHeaderKeyDown;
    private _onPrevMonthKeyDown;
    private _onNextMonthKeyDown;
    private _onCloseButtonKeyDown;
    private _getWeeks;
    private _getIsRestrictedDate;
    private _getBoundedDateRange;
    /**
     * Returns the index of the last element in the array where the predicate is true, and -1
     * otherwise
     * @param items Array of items to be iterated over using the predicate
     * @param predicate find calls predicate once for each element of the array, in descending
     * order, until it finds one where predicate returns true if such an element is found.
     */
    private _findLastIndex;
}
