define(["require", "exports", "tslib", "react", "../../Utilities", "../../Calendar", "../../utilities/dateValues/DateValues", "../../Callout", "../../common/DirectionalHint", "../../TextField", "../../utilities/dateMath/DateMath", "../../FocusTrapZone"], function (require, exports, tslib_1, React, Utilities_1, Calendar_1, DateValues_1, Callout_1, DirectionalHint_1, TextField_1, DateMath_1, FocusTrapZone_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var DEFAULT_STRINGS = {
        months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
        goToToday: 'Go to today',
        prevMonthAriaLabel: 'Go to previous month',
        nextMonthAriaLabel: 'Go to next month',
        prevYearAriaLabel: 'Go to previous year',
        nextYearAriaLabel: 'Go to next year',
        prevYearRangeAriaLabel: 'Previous year range',
        nextYearRangeAriaLabel: 'Next year range',
        closeButtonAriaLabel: 'Close date picker',
        weekNumberFormatString: 'Week number {0}',
    };
    var DatePickerBase = /** @class */ (function (_super) {
        tslib_1.__extends(DatePickerBase, _super);
        function DatePickerBase(props) {
            var _this = _super.call(this, props) || this;
            _this._calendar = React.createRef();
            _this._datePickerDiv = React.createRef();
            _this._textField = React.createRef();
            _this._onSelectDate = function (date) {
                var _a = _this.props, formatDate = _a.formatDate, onSelectDate = _a.onSelectDate;
                if (_this.props.calendarProps && _this.props.calendarProps.onSelectDate) {
                    _this.props.calendarProps.onSelectDate(date);
                }
                _this.setState({
                    selectedDate: date,
                    formattedDate: formatDate && date ? formatDate(date) : '',
                });
                if (onSelectDate) {
                    onSelectDate(date);
                }
                _this._calendarDismissed();
            };
            _this._onCalloutPositioned = function () {
                var shouldFocus = true;
                // If the user has specified that the callout shouldn't use initial focus, then respect
                // that and don't attempt to set focus. That will default to true within the callout
                // so we need to check if it's undefined here.
                if (_this.props.calloutProps && _this.props.calloutProps.setInitialFocus !== undefined) {
                    shouldFocus = _this.props.calloutProps.setInitialFocus;
                }
                if (_this._calendar.current && shouldFocus) {
                    _this._calendar.current.focus();
                }
            };
            _this._onTextFieldFocus = function (ev) {
                if (_this.props.disableAutoFocus) {
                    return;
                }
                if (!_this.props.allowTextInput) {
                    if (!_this._preventFocusOpeningPicker) {
                        _this._showDatePickerPopup();
                    }
                    else {
                        _this._preventFocusOpeningPicker = false;
                    }
                }
            };
            _this._onTextFieldBlur = function (ev) {
                _this._validateTextInput();
            };
            _this._onTextFieldChanged = function (ev, newValue) {
                var _a = _this.props, allowTextInput = _a.allowTextInput, textField = _a.textField;
                if (allowTextInput) {
                    if (_this.state.isDatePickerShown) {
                        _this._dismissDatePickerPopup();
                    }
                    var _b = _this.props, isRequired = _b.isRequired, strings = _b.strings;
                    _this.setState({
                        errorMessage: isRequired && !newValue ? strings.isRequiredErrorMessage || ' ' : undefined,
                        formattedDate: newValue,
                    });
                }
                if (textField && textField.onChange) {
                    textField.onChange(ev, newValue);
                }
            };
            _this._onTextFieldKeyDown = function (ev) {
                switch (ev.which) {
                    case Utilities_1.KeyCodes.enter:
                        ev.preventDefault();
                        ev.stopPropagation();
                        if (!_this.state.isDatePickerShown) {
                            _this._validateTextInput();
                            _this._showDatePickerPopup();
                        }
                        else {
                            // When DatePicker allows input date string directly,
                            // it is expected to hit another enter to close the popup
                            if (_this.props.allowTextInput) {
                                _this._dismissDatePickerPopup();
                            }
                        }
                        break;
                    case Utilities_1.KeyCodes.escape:
                        _this._handleEscKey(ev);
                        break;
                    default:
                        break;
                }
            };
            _this._onTextFieldClick = function (ev) {
                if (!_this.props.disableAutoFocus && !_this.state.isDatePickerShown && !_this.props.disabled) {
                    _this._showDatePickerPopup();
                    return;
                }
                if (_this.props.allowTextInput) {
                    _this._dismissDatePickerPopup();
                }
            };
            _this._onIconClick = function (ev) {
                ev.stopPropagation();
                if (!_this.state.isDatePickerShown && !_this.props.disabled) {
                    _this._showDatePickerPopup();
                }
                else if (_this.props.allowTextInput) {
                    _this._dismissDatePickerPopup();
                }
            };
            _this._dismissDatePickerPopup = function () {
                if (_this.state.isDatePickerShown) {
                    _this.setState({
                        isDatePickerShown: false,
                    }, function () {
                        // setState is async, so we must call validate in a callback
                        _this._validateTextInput();
                    });
                }
            };
            /**
             * Callback for closing the calendar callout
             */
            _this._calendarDismissed = function () {
                _this._preventFocusOpeningPicker = true;
                _this._dismissDatePickerPopup();
                // don't need to focus the text box, if necessary the focusTrapZone will do it
            };
            _this._handleEscKey = function (ev) {
                if (_this.state.isDatePickerShown) {
                    ev.stopPropagation();
                }
                _this._calendarDismissed();
            };
            _this._validateTextInput = function () {
                var _a = _this.props, isRequired = _a.isRequired, allowTextInput = _a.allowTextInput, strings = _a.strings, parseDateFromString = _a.parseDateFromString, onSelectDate = _a.onSelectDate, formatDate = _a.formatDate, minDate = _a.minDate, maxDate = _a.maxDate;
                var inputValue = _this.state.formattedDate;
                // Do validation only if DatePicker's popup is dismissed
                if (_this.state.isDatePickerShown) {
                    return;
                }
                if (allowTextInput) {
                    var date = null;
                    if (inputValue) {
                        // Don't parse if the selected date has the same formatted string as what we're about to parse.
                        // The formatted string might be ambiguous (ex: "1/2/3" or "New Year Eve") and the parser might
                        // not be able to come up with the exact same date.
                        if (_this.state.selectedDate &&
                            !_this.state.errorMessage &&
                            formatDate &&
                            formatDate(_this.state.selectedDate) === inputValue) {
                            return;
                        }
                        date = parseDateFromString(inputValue);
                        // Check if date is null, or date is Invalid Date
                        if (!date || isNaN(date.getTime())) {
                            // Reset invalid input field, if formatting is available
                            if (formatDate) {
                                date = _this.state.selectedDate;
                                _this.setState({
                                    formattedDate: formatDate(date).toString(),
                                });
                            }
                            _this.setState({
                                errorMessage: strings.invalidInputErrorMessage || ' ',
                            });
                        }
                        else {
                            // Check against optional date boundaries
                            if (_this._isDateOutOfBounds(date, minDate, maxDate)) {
                                _this.setState({
                                    errorMessage: strings.isOutOfBoundsErrorMessage || ' ',
                                });
                            }
                            else {
                                _this.setState({
                                    selectedDate: date,
                                    errorMessage: '',
                                });
                                // When formatting is available:
                                // If formatted date is valid, but is different from input, update with formatted date.
                                // This occurs when an invalid date is entered twice.
                                if (formatDate && formatDate(date) !== inputValue) {
                                    _this.setState({
                                        formattedDate: formatDate(date).toString(),
                                    });
                                }
                            }
                        }
                    }
                    else {
                        // Only show error for empty inputValue if it is a required field
                        _this.setState({
                            errorMessage: isRequired ? strings.isRequiredErrorMessage || ' ' : '',
                        });
                    }
                    // Execute onSelectDate callback
                    if (onSelectDate) {
                        // If no input date string or input date string is invalid
                        // date variable will be null, callback should expect null value for this case
                        onSelectDate(date);
                    }
                }
                else if (isRequired && !inputValue) {
                    // Check when DatePicker is a required field but has NO input value
                    _this.setState({
                        errorMessage: strings.isRequiredErrorMessage || ' ',
                    });
                }
                else {
                    // Cleanup the error message
                    _this.setState({
                        errorMessage: '',
                    });
                }
            };
            Utilities_1.initializeComponentRef(_this);
            _this.state = _this._getDefaultState();
            _this._id = props.id || Utilities_1.getId('DatePicker');
            _this._preventFocusOpeningPicker = false;
            return _this;
        }
        DatePickerBase.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            var formatDate = nextProps.formatDate, value = nextProps.value;
            if (DateMath_1.compareDates(this.props.minDate, nextProps.minDate) &&
                DateMath_1.compareDates(this.props.maxDate, nextProps.maxDate) &&
                this.props.isRequired === nextProps.isRequired &&
                DateMath_1.compareDates(this.state.selectedDate, value) &&
                this.props.formatDate === formatDate) {
                // if the props we care about haven't changed, don't run validation or updates
                return;
            }
            this._setErrorMessage(true, nextProps);
            this._id = nextProps.id || this._id;
            // Issue# 1274: Check if the date value changed from old value, i.e., if indeed a new date is being
            // passed in or if the formatting function was modified. We only update the selected date if either of these
            // had a legit change. Note tha the bug will still repro when only the formatDate was passed in props and this
            // is the result of the onSelectDate callback, but this should be a rare scenario.
            var oldValue = this.state.selectedDate;
            if (!DateMath_1.compareDates(oldValue, value) || this.props.formatDate !== formatDate) {
                this.setState({
                    selectedDate: value || undefined,
                    formattedDate: formatDate && value ? formatDate(value) : '',
                });
            }
        };
        DatePickerBase.prototype.componentDidUpdate = function (prevProps, prevState) {
            if (prevState.isDatePickerShown && !this.state.isDatePickerShown) {
                // If DatePicker's menu (Calendar) is closed, run onAfterMenuDismiss
                if (this.props.onAfterMenuDismiss) {
                    this.props.onAfterMenuDismiss();
                }
            }
        };
        DatePickerBase.prototype.render = function () {
            var _a = this.props, firstDayOfWeek = _a.firstDayOfWeek, strings = _a.strings, label = _a.label, theme = _a.theme, className = _a.className, styles = _a.styles, initialPickerDate = _a.initialPickerDate, isRequired = _a.isRequired, disabled = _a.disabled, ariaLabel = _a.ariaLabel, pickerAriaLabel = _a.pickerAriaLabel, placeholder = _a.placeholder, allowTextInput = _a.allowTextInput, borderless = _a.borderless, minDate = _a.minDate, maxDate = _a.maxDate, showCloseButton = _a.showCloseButton, calendarProps = _a.calendarProps, calloutProps = _a.calloutProps, textFieldProps = _a.textField, underlined = _a.underlined, allFocusable = _a.allFocusable, _b = _a.calendarAs, CalendarType = _b === void 0 ? Calendar_1.Calendar : _b, tabIndex = _a.tabIndex;
            var _c = this.state, isDatePickerShown = _c.isDatePickerShown, formattedDate = _c.formattedDate, selectedDate = _c.selectedDate;
            var classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                disabled: disabled,
                label: !!label,
                isDatePickerShown: isDatePickerShown,
            });
            var calloutId = Utilities_1.getId('DatePicker-Callout');
            var nativeProps = Utilities_1.getNativeProps(this.props, Utilities_1.divProperties, ['value']);
            var iconProps = textFieldProps && textFieldProps.iconProps;
            return (React.createElement("div", tslib_1.__assign({}, nativeProps, { className: classNames.root }),
                React.createElement("div", { ref: this._datePickerDiv, "aria-haspopup": "true", "aria-owns": isDatePickerShown ? calloutId : undefined, className: classNames.wrapper },
                    React.createElement(TextField_1.TextField, tslib_1.__assign({ role: "combobox", label: label, "aria-expanded": isDatePickerShown, ariaLabel: ariaLabel, "aria-controls": isDatePickerShown ? calloutId : undefined, required: isRequired, disabled: disabled, errorMessage: this._getErrorMessage(), placeholder: placeholder, borderless: borderless, value: formattedDate, componentRef: this._textField, underlined: underlined, tabIndex: tabIndex, readOnly: !allowTextInput }, textFieldProps, { id: this._id + '-label', className: Utilities_1.css(classNames.textField, textFieldProps && textFieldProps.className), iconProps: tslib_1.__assign(tslib_1.__assign({ iconName: 'Calendar' }, iconProps), { className: Utilities_1.css(classNames.icon, iconProps && iconProps.className), onClick: this._onIconClick }), onKeyDown: this._onTextFieldKeyDown, onFocus: this._onTextFieldFocus, onBlur: this._onTextFieldBlur, onClick: this._onTextFieldClick, onChange: this._onTextFieldChanged }))),
                isDatePickerShown && (React.createElement(Callout_1.Callout, tslib_1.__assign({ id: calloutId, role: "dialog", ariaLabel: pickerAriaLabel, isBeakVisible: false, gapSpace: 0, doNotLayer: false, target: this._datePickerDiv.current, directionalHint: DirectionalHint_1.DirectionalHint.bottomLeftEdge }, calloutProps, { className: Utilities_1.css(classNames.callout, calloutProps && calloutProps.className), onDismiss: this._calendarDismissed, onPositioned: this._onCalloutPositioned }),
                    React.createElement(FocusTrapZone_1.FocusTrapZone, { isClickableOutsideFocusTrap: true, disableFirstFocus: this.props.disableAutoFocus, forceFocusInsideTrap: false },
                        React.createElement(CalendarType, tslib_1.__assign({}, calendarProps, { onSelectDate: this._onSelectDate, onDismiss: this._calendarDismissed, isMonthPickerVisible: this.props.isMonthPickerVisible, showMonthPickerAsOverlay: this.props.showMonthPickerAsOverlay, today: this.props.today, value: selectedDate || initialPickerDate, firstDayOfWeek: firstDayOfWeek, strings: strings, highlightCurrentMonth: this.props.highlightCurrentMonth, highlightSelectedMonth: this.props.highlightSelectedMonth, showWeekNumbers: this.props.showWeekNumbers, firstWeekOfYear: this.props.firstWeekOfYear, showGoToToday: this.props.showGoToToday, dateTimeFormatter: this.props.dateTimeFormatter, minDate: minDate, maxDate: maxDate, componentRef: this._calendar, showCloseButton: showCloseButton, allFocusable: allFocusable })))))));
        };
        DatePickerBase.prototype.focus = function () {
            if (this._textField.current) {
                this._textField.current.focus();
            }
        };
        DatePickerBase.prototype.reset = function () {
            this.setState(this._getDefaultState());
        };
        DatePickerBase.prototype._setErrorMessage = function (setState, nextProps) {
            var _a = nextProps || this.props, isRequired = _a.isRequired, strings = _a.strings, value = _a.value, minDate = _a.minDate, maxDate = _a.maxDate, initialPickerDate = _a.initialPickerDate;
            var errorMessage = !initialPickerDate && isRequired && !value ? strings.isRequiredErrorMessage || ' ' : undefined;
            if (!errorMessage && value) {
                errorMessage = this._isDateOutOfBounds(value, minDate, maxDate)
                    ? strings.isOutOfBoundsErrorMessage || ' '
                    : undefined;
            }
            if (setState) {
                this.setState({
                    errorMessage: errorMessage,
                });
            }
            return errorMessage;
        };
        DatePickerBase.prototype._showDatePickerPopup = function () {
            if (!this.state.isDatePickerShown) {
                this._preventFocusOpeningPicker = true;
                this.setState({
                    isDatePickerShown: true,
                });
            }
        };
        DatePickerBase.prototype._getDefaultState = function (props) {
            if (props === void 0) { props = this.props; }
            return {
                selectedDate: props.value || undefined,
                formattedDate: props.formatDate && props.value ? props.formatDate(props.value) : '',
                isDatePickerShown: false,
                errorMessage: this._setErrorMessage(false),
            };
        };
        DatePickerBase.prototype._isDateOutOfBounds = function (date, minDate, maxDate) {
            return (!!minDate && DateMath_1.compareDatePart(minDate, date) > 0) || (!!maxDate && DateMath_1.compareDatePart(maxDate, date) < 0);
        };
        DatePickerBase.prototype._getErrorMessage = function () {
            if (this.state.isDatePickerShown) {
                return undefined;
            }
            return this.state.errorMessage;
        };
        DatePickerBase.defaultProps = {
            allowTextInput: false,
            formatDate: function (date) {
                if (date) {
                    return date.toDateString();
                }
                return '';
            },
            parseDateFromString: function (dateStr) {
                var date = Date.parse(dateStr);
                if (date) {
                    return new Date(date);
                }
                return null;
            },
            firstDayOfWeek: Calendar_1.DayOfWeek.Sunday,
            initialPickerDate: new Date(),
            isRequired: false,
            isMonthPickerVisible: true,
            showMonthPickerAsOverlay: false,
            strings: DEFAULT_STRINGS,
            highlightCurrentMonth: false,
            highlightSelectedMonth: false,
            borderless: false,
            pickerAriaLabel: 'Calendar',
            showWeekNumbers: false,
            firstWeekOfYear: DateValues_1.FirstWeekOfYear.FirstDay,
            showGoToToday: true,
            dateTimeFormatter: undefined,
            showCloseButton: false,
            underlined: false,
            allFocusable: false,
        };
        return DatePickerBase;
    }(React.Component));
    exports.DatePickerBase = DatePickerBase;
});
//# sourceMappingURL=DatePicker.base.js.map