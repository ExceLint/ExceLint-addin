"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var Utilities_2 = require("../../Utilities");
var Label_1 = require("../../Label");
var getClassNames = Utilities_2.classNamesFunction();
var COMPONENT_NAME = 'SliderBase';
exports.ONKEYDOWN_TIMEOUT_DURATION = 1000;
var SliderBase = /** @class */ (function (_super) {
    tslib_1.__extends(SliderBase, _super);
    function SliderBase(props) {
        var _this = _super.call(this, props) || this;
        _this._disposables = [];
        _this._sliderLine = React.createRef();
        _this._thumb = React.createRef();
        _this._onKeyDownTimer = -1;
        _this._getAriaValueText = function (value) {
            var ariaValueText = _this.props.ariaValueText;
            if (value !== undefined) {
                return ariaValueText ? ariaValueText(value) : value.toString();
            }
            return undefined;
        };
        _this._onMouseDownOrTouchStart = function (event) {
            if (event.type === 'mousedown') {
                _this._disposables.push(Utilities_1.on(window, 'mousemove', _this._onMouseMoveOrTouchMove, true), Utilities_1.on(window, 'mouseup', _this._onMouseUpOrTouchEnd, true));
            }
            else if (event.type === 'touchstart') {
                _this._disposables.push(Utilities_1.on(window, 'touchmove', _this._onMouseMoveOrTouchMove, true), Utilities_1.on(window, 'touchend', _this._onMouseUpOrTouchEnd, true));
            }
            _this._onMouseMoveOrTouchMove(event, true);
        };
        _this._onMouseMoveOrTouchMove = function (event, suppressEventCancelation) {
            if (!_this._sliderLine.current) {
                return;
            }
            var _a = _this.props, max = _a.max, min = _a.min, step = _a.step;
            var steps = (max - min) / step;
            var sliderPositionRect = _this._sliderLine.current.getBoundingClientRect();
            var sliderLength = !_this.props.vertical ? sliderPositionRect.width : sliderPositionRect.height;
            var stepLength = sliderLength / steps;
            var currentSteps;
            var distance;
            if (!_this.props.vertical) {
                var left = _this._getPosition(event, _this.props.vertical);
                distance = Utilities_1.getRTL(_this.props.theme) ? sliderPositionRect.right - left : left - sliderPositionRect.left;
                currentSteps = distance / stepLength;
            }
            else {
                var bottom = _this._getPosition(event, _this.props.vertical);
                distance = sliderPositionRect.bottom - bottom;
                currentSteps = distance / stepLength;
            }
            var currentValue;
            var renderedValue;
            // The value shouldn't be bigger than max or be smaller than min.
            if (currentSteps > Math.floor(steps)) {
                renderedValue = currentValue = max;
            }
            else if (currentSteps < 0) {
                renderedValue = currentValue = min;
            }
            else {
                renderedValue = min + step * currentSteps;
                currentValue = min + step * Math.round(currentSteps);
            }
            _this._updateValue(currentValue, renderedValue);
            if (!suppressEventCancelation) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        _this._onMouseUpOrTouchEnd = function (event) {
            // Disable renderedValue override.
            _this.setState({
                renderedValue: undefined,
            });
            if (_this.props.onChanged) {
                _this.props.onChanged(event, _this.state.value);
            }
            _this._disposeListeners();
        };
        _this._disposeListeners = function () {
            _this._disposables.forEach(function (dispose) { return dispose(); });
            _this._disposables = [];
        };
        _this._onKeyDown = function (event) {
            var value = _this.state.value;
            var _a = _this.props, max = _a.max, min = _a.min, step = _a.step;
            var diff = 0;
            // eslint-disable-next-line deprecation/deprecation
            switch (event.which) {
                case Utilities_1.getRTLSafeKeyCode(Utilities_1.KeyCodes.left, _this.props.theme):
                case Utilities_1.KeyCodes.down:
                    diff = -step;
                    _this._clearOnKeyDownTimer();
                    _this._setOnKeyDownTimer(event);
                    break;
                case Utilities_1.getRTLSafeKeyCode(Utilities_1.KeyCodes.right, _this.props.theme):
                case Utilities_1.KeyCodes.up:
                    diff = step;
                    _this._clearOnKeyDownTimer();
                    _this._setOnKeyDownTimer(event);
                    break;
                case Utilities_1.KeyCodes.home:
                    value = min;
                    break;
                case Utilities_1.KeyCodes.end:
                    value = max;
                    break;
                default:
                    return;
            }
            var newValue = Math.min(max, Math.max(min, value + diff));
            _this._updateValue(newValue, newValue);
            event.preventDefault();
            event.stopPropagation();
        };
        _this._clearOnKeyDownTimer = function () {
            _this._async.clearTimeout(_this._onKeyDownTimer);
        };
        _this._setOnKeyDownTimer = function (event) {
            _this._onKeyDownTimer = _this._async.setTimeout(function () {
                if (_this.props.onChanged) {
                    _this.props.onChanged(event, _this.state.value);
                }
            }, exports.ONKEYDOWN_TIMEOUT_DURATION);
        };
        _this._async = new Utilities_1.Async(_this);
        Utilities_1.initializeComponentRef(_this);
        Utilities_1.warnMutuallyExclusive(COMPONENT_NAME, _this.props, {
            value: 'defaultValue',
        });
        _this._id = Utilities_1.getId('Slider');
        var value = props.value !== undefined ? props.value : props.defaultValue !== undefined ? props.defaultValue : props.min;
        _this.state = {
            value: value,
            renderedValue: undefined,
        };
        return _this;
    }
    SliderBase.prototype.componentWillUnmount = function () {
        this._async.dispose();
        this._disposeListeners();
    };
    SliderBase.prototype.render = function () {
        var _a, _b, _c, _d, _e;
        var _f = this.props, ariaLabel = _f.ariaLabel, className = _f.className, disabled = _f.disabled, label = _f.label, max = _f.max, min = _f.min, showValue = _f.showValue, buttonProps = _f.buttonProps, vertical = _f.vertical, valueFormat = _f.valueFormat, styles = _f.styles, theme = _f.theme, originFromZero = _f.originFromZero;
        var value = this.value;
        var renderedValue = this.renderedValue;
        var thumbOffsetPercent = min === max ? 0 : ((renderedValue - min) / (max - min)) * 100;
        var zeroOffsetPercent = min >= 0 ? 0 : (-min / (max - min)) * 100;
        var lengthString = vertical ? 'height' : 'width';
        var onMouseDownProp = disabled ? {} : { onMouseDown: this._onMouseDownOrTouchStart };
        var onTouchStartProp = disabled ? {} : { onTouchStart: this._onMouseDownOrTouchStart };
        var onKeyDownProp = disabled ? {} : { onKeyDown: this._onKeyDown };
        var classNames = getClassNames(styles, {
            className: className,
            disabled: disabled,
            vertical: vertical,
            showTransitions: renderedValue === value,
            showValue: showValue,
            theme: theme,
        });
        var divButtonProps = buttonProps
            ? Utilities_2.getNativeProps(buttonProps, Utilities_2.divProperties)
            : undefined;
        return (React.createElement("div", { className: classNames.root },
            label && (React.createElement(Label_1.Label, tslib_1.__assign({ className: classNames.titleLabel }, (ariaLabel ? {} : { htmlFor: this._id }), { disabled: disabled }), label)),
            React.createElement("div", { className: classNames.container },
                React.createElement("div", tslib_1.__assign({ id: this._id, "aria-valuenow": value, "aria-valuemin": min, "aria-valuemax": max, "aria-valuetext": this._getAriaValueText(value), "aria-label": ariaLabel || label, "aria-disabled": disabled }, onMouseDownProp, onTouchStartProp, onKeyDownProp, divButtonProps, { className: Utilities_1.css(classNames.slideBox, buttonProps.className), role: "slider", tabIndex: disabled ? undefined : 0, "data-is-focusable": !disabled }),
                    React.createElement("div", { ref: this._sliderLine, className: classNames.line },
                        originFromZero && (React.createElement("span", { className: Utilities_1.css(classNames.zeroTick), style: this._getStyleUsingOffsetPercent(vertical, zeroOffsetPercent) })),
                        React.createElement("span", { ref: this._thumb, className: classNames.thumb, style: this._getStyleUsingOffsetPercent(vertical, thumbOffsetPercent) }),
                        originFromZero ? (React.createElement(React.Fragment, null,
                            React.createElement("span", { className: Utilities_1.css(classNames.lineContainer, classNames.inactiveSection), style: (_a = {}, _a[lengthString] = Math.min(thumbOffsetPercent, zeroOffsetPercent) + '%', _a) }),
                            React.createElement("span", { className: Utilities_1.css(classNames.lineContainer, classNames.activeSection), style: (_b = {}, _b[lengthString] = Math.abs(zeroOffsetPercent - thumbOffsetPercent) + '%', _b) }),
                            React.createElement("span", { className: Utilities_1.css(classNames.lineContainer, classNames.inactiveSection), style: (_c = {}, _c[lengthString] = Math.min(100 - thumbOffsetPercent, 100 - zeroOffsetPercent) + '%', _c) }))) : (React.createElement(React.Fragment, null,
                            React.createElement("span", { className: Utilities_1.css(classNames.lineContainer, classNames.activeSection), style: (_d = {}, _d[lengthString] = thumbOffsetPercent + '%', _d) }),
                            React.createElement("span", { className: Utilities_1.css(classNames.lineContainer, classNames.inactiveSection), style: (_e = {}, _e[lengthString] = 100 - thumbOffsetPercent + '%', _e) }))))),
                showValue && (React.createElement(Label_1.Label, { className: classNames.valueLabel, disabled: disabled }, valueFormat ? valueFormat(value) : value))),
            React.createElement(Utilities_1.FocusRects, null)));
    };
    SliderBase.prototype.focus = function () {
        if (this._thumb.current) {
            this._thumb.current.focus();
        }
    };
    Object.defineProperty(SliderBase.prototype, "value", {
        get: function () {
            var _a = this.props.value, value = _a === void 0 ? this.state.value : _a;
            if (this.props.min === undefined || this.props.max === undefined || value === undefined) {
                return undefined;
            }
            else {
                return Math.max(this.props.min, Math.min(this.props.max, value));
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SliderBase.prototype, "renderedValue", {
        get: function () {
            // renderedValue is expected to be defined while user is interacting with control, otherwise `undefined`.
            // Fall back to `value`.
            var _a = this.state.renderedValue, renderedValue = _a === void 0 ? this.value : _a;
            return renderedValue;
        },
        enumerable: true,
        configurable: true
    });
    SliderBase.prototype._getStyleUsingOffsetPercent = function (vertical, thumbOffsetPercent) {
        var _a;
        var direction = vertical ? 'bottom' : Utilities_1.getRTL(this.props.theme) ? 'right' : 'left';
        return _a = {},
            _a[direction] = thumbOffsetPercent + '%',
            _a;
    };
    SliderBase.prototype._getPosition = function (event, vertical) {
        var currentPosition;
        switch (event.type) {
            case 'mousedown':
            case 'mousemove':
                currentPosition = !vertical ? event.clientX : event.clientY;
                break;
            case 'touchstart':
            case 'touchmove':
                currentPosition = !vertical
                    ? event.touches[0].clientX
                    : event.touches[0].clientY;
                break;
        }
        return currentPosition;
    };
    SliderBase.prototype._updateValue = function (value, renderedValue) {
        var _this = this;
        var _a = this.props, step = _a.step, snapToStep = _a.snapToStep;
        var numDec = 0;
        if (isFinite(step)) {
            while (Math.round(step * Math.pow(10, numDec)) / Math.pow(10, numDec) !== step) {
                numDec++;
            }
        }
        // Make sure value has correct number of decimal places based on number of decimals in step
        var roundedValue = parseFloat(value.toFixed(numDec));
        var valueChanged = roundedValue !== this.state.value;
        if (snapToStep) {
            renderedValue = roundedValue;
        }
        this.setState({
            value: roundedValue,
            renderedValue: renderedValue,
        }, function () {
            if (valueChanged && _this.props.onChange) {
                _this.props.onChange(_this.state.value);
            }
        });
    };
    SliderBase.defaultProps = {
        step: 1,
        min: 0,
        max: 10,
        showValue: true,
        disabled: false,
        vertical: false,
        buttonProps: {},
        originFromZero: false,
    };
    return SliderBase;
}(React.Component));
exports.SliderBase = SliderBase;
//# sourceMappingURL=Slider.base.js.map