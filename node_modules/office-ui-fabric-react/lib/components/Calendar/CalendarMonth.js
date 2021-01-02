import { __extends } from "tslib";
import * as React from 'react';
import { KeyCodes, css, getRTL, initializeComponentRef, format } from '../../Utilities';
import { FocusZone } from '../../FocusZone';
import { addYears, setMonth, getYearStart, getYearEnd, getMonthStart, getMonthEnd, compareDatePart, } from '../../utilities/dateMath/DateMath';
import { Icon } from '../../Icon';
import * as stylesImport from './Calendar.scss';
import { CalendarYear } from './CalendarYear';
var styles = stylesImport;
var MONTHS_PER_ROW = 4;
var CalendarMonth = /** @class */ (function (_super) {
    __extends(CalendarMonth, _super);
    function CalendarMonth(props) {
        var _this = _super.call(this, props) || this;
        _this._navigatedMonthRef = React.createRef();
        _this._onCalendarYearRef = function (ref) {
            _this._calendarYearRef = ref;
        };
        _this._onKeyDown = function (callback, ev) {
            if (ev.which === KeyCodes.enter) {
                callback();
            }
        };
        _this._onSelectYear = function (selectedYear) {
            _this._focusOnUpdate = true;
            var _a = _this.props, navigatedDate = _a.navigatedDate, onNavigateDate = _a.onNavigateDate, maxDate = _a.maxDate, minDate = _a.minDate;
            var navYear = navigatedDate.getFullYear();
            if (navYear !== selectedYear) {
                var newNavigationDate = new Date(navigatedDate.getTime());
                newNavigationDate.setFullYear(selectedYear);
                // for min and max dates, adjust the new navigation date - perhaps this should be
                // checked on the master navigation date handler (i.e. in Calendar)
                if (maxDate && newNavigationDate > maxDate) {
                    newNavigationDate = setMonth(newNavigationDate, maxDate.getMonth());
                }
                else if (minDate && newNavigationDate < minDate) {
                    newNavigationDate = setMonth(newNavigationDate, minDate.getMonth());
                }
                onNavigateDate(newNavigationDate, true);
            }
            _this.setState({ isYearPickerVisible: false });
        };
        _this._yearToString = function (year) {
            var _a = _this.props, navigatedDate = _a.navigatedDate, dateTimeFormatter = _a.dateTimeFormatter;
            if (dateTimeFormatter) {
                // create a date based on the current nav date
                var yearFormattingDate = new Date(navigatedDate.getTime());
                yearFormattingDate.setFullYear(year);
                return dateTimeFormatter.formatYear(yearFormattingDate);
            }
            return String(year);
        };
        _this._yearRangeToString = function (yearRange) {
            return _this._yearToString(yearRange.fromYear) + " - " + _this._yearToString(yearRange.toYear);
        };
        _this._yearRangeToNextDecadeLabel = function (yearRange) {
            var strings = _this.props.strings;
            return strings.nextYearRangeAriaLabel
                ? strings.nextYearRangeAriaLabel + " " + _this._yearRangeToString(yearRange)
                : '';
        };
        _this._yearRangeToPrevDecadeLabel = function (yearRange) {
            var strings = _this.props.strings;
            return strings.prevYearRangeAriaLabel
                ? strings.prevYearRangeAriaLabel + " " + _this._yearRangeToString(yearRange)
                : '';
        };
        _this._onRenderYear = function (year) {
            return _this._yearToString(year);
        };
        _this._onSelectNextYear = function () {
            var _a = _this.props, navigatedDate = _a.navigatedDate, onNavigateDate = _a.onNavigateDate;
            onNavigateDate(addYears(navigatedDate, 1), false);
        };
        _this._onSelectNextYearKeyDown = function (ev) {
            if (ev.which === KeyCodes.enter) {
                _this._onKeyDown(_this._onSelectNextYear, ev);
            }
        };
        _this._onSelectPrevYear = function () {
            var _a = _this.props, navigatedDate = _a.navigatedDate, onNavigateDate = _a.onNavigateDate;
            onNavigateDate(addYears(navigatedDate, -1), false);
        };
        _this._onSelectPrevYearKeyDown = function (ev) {
            if (ev.which === KeyCodes.enter) {
                _this._onKeyDown(_this._onSelectPrevYear, ev);
            }
        };
        _this._onSelectMonthKeyDown = function (index) {
            return function (ev) { return _this._onKeyDown(function () { return _this._onSelectMonth(index); }, ev); };
        };
        _this._onSelectMonth = function (newMonth) {
            var _a = _this.props, navigatedDate = _a.navigatedDate, onNavigateDate = _a.onNavigateDate, onHeaderSelect = _a.onHeaderSelect;
            // If header is clickable the calendars are overlayed, switch back to day picker when month is clicked
            if (onHeaderSelect) {
                onHeaderSelect(true);
            }
            onNavigateDate(setMonth(navigatedDate, newMonth), true);
        };
        _this._onHeaderSelect = function () {
            var _a = _this.props, onHeaderSelect = _a.onHeaderSelect, yearPickerHidden = _a.yearPickerHidden;
            if (!yearPickerHidden) {
                _this._focusOnUpdate = true;
                _this.setState({ isYearPickerVisible: true });
            }
            else if (onHeaderSelect) {
                onHeaderSelect(true);
            }
        };
        _this._onYearPickerHeaderSelect = function (focus) {
            _this._focusOnUpdate = focus;
            _this.setState({ isYearPickerVisible: false });
        };
        _this._onHeaderKeyDown = function (ev) {
            if (_this._onHeaderSelect && (ev.which === KeyCodes.enter || ev.which === KeyCodes.space)) {
                _this._onHeaderSelect();
            }
        };
        initializeComponentRef(_this);
        _this._selectMonthCallbacks = [];
        props.strings.shortMonths.forEach(function (month, index) {
            _this._selectMonthCallbacks[index] = _this._onSelectMonth.bind(_this, index);
        });
        _this._isCurrentMonth = _this._isCurrentMonth.bind(_this);
        _this._onSelectNextYear = _this._onSelectNextYear.bind(_this);
        _this._onSelectPrevYear = _this._onSelectPrevYear.bind(_this);
        _this._onSelectMonth = _this._onSelectMonth.bind(_this);
        _this.state = { isYearPickerVisible: false };
        return _this;
    }
    CalendarMonth.prototype.componentDidUpdate = function () {
        if (this._focusOnUpdate) {
            this.focus();
            this._focusOnUpdate = false;
        }
    };
    CalendarMonth.prototype.render = function () {
        var _a, _b;
        var _this = this;
        var _c = this.props, navigatedDate = _c.navigatedDate, selectedDate = _c.selectedDate, strings = _c.strings, today = _c.today, highlightCurrentMonth = _c.highlightCurrentMonth, highlightSelectedMonth = _c.highlightSelectedMonth, navigationIcons = _c.navigationIcons, dateTimeFormatter = _c.dateTimeFormatter, minDate = _c.minDate, maxDate = _c.maxDate, yearPickerHidden = _c.yearPickerHidden;
        if (this.state.isYearPickerVisible) {
            // default the year picker to the current navigated date
            var currentSelectedDate = navigatedDate ? navigatedDate.getFullYear() : undefined;
            return (React.createElement(CalendarYear, { key: 'calendarYear_' + (currentSelectedDate && currentSelectedDate.toString()), minYear: minDate ? minDate.getFullYear() : undefined, maxYear: maxDate ? maxDate.getFullYear() : undefined, onSelectYear: this._onSelectYear, navigationIcons: navigationIcons, onHeaderSelect: this._onYearPickerHeaderSelect, selectedYear: currentSelectedDate, onRenderYear: this._onRenderYear, strings: {
                    rangeAriaLabel: this._yearRangeToString,
                    prevRangeAriaLabel: this._yearRangeToPrevDecadeLabel,
                    nextRangeAriaLabel: this._yearRangeToNextDecadeLabel,
                    headerAriaLabelFormatString: strings.yearPickerHeaderAriaLabel,
                }, ref: this._onCalendarYearRef }));
        }
        var rowIndexes = [];
        for (var i = 0; i < strings.shortMonths.length / MONTHS_PER_ROW; i++) {
            rowIndexes.push(i);
        }
        var leftNavigationIcon = navigationIcons.leftNavigation;
        var rightNavigationIcon = navigationIcons.rightNavigation;
        // determine if previous/next years are in bounds
        var isPrevYearInBounds = minDate ? compareDatePart(minDate, getYearStart(navigatedDate)) < 0 : true;
        var isNextYearInBounds = maxDate ? compareDatePart(getYearEnd(navigatedDate), maxDate) < 0 : true;
        var yearString = dateTimeFormatter.formatYear(navigatedDate);
        var headerAriaLabel = strings.monthPickerHeaderAriaLabel
            ? format(strings.monthPickerHeaderAriaLabel, yearString)
            : yearString;
        return (React.createElement("div", { className: css('ms-DatePicker-monthPicker', styles.monthPicker) },
            React.createElement("div", { className: css('ms-DatePicker-header', styles.header) },
                this.props.onHeaderSelect || !yearPickerHidden ? (React.createElement("div", { className: css('ms-DatePicker-currentYear js-showYearPicker', styles.currentYear, styles.headerToggleView), onClick: this._onHeaderSelect, onKeyDown: this._onHeaderKeyDown, "aria-label": headerAriaLabel, role: "button", "aria-atomic": true, "aria-live": "polite", tabIndex: 0 }, dateTimeFormatter.formatYear(navigatedDate))) : (React.createElement("div", { className: css('ms-DatePicker-currentYear js-showYearPicker', styles.currentYear) }, dateTimeFormatter.formatYear(navigatedDate))),
                React.createElement("div", { className: css('ms-DatePicker-yearComponents', styles.yearComponents) },
                    React.createElement("div", { className: css('ms-DatePicker-navContainer', styles.navContainer) },
                        React.createElement("button", { className: css('ms-DatePicker-prevYear js-prevYear', styles.prevYear, (_a = {},
                                _a['ms-DatePicker-prevYear--disabled ' + styles.prevYearIsDisabled] = !isPrevYearInBounds,
                                _a)), disabled: !isPrevYearInBounds, onClick: isPrevYearInBounds ? this._onSelectPrevYear : undefined, onKeyDown: isPrevYearInBounds ? this._onSelectPrevYearKeyDown : undefined, title: strings.prevYearAriaLabel
                                ? strings.prevYearAriaLabel + ' ' + dateTimeFormatter.formatYear(addYears(navigatedDate, -1))
                                : undefined, role: "button", type: "button" },
                            React.createElement(Icon, { iconName: getRTL() ? rightNavigationIcon : leftNavigationIcon })),
                        React.createElement("button", { className: css('ms-DatePicker-nextYear js-nextYear', styles.nextYear, (_b = {},
                                _b['ms-DatePicker-nextYear--disabled ' + styles.nextYearIsDisabled] = !isNextYearInBounds,
                                _b)), disabled: !isNextYearInBounds, onClick: isNextYearInBounds ? this._onSelectNextYear : undefined, onKeyDown: isNextYearInBounds ? this._onSelectNextYearKeyDown : undefined, title: strings.nextYearAriaLabel
                                ? strings.nextYearAriaLabel + ' ' + dateTimeFormatter.formatYear(addYears(navigatedDate, 1))
                                : undefined, role: "button", type: "button" },
                            React.createElement(Icon, { iconName: getRTL() ? leftNavigationIcon : rightNavigationIcon }))))),
            React.createElement(FocusZone, null,
                React.createElement("div", { className: css('ms-DatePicker-optionGrid', styles.optionGrid), role: "grid", "aria-readonly": "true" }, rowIndexes.map(function (rowNum) {
                    var monthsForRow = strings.shortMonths.slice(rowNum * MONTHS_PER_ROW, (rowNum + 1) * MONTHS_PER_ROW);
                    return (React.createElement("div", { key: 'monthRow_' + rowNum, role: "row" }, monthsForRow.map(function (month, index) {
                        var _a;
                        var monthIndex = rowNum * MONTHS_PER_ROW + index;
                        var indexedMonth = setMonth(navigatedDate, monthIndex);
                        var isCurrentMonth = _this._isCurrentMonth(monthIndex, navigatedDate.getFullYear(), today);
                        var isNavigatedMonth = navigatedDate.getMonth() === monthIndex;
                        var isSelectedMonth = selectedDate.getMonth() === monthIndex;
                        var isSelectedYear = selectedDate.getFullYear() === navigatedDate.getFullYear();
                        var isInBounds = (minDate ? compareDatePart(minDate, getMonthEnd(indexedMonth)) < 1 : true) &&
                            (maxDate ? compareDatePart(getMonthStart(indexedMonth), maxDate) < 1 : true);
                        return (React.createElement("button", { role: 'gridcell', className: css('ms-DatePicker-monthOption', styles.monthOption, (_a = {},
                                _a['ms-DatePicker-day--today ' + styles.monthIsCurrentMonth] = highlightCurrentMonth && isCurrentMonth,
                                _a['ms-DatePicker-day--highlighted ' + styles.monthIsHighlighted] = (highlightCurrentMonth || highlightSelectedMonth) && isSelectedMonth && isSelectedYear,
                                _a['ms-DatePicker-monthOption--disabled ' + styles.monthOptionIsDisabled] = !isInBounds,
                                _a)), disabled: !isInBounds, key: monthIndex, onClick: isInBounds ? _this._selectMonthCallbacks[monthIndex] : undefined, onKeyDown: isInBounds ? _this._onSelectMonthKeyDown(monthIndex) : undefined, "aria-label": dateTimeFormatter.formatMonthYear(indexedMonth, strings), "aria-selected": isNavigatedMonth, "data-is-focusable": isInBounds ? true : undefined, ref: isNavigatedMonth ? _this._navigatedMonthRef : undefined, type: "button" }, month));
                    })));
                })))));
    };
    CalendarMonth.prototype.focus = function () {
        if (this._calendarYearRef) {
            this._calendarYearRef.focus();
        }
        else if (this._navigatedMonthRef.current) {
            this._navigatedMonthRef.current.tabIndex = 0;
            this._navigatedMonthRef.current.focus();
        }
    };
    CalendarMonth.prototype._isCurrentMonth = function (month, year, today) {
        return today.getFullYear() === year && today.getMonth() === month;
    };
    return CalendarMonth;
}(React.Component));
export { CalendarMonth };
//# sourceMappingURL=CalendarMonth.js.map