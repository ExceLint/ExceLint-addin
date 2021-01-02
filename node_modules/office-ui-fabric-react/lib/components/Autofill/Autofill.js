import { __assign, __extends } from "tslib";
import * as React from 'react';
import { KeyCodes, getNativeProps, inputProperties, isIE11, Async, initializeComponentRef } from '../../Utilities';
var SELECTION_FORWARD = 'forward';
var SELECTION_BACKWARD = 'backward';
/**
 * {@docCategory Autofill}
 */
var Autofill = /** @class */ (function (_super) {
    __extends(Autofill, _super);
    function Autofill(props) {
        var _this = _super.call(this, props) || this;
        _this._inputElement = React.createRef();
        _this._autoFillEnabled = true;
        _this._isComposing = false;
        // Composition events are used when the character/text requires several keystrokes to be completed.
        // Some examples of this are mobile text input and langauges like Japanese or Arabic.
        // Find out more at https://developer.mozilla.org/en-US/docs/Web/Events/compositionstart
        _this._onCompositionStart = function (ev) {
            _this._isComposing = true;
            _this._autoFillEnabled = false;
        };
        // Composition events are used when the character/text requires several keystrokes to be completed.
        // Some examples of this are mobile text input and languages like Japanese or Arabic.
        // Find out more at https://developer.mozilla.org/en-US/docs/Web/Events/compositionstart
        _this._onCompositionUpdate = function () {
            if (isIE11()) {
                _this._updateValue(_this._getCurrentInputValue(), true);
            }
        };
        // Composition events are used when the character/text requires several keystrokes to be completed.
        // Some examples of this are mobile text input and langauges like Japanese or Arabic.
        // Find out more at https://developer.mozilla.org/en-US/docs/Web/Events/compositionstart
        _this._onCompositionEnd = function (ev) {
            var inputValue = _this._getCurrentInputValue();
            _this._tryEnableAutofill(inputValue, _this.value, false, true);
            _this._isComposing = false;
            // Due to timing, this needs to be async, otherwise no text will be selected.
            _this._async.setTimeout(function () {
                // it's technically possible that the value of _isComposing is reset during this timeout,
                // so explicitly trigger this with composing=true here, since it is supposed to be the
                // update for composition end
                _this._updateValue(_this._getCurrentInputValue(), false);
            }, 0);
        };
        _this._onClick = function () {
            if (_this._value && _this._value !== '' && _this._autoFillEnabled) {
                _this._autoFillEnabled = false;
            }
        };
        _this._onKeyDown = function (ev) {
            if (_this.props.onKeyDown) {
                _this.props.onKeyDown(ev);
            }
            // If the event is actively being composed, then don't alert autofill.
            // Right now typing does not have isComposing, once that has been fixed any should be removed.
            if (!ev.nativeEvent.isComposing) {
                switch (ev.which) {
                    case KeyCodes.backspace:
                        _this._autoFillEnabled = false;
                        break;
                    case KeyCodes.left:
                    case KeyCodes.right:
                        if (_this._autoFillEnabled) {
                            _this._value = _this.state.displayValue;
                            _this._autoFillEnabled = false;
                        }
                        break;
                    default:
                        if (!_this._autoFillEnabled) {
                            if (_this.props.enableAutofillOnKeyPress.indexOf(ev.which) !== -1) {
                                _this._autoFillEnabled = true;
                            }
                        }
                        break;
                }
            }
        };
        _this._onInputChanged = function (ev) {
            var value = _this._getCurrentInputValue(ev);
            if (!_this._isComposing) {
                _this._tryEnableAutofill(value, _this._value, ev.nativeEvent.isComposing);
            }
            // If it is not IE11 and currently composing, update the value
            if (!(isIE11() && _this._isComposing)) {
                var nativeEventComposing = ev.nativeEvent.isComposing;
                var isComposing = nativeEventComposing === undefined ? _this._isComposing : nativeEventComposing;
                _this._updateValue(value, isComposing);
            }
        };
        _this._onChanged = function () {
            // Swallow this event, we don't care about it
            // We must provide it because React PropTypes marks it as required, but onInput serves the correct purpose
            return;
        };
        /**
         * Updates the current input value as well as getting a new display value.
         * @param newValue - The new value from the input
         */
        _this._updateValue = function (newValue, composing) {
            // Only proceed if the value is nonempty and is different from the old value
            // This is to work around the fact that, in IE 11, inputs with a placeholder fire an onInput event on focus
            if (!newValue && newValue === _this._value) {
                return;
            }
            _this._value = _this.props.onInputChange ? _this.props.onInputChange(newValue, composing) : newValue;
            _this.setState({
                displayValue: _this._getDisplayValue(_this._value, _this.props.suggestedDisplayValue),
            }, function () { return _this._notifyInputChange(_this._value, composing); });
        };
        initializeComponentRef(_this);
        _this._async = new Async(_this);
        _this._value = props.defaultVisibleValue || '';
        _this.state = {
            displayValue: props.defaultVisibleValue || '',
        };
        return _this;
    }
    Object.defineProperty(Autofill.prototype, "cursorLocation", {
        get: function () {
            if (this._inputElement.current) {
                var inputElement = this._inputElement.current;
                if (inputElement.selectionDirection !== SELECTION_FORWARD) {
                    return inputElement.selectionEnd;
                }
                else {
                    return inputElement.selectionStart;
                }
            }
            else {
                return -1;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Autofill.prototype, "isValueSelected", {
        get: function () {
            return Boolean(this.inputElement && this.inputElement.selectionStart !== this.inputElement.selectionEnd);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Autofill.prototype, "value", {
        get: function () {
            return this._value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Autofill.prototype, "selectionStart", {
        get: function () {
            return this._inputElement.current ? this._inputElement.current.selectionStart : -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Autofill.prototype, "selectionEnd", {
        get: function () {
            return this._inputElement.current ? this._inputElement.current.selectionEnd : -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Autofill.prototype, "inputElement", {
        get: function () {
            return this._inputElement.current;
        },
        enumerable: true,
        configurable: true
    });
    Autofill.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        if (this.props.updateValueInWillReceiveProps) {
            var updatedInputValue = this.props.updateValueInWillReceiveProps();
            // Don't update if we have a null value or the value isn't changing
            // the value should still update if an empty string is passed in
            if (updatedInputValue !== null && updatedInputValue !== this._value) {
                this._value = updatedInputValue;
            }
        }
        var newDisplayValue = this._getDisplayValue(this._value, nextProps.suggestedDisplayValue);
        if (typeof newDisplayValue === 'string') {
            this.setState({ displayValue: newDisplayValue });
        }
    };
    Autofill.prototype.componentDidUpdate = function () {
        var value = this._value;
        var _a = this.props, suggestedDisplayValue = _a.suggestedDisplayValue, shouldSelectFullInputValueInComponentDidUpdate = _a.shouldSelectFullInputValueInComponentDidUpdate, preventValueSelection = _a.preventValueSelection;
        var differenceIndex = 0;
        if (preventValueSelection) {
            return;
        }
        if (this._autoFillEnabled &&
            value &&
            suggestedDisplayValue &&
            this._doesTextStartWith(suggestedDisplayValue, value)) {
            var shouldSelectFullRange = false;
            if (shouldSelectFullInputValueInComponentDidUpdate) {
                shouldSelectFullRange = shouldSelectFullInputValueInComponentDidUpdate();
            }
            if (shouldSelectFullRange && this._inputElement.current) {
                this._inputElement.current.setSelectionRange(0, suggestedDisplayValue.length, SELECTION_BACKWARD);
            }
            else {
                while (differenceIndex < value.length &&
                    value[differenceIndex].toLocaleLowerCase() === suggestedDisplayValue[differenceIndex].toLocaleLowerCase()) {
                    differenceIndex++;
                }
                if (differenceIndex > 0 && this._inputElement.current) {
                    this._inputElement.current.setSelectionRange(differenceIndex, suggestedDisplayValue.length, SELECTION_BACKWARD);
                }
            }
        }
    };
    Autofill.prototype.componentWillUnmount = function () {
        this._async.dispose();
    };
    Autofill.prototype.render = function () {
        var displayValue = this.state.displayValue;
        var nativeProps = getNativeProps(this.props, inputProperties);
        return (React.createElement("input", __assign({ autoCapitalize: "off", autoComplete: "off", "aria-autocomplete": 'both' }, nativeProps, { ref: this._inputElement, value: displayValue, onCompositionStart: this._onCompositionStart, onCompositionUpdate: this._onCompositionUpdate, onCompositionEnd: this._onCompositionEnd, 
            // TODO (Fabric 8?) - switch to calling only onChange. See notes in TextField._onInputChange.
            onChange: this._onChanged, onInput: this._onInputChanged, onKeyDown: this._onKeyDown, onClick: this.props.onClick ? this.props.onClick : this._onClick, "data-lpignore": true })));
    };
    Autofill.prototype.focus = function () {
        this._inputElement.current && this._inputElement.current.focus();
    };
    Autofill.prototype.clear = function () {
        this._autoFillEnabled = true;
        this._updateValue('', false);
        this._inputElement.current && this._inputElement.current.setSelectionRange(0, 0);
    };
    Autofill.prototype._getCurrentInputValue = function (ev) {
        if (ev && ev.target && ev.target.value) {
            return ev.target.value;
        }
        else if (this.inputElement && this.inputElement.value) {
            return this.inputElement.value;
        }
        else {
            return '';
        }
    };
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
    Autofill.prototype._tryEnableAutofill = function (newValue, oldValue, isComposing, isComposed) {
        if (!isComposing &&
            newValue &&
            this._inputElement.current &&
            this._inputElement.current.selectionStart === newValue.length &&
            !this._autoFillEnabled &&
            (newValue.length > oldValue.length || isComposed)) {
            this._autoFillEnabled = true;
        }
    };
    Autofill.prototype._notifyInputChange = function (newValue, composing) {
        if (this.props.onInputValueChange) {
            this.props.onInputValueChange(newValue, composing);
        }
    };
    /**
     * Returns a string that should be used as the display value.
     * It evaluates this based on whether or not the suggested value starts with the input value
     * and whether or not autofill is enabled.
     * @param inputValue - the value that the input currently has.
     * @param suggestedDisplayValue - the possible full value
     */
    Autofill.prototype._getDisplayValue = function (inputValue, suggestedDisplayValue) {
        var displayValue = inputValue;
        if (suggestedDisplayValue &&
            inputValue &&
            this._doesTextStartWith(suggestedDisplayValue, displayValue) &&
            this._autoFillEnabled) {
            displayValue = suggestedDisplayValue;
        }
        return displayValue;
    };
    Autofill.prototype._doesTextStartWith = function (text, startWith) {
        if (!text || !startWith) {
            return false;
        }
        return text.toLocaleLowerCase().indexOf(startWith.toLocaleLowerCase()) === 0;
    };
    Autofill.defaultProps = {
        enableAutofillOnKeyPress: [KeyCodes.down, KeyCodes.up],
    };
    return Autofill;
}(React.Component));
export { Autofill };
/**
 *  @deprecated do not use.
 * {@docCategory Autofill}
 */
var BaseAutoFill = /** @class */ (function (_super) {
    __extends(BaseAutoFill, _super);
    function BaseAutoFill() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return BaseAutoFill;
}(Autofill));
export { BaseAutoFill };
//# sourceMappingURL=Autofill.js.map