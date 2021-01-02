import { __assign, __decorate, __extends } from "tslib";
import * as React from 'react';
import { IconButton } from '../../Button';
import { Label } from '../../Label';
import { Icon } from '../../Icon';
import { initializeComponentRef, warnMutuallyExclusive, Async, getId, KeyCodes, customizable, calculatePrecision, precisionRound, mergeAriaAttributeValues, getNativeProps, divProperties, } from '../../Utilities';
import { Position } from '../../utilities/positioning';
import { getStyles, getArrowButtonStyles } from './SpinButton.styles';
import { getClassNames } from './SpinButton.classNames';
import { KeytipData } from '../../KeytipData';
export var KeyboardSpinDirection;
(function (KeyboardSpinDirection) {
    KeyboardSpinDirection[KeyboardSpinDirection["down"] = -1] = "down";
    KeyboardSpinDirection[KeyboardSpinDirection["notSpinning"] = 0] = "notSpinning";
    KeyboardSpinDirection[KeyboardSpinDirection["up"] = 1] = "up";
})(KeyboardSpinDirection || (KeyboardSpinDirection = {}));
var SpinButton = /** @class */ (function (_super) {
    __extends(SpinButton, _super);
    function SpinButton(props) {
        var _this = _super.call(this, props) || this;
        _this._input = React.createRef();
        _this._initialStepDelay = 400;
        _this._stepDelay = 75;
        _this._onFocus = function (ev) {
            // We can't set focus on a non-existing element
            if (!_this._input.current) {
                return;
            }
            if (_this._spinningByMouse || _this.state.keyboardSpinDirection !== KeyboardSpinDirection.notSpinning) {
                _this._stop();
            }
            _this._input.current.select();
            _this.setState({ isFocused: true });
            if (_this.props.onFocus) {
                _this.props.onFocus(ev);
            }
        };
        _this._onBlur = function (ev) {
            _this._validate(ev);
            _this.setState({ isFocused: false });
            if (_this.props.onBlur) {
                _this.props.onBlur(ev);
            }
        };
        _this._onValidate = function (value, event) {
            if (_this.props.onValidate) {
                return _this.props.onValidate(value, event);
            }
            else {
                return _this._defaultOnValidate(value);
            }
        };
        _this._calculatePrecision = function (props) {
            var _a = props.precision, precision = _a === void 0 ? Math.max(calculatePrecision(props.step), 0) : _a;
            return precision;
        };
        /**
         * Validate function to use if one is not passed in
         */
        _this._defaultOnValidate = function (value) {
            if (value === null || value.trim().length === 0 || isNaN(Number(value))) {
                return _this._lastValidValue;
            }
            var newValue = Math.min(_this.props.max, Math.max(_this.props.min, Number(value)));
            return String(newValue);
        };
        _this._onIncrement = function (value, event) {
            if (_this.props.onIncrement) {
                return _this.props.onIncrement(value, event);
            }
            else {
                return _this._defaultOnIncrement(value);
            }
        };
        /**
         * Increment function to use if one is not passed in
         */
        _this._defaultOnIncrement = function (value) {
            var _a = _this.props, max = _a.max, step = _a.step;
            var newValue = Math.min(Number(value) + Number(step), max);
            newValue = precisionRound(newValue, _this._precision);
            return String(newValue);
        };
        _this._onDecrement = function (value, event) {
            if (_this.props.onDecrement) {
                return _this.props.onDecrement(value, event);
            }
            else {
                return _this._defaultOnDecrement(value);
            }
        };
        /**
         * Increment function to use if one is not passed in
         */
        _this._defaultOnDecrement = function (value) {
            var _a = _this.props, min = _a.min, step = _a.step;
            var newValue = Math.max(Number(value) - Number(step), min);
            newValue = precisionRound(newValue, _this._precision);
            return String(newValue);
        };
        /**
         * This is used when validating text entry in the input on blur or when enter key is pressed
         * (not when changed via the buttons).
         * @param event - the event that fired
         */
        _this._validate = function (event) {
            if (_this.value !== undefined &&
                _this._valueToValidate !== undefined &&
                _this._valueToValidate !== _this._lastValidValue) {
                var newValue = _this._onValidate(_this._valueToValidate, event);
                // Done validating this value, so clear it
                _this._valueToValidate = undefined;
                if (newValue !== undefined) {
                    _this._lastValidValue = newValue;
                    _this.setState({ value: newValue });
                }
                else {
                    // Value was invalid. Reset state to last valid value.
                    _this.setState({ value: _this._lastValidValue });
                }
            }
        };
        /**
         * The method is needed to ensure we are updating the actual input value.
         * without this our value will never change (and validation will not have the correct number)
         * @param event - the event that was fired
         */
        _this._onInputChange = function (event) {
            var element = event.target;
            var value = element.value;
            _this._valueToValidate = value;
            _this.setState({
                value: value,
            });
        };
        /**
         * Update the value with the given stepFunction
         * @param shouldSpin - should we fire off another updateValue when we are done here? This should be true
         * when spinning in response to a mouseDown
         * @param stepFunction - function to use to step by
         * @param event - The event that triggered the updateValue
         */
        _this._updateValue = function (shouldSpin, stepDelay, stepFunction, event) {
            var newValue = stepFunction(_this.value || '', event);
            if (newValue !== undefined) {
                _this._lastValidValue = newValue;
                _this.setState({ value: newValue });
            }
            if (_this._spinningByMouse !== shouldSpin) {
                _this._spinningByMouse = shouldSpin;
            }
            if (shouldSpin) {
                _this._currentStepFunctionHandle = _this._async.setTimeout(function () {
                    _this._updateValue(shouldSpin, _this._stepDelay, stepFunction, event);
                }, stepDelay);
            }
        };
        /**
         * Stop spinning (clear any currently pending update and set spinning to false)
         */
        _this._stop = function () {
            if (_this._currentStepFunctionHandle >= 0) {
                _this._async.clearTimeout(_this._currentStepFunctionHandle);
                _this._currentStepFunctionHandle = -1;
            }
            if (_this._spinningByMouse || _this.state.keyboardSpinDirection !== KeyboardSpinDirection.notSpinning) {
                _this._spinningByMouse = false;
                _this.setState({ keyboardSpinDirection: KeyboardSpinDirection.notSpinning });
            }
        };
        /**
         * Handle keydown on the text field. We need to update
         * the value when up or down arrow are depressed
         * @param event - the keyboardEvent that was fired
         */
        _this._handleKeyDown = function (event) {
            // eat the up and down arrow keys to keep focus in the spinButton
            // (especially when a spinButton is inside of a FocusZone)
            if (event.which === KeyCodes.up || event.which === KeyCodes.down || event.which === KeyCodes.enter) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (_this.props.disabled) {
                _this._stop();
                return;
            }
            var spinDirection = KeyboardSpinDirection.notSpinning;
            switch (event.which) {
                case KeyCodes.up:
                    spinDirection = KeyboardSpinDirection.up;
                    _this._updateValue(false /* shouldSpin */, _this._initialStepDelay, _this._onIncrement, event);
                    break;
                case KeyCodes.down:
                    spinDirection = KeyboardSpinDirection.down;
                    _this._updateValue(false /* shouldSpin */, _this._initialStepDelay, _this._onDecrement, event);
                    break;
                case KeyCodes.enter:
                    _this._validate(event);
                    break;
                case KeyCodes.escape:
                    if (_this.value !== _this._lastValidValue) {
                        _this.setState({ value: _this._lastValidValue });
                    }
                    break;
                default:
                    break;
            }
            // style the increment/decrement button to look active
            // when the corresponding up/down arrow keys trigger a step
            if (_this.state.keyboardSpinDirection !== spinDirection) {
                _this.setState({ keyboardSpinDirection: spinDirection });
            }
        };
        /**
         * Make sure that we have stopped spinning on keyUp
         * if the up or down arrow fired this event
         * @param event - keyboard event
         */
        _this._handleKeyUp = function (event) {
            if (_this.props.disabled || event.which === KeyCodes.up || event.which === KeyCodes.down) {
                _this._stop();
                return;
            }
        };
        _this._onIncrementMouseDown = function (event) {
            _this._updateValue(true /* shouldSpin */, _this._initialStepDelay, _this._onIncrement, event);
        };
        _this._onDecrementMouseDown = function (event) {
            _this._updateValue(true /* shouldSpin */, _this._initialStepDelay, _this._onDecrement, event);
        };
        initializeComponentRef(_this);
        warnMutuallyExclusive('SpinButton', props, {
            value: 'defaultValue',
        });
        // Don't use || here because it won't handle empty strings properly
        var _a = props.value, value = _a === void 0 ? props.defaultValue : _a;
        if (value === undefined) {
            value = typeof props.min === 'number' ? String(props.min) : '0';
        }
        _this._lastValidValue = value;
        // Ensure that the autocalculated precision is not negative.
        _this._precision = _this._calculatePrecision(props);
        _this.state = {
            isFocused: false,
            value: value,
            keyboardSpinDirection: KeyboardSpinDirection.notSpinning,
        };
        _this._async = new Async(_this);
        _this._currentStepFunctionHandle = -1;
        _this._labelId = getId('Label');
        _this._inputId = getId('input');
        _this._spinningByMouse = false;
        _this._valueToValidate = undefined;
        return _this;
    }
    SpinButton.prototype.componentWillUnmount = function () {
        this._async.dispose();
    };
    /**
     * Invoked when a component is receiving new props. This method is not called for the initial render.
     */
    SpinButton.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
        if (newProps.value !== undefined) {
            // Value from props is considered pre-validated
            this._lastValidValue = newProps.value;
            this.setState({ value: newProps.value });
        }
        this._precision = this._calculatePrecision(newProps);
    };
    SpinButton.prototype.render = function () {
        var _this = this;
        var _a = this.props, disabled = _a.disabled, label = _a.label, min = _a.min, max = _a.max, labelPosition = _a.labelPosition, iconProps = _a.iconProps, incrementButtonIcon = _a.incrementButtonIcon, incrementButtonAriaLabel = _a.incrementButtonAriaLabel, decrementButtonIcon = _a.decrementButtonIcon, decrementButtonAriaLabel = _a.decrementButtonAriaLabel, ariaLabel = _a.ariaLabel, ariaDescribedBy = _a.ariaDescribedBy, customStyles = _a.styles, customUpArrowButtonStyles = _a.upArrowButtonStyles, customDownArrowButtonStyles = _a.downArrowButtonStyles, theme = _a.theme, ariaPositionInSet = _a.ariaPositionInSet, ariaSetSize = _a.ariaSetSize, ariaValueNow = _a.ariaValueNow, ariaValueText = _a.ariaValueText, keytipProps = _a.keytipProps, className = _a.className, inputProps = _a.inputProps, iconButtonProps = _a.iconButtonProps;
        var _b = this.state, isFocused = _b.isFocused, keyboardSpinDirection = _b.keyboardSpinDirection;
        var value = this.value;
        var classNames = this.props.getClassNames
            ? this.props.getClassNames(theme, disabled, isFocused, keyboardSpinDirection, labelPosition, className)
            : getClassNames(getStyles(theme, customStyles), disabled, isFocused, keyboardSpinDirection, labelPosition, className);
        var nativeProps = getNativeProps(this.props, divProperties, [
            'onBlur',
            'onFocus',
            'className',
        ]);
        return (React.createElement("div", { className: classNames.root },
            labelPosition !== Position.bottom && (iconProps || label) && (React.createElement("div", { className: classNames.labelWrapper },
                iconProps && React.createElement(Icon, __assign({}, iconProps, { className: classNames.icon, "aria-hidden": "true" })),
                label && (React.createElement(Label, { id: this._labelId, htmlFor: this._inputId, className: classNames.label, disabled: disabled }, label)))),
            React.createElement(KeytipData, { keytipProps: keytipProps, disabled: disabled }, function (keytipAttributes) { return (React.createElement("div", __assign({}, nativeProps, { className: classNames.spinButtonWrapper, "aria-label": ariaLabel && ariaLabel, "aria-posinset": ariaPositionInSet, "aria-setsize": ariaSetSize, "data-ktp-target": keytipAttributes['data-ktp-target'] }),
                React.createElement("input", __assign({ value: value, id: _this._inputId, onChange: _this._onChange, onInput: _this._onInputChange, className: classNames.input, type: "text", autoComplete: "off", role: "spinbutton", "aria-labelledby": label && _this._labelId, "aria-valuenow": typeof ariaValueNow === 'number'
                        ? ariaValueNow
                        : value && !isNaN(Number(value)) // Number('') is 0 which may not be desirable
                            ? Number(value)
                            : undefined, "aria-valuetext": typeof ariaValueText === 'string'
                        ? ariaValueText
                        : !value || isNaN(Number(value)) // Number('') is 0 which may not be desirable
                            ? value
                            : undefined, "aria-valuemin": min, "aria-valuemax": max, "aria-describedby": mergeAriaAttributeValues(ariaDescribedBy, keytipAttributes['aria-describedby']), onBlur: _this._onBlur, ref: _this._input, onFocus: _this._onFocus, onKeyDown: _this._handleKeyDown, onKeyUp: _this._handleKeyUp, disabled: disabled, "aria-disabled": disabled, "data-lpignore": true, "data-ktp-execute-target": keytipAttributes['data-ktp-execute-target'] }, inputProps)),
                React.createElement("span", { className: classNames.arrowBox },
                    React.createElement(IconButton, __assign({ styles: getArrowButtonStyles(theme, true, customUpArrowButtonStyles), className: 'ms-UpButton', checked: keyboardSpinDirection === KeyboardSpinDirection.up, disabled: disabled, iconProps: incrementButtonIcon, onMouseDown: _this._onIncrementMouseDown, onMouseLeave: _this._stop, onMouseUp: _this._stop, tabIndex: -1, ariaLabel: incrementButtonAriaLabel, "data-is-focusable": false }, iconButtonProps)),
                    React.createElement(IconButton, __assign({ styles: getArrowButtonStyles(theme, false, customDownArrowButtonStyles), className: 'ms-DownButton', checked: keyboardSpinDirection === KeyboardSpinDirection.down, disabled: disabled, iconProps: decrementButtonIcon, onMouseDown: _this._onDecrementMouseDown, onMouseLeave: _this._stop, onMouseUp: _this._stop, tabIndex: -1, ariaLabel: decrementButtonAriaLabel, "data-is-focusable": false }, iconButtonProps))))); }),
            labelPosition === Position.bottom && (iconProps || label) && (React.createElement("div", { className: classNames.labelWrapper },
                iconProps && React.createElement(Icon, { iconName: iconProps.iconName, className: classNames.icon, "aria-hidden": "true" }),
                label && (React.createElement(Label, { id: this._labelId, htmlFor: this._inputId, className: classNames.label, disabled: disabled }, label))))));
    };
    SpinButton.prototype.focus = function () {
        if (this._input.current) {
            this._input.current.focus();
        }
    };
    Object.defineProperty(SpinButton.prototype, "value", {
        /**
         * Gets the value of the spin button.
         */
        get: function () {
            // TODO (version 8): value from props should ALWAYS override value from state.
            // In a class component the code should be:
            // const { value = this.state.value } = this.props;
            // return value;
            return this.state.value;
        },
        enumerable: true,
        configurable: true
    });
    SpinButton.prototype._onChange = function () {
        /**
         * A noop input change handler. Using onInput instead of onChange was meant to address an issue
         * which apparently has been resolved in React 16 (https://github.com/facebook/react/issues/7027).
         * The no-op onChange handler was still needed because React gives console errors if an input
         * doesn't have onChange.
         *
         * TODO (Fabric 8?) - switch to just calling onChange (this is a breaking change for any tests,
         * ours or 3rd-party, which simulate entering text in a SpinButton)
         */
    };
    SpinButton.defaultProps = {
        step: 1,
        min: 0,
        max: 100,
        disabled: false,
        labelPosition: Position.start,
        label: '',
        incrementButtonIcon: { iconName: 'ChevronUpSmall' },
        decrementButtonIcon: { iconName: 'ChevronDownSmall' },
    };
    SpinButton = __decorate([
        customizable('SpinButton', ['theme', 'styles'], true)
    ], SpinButton);
    return SpinButton;
}(React.Component));
export { SpinButton };
//# sourceMappingURL=SpinButton.js.map