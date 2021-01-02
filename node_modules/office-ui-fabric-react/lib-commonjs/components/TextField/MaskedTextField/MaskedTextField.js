"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var TextField_1 = require("../TextField");
var Utilities_1 = require("../../../Utilities");
var inputMask_1 = require("./inputMask");
exports.DEFAULT_MASK_CHAR = '_';
var MaskedTextField = /** @class */ (function (_super) {
    tslib_1.__extends(MaskedTextField, _super);
    function MaskedTextField(props) {
        var _this = _super.call(this, props) || this;
        _this._textField = React.createRef();
        _this._onFocus = function (event) {
            if (_this.props.onFocus) {
                _this.props.onFocus(event);
            }
            _this._isFocused = true;
            // Move the cursor position to the leftmost unfilled position
            for (var i = 0; i < _this._maskCharData.length; i++) {
                if (!_this._maskCharData[i].value) {
                    _this.setState({
                        maskCursorPosition: _this._maskCharData[i].displayIndex,
                    });
                    break;
                }
            }
        };
        _this._onBlur = function (event) {
            if (_this.props.onBlur) {
                _this.props.onBlur(event);
            }
            _this._isFocused = false;
            _this._moveCursorOnMouseUp = true;
        };
        _this._onMouseDown = function (event) {
            if (_this.props.onMouseDown) {
                _this.props.onMouseDown(event);
            }
            if (!_this._isFocused) {
                _this._moveCursorOnMouseUp = true;
            }
        };
        _this._onMouseUp = function (event) {
            if (_this.props.onMouseUp) {
                _this.props.onMouseUp(event);
            }
            // Move the cursor on mouseUp after focusing the textField
            if (_this._moveCursorOnMouseUp) {
                _this._moveCursorOnMouseUp = false;
                // Move the cursor position to the rightmost unfilled position
                for (var i = 0; i < _this._maskCharData.length; i++) {
                    if (!_this._maskCharData[i].value) {
                        _this.setState({
                            maskCursorPosition: _this._maskCharData[i].displayIndex,
                        });
                        break;
                    }
                }
            }
        };
        _this._onInputChange = function (ev, value) {
            var textField = _this._textField.current;
            if (_this._changeSelectionData === null && textField) {
                _this._changeSelectionData = {
                    changeType: 'default',
                    selectionStart: textField.selectionStart !== null ? textField.selectionStart : -1,
                    selectionEnd: textField.selectionEnd !== null ? textField.selectionEnd : -1,
                };
            }
            if (!_this._changeSelectionData) {
                return;
            }
            var displayValue = _this.state.displayValue;
            // The initial value of cursorPos does not matter
            var cursorPos = 0;
            var _a = _this._changeSelectionData, changeType = _a.changeType, selectionStart = _a.selectionStart, selectionEnd = _a.selectionEnd;
            if (changeType === 'textPasted') {
                var charsSelected = selectionEnd - selectionStart;
                var charCount = value.length + charsSelected - displayValue.length;
                var startPos = selectionStart;
                var pastedString = value.substr(startPos, charCount);
                // Clear any selected characters
                if (charsSelected) {
                    _this._maskCharData = inputMask_1.clearRange(_this._maskCharData, selectionStart, charsSelected);
                }
                cursorPos = inputMask_1.insertString(_this._maskCharData, startPos, pastedString);
            }
            else if (changeType === 'delete' || changeType === 'backspace') {
                // isDel is true If the characters are removed LTR, otherwise RTL
                var isDel = changeType === 'delete';
                var charCount = selectionEnd - selectionStart;
                if (charCount) {
                    // charCount is > 0 if range was deleted
                    _this._maskCharData = inputMask_1.clearRange(_this._maskCharData, selectionStart, charCount);
                    cursorPos = inputMask_1.getRightFormatIndex(_this._maskCharData, selectionStart);
                }
                else {
                    // If charCount === 0, there was no selection and a single character was deleted
                    if (isDel) {
                        _this._maskCharData = inputMask_1.clearNext(_this._maskCharData, selectionStart);
                        cursorPos = inputMask_1.getRightFormatIndex(_this._maskCharData, selectionStart);
                    }
                    else {
                        _this._maskCharData = inputMask_1.clearPrev(_this._maskCharData, selectionStart);
                        cursorPos = inputMask_1.getLeftFormatIndex(_this._maskCharData, selectionStart);
                    }
                }
            }
            else if (value.length > displayValue.length) {
                // This case is if the user added characters
                var charCount = value.length - displayValue.length;
                var startPos = selectionEnd - charCount;
                var enteredString = value.substr(startPos, charCount);
                cursorPos = inputMask_1.insertString(_this._maskCharData, startPos, enteredString);
            }
            else if (value.length <= displayValue.length) {
                /**
                 * This case is reached only if the user has selected a block of 1 or more
                 * characters and input a character replacing the characters they've selected.
                 */
                var charCount = 1;
                var selectCount = displayValue.length + charCount - value.length;
                var startPos = selectionEnd - charCount;
                var enteredString = value.substr(startPos, charCount);
                // Clear the selected range
                _this._maskCharData = inputMask_1.clearRange(_this._maskCharData, startPos, selectCount);
                // Insert the printed character
                cursorPos = inputMask_1.insertString(_this._maskCharData, startPos, enteredString);
            }
            _this._changeSelectionData = null;
            var newValue = inputMask_1.getMaskDisplay(_this.props.mask, _this._maskCharData, _this.props.maskChar);
            _this.setState({
                displayValue: newValue,
                maskCursorPosition: cursorPos,
            });
            // Perform onChange after input has been processed. Return value is expected to be the displayed text
            if (_this.props.onChange) {
                _this.props.onChange(ev, newValue);
            }
        };
        _this._onKeyDown = function (event) {
            var current = _this._textField.current;
            if (_this.props.onKeyDown) {
                _this.props.onKeyDown(event);
            }
            _this._changeSelectionData = null;
            if (current && current.value) {
                var keyCode = event.keyCode, ctrlKey = event.ctrlKey, metaKey = event.metaKey;
                // Ignore ctrl and meta keydown
                if (ctrlKey || metaKey) {
                    return;
                }
                // On backspace or delete, store the selection and the keyCode
                if (keyCode === Utilities_1.KeyCodes.backspace || keyCode === Utilities_1.KeyCodes.del) {
                    var selectionStart = event.target.selectionStart;
                    var selectionEnd = event.target.selectionEnd;
                    // Check if backspace or delete press is valid.
                    if (!(keyCode === Utilities_1.KeyCodes.backspace && selectionEnd && selectionEnd > 0) &&
                        !(keyCode === Utilities_1.KeyCodes.del && selectionStart !== null && selectionStart < current.value.length)) {
                        return;
                    }
                    _this._changeSelectionData = {
                        changeType: keyCode === Utilities_1.KeyCodes.backspace ? 'backspace' : 'delete',
                        selectionStart: selectionStart !== null ? selectionStart : -1,
                        selectionEnd: selectionEnd !== null ? selectionEnd : -1,
                    };
                }
            }
        };
        _this._onPaste = function (event) {
            if (_this.props.onPaste) {
                _this.props.onPaste(event);
            }
            var selectionStart = event.target.selectionStart;
            var selectionEnd = event.target.selectionEnd;
            // Store the paste selection range
            _this._changeSelectionData = {
                changeType: 'textPasted',
                selectionStart: selectionStart !== null ? selectionStart : -1,
                selectionEnd: selectionEnd !== null ? selectionEnd : -1,
            };
        };
        Utilities_1.initializeComponentRef(_this);
        // Translate mask into charData
        _this._maskCharData = inputMask_1.parseMask(props.mask, props.maskFormat);
        // If an initial value is provided, use it to populate the format chars
        props.value !== undefined && _this.setValue(props.value);
        _this._isFocused = false;
        _this._moveCursorOnMouseUp = false;
        _this.state = {
            displayValue: inputMask_1.getMaskDisplay(props.mask, _this._maskCharData, props.maskChar),
        };
        return _this;
    }
    MaskedTextField.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
        if (newProps.mask !== this.props.mask || newProps.value !== this.props.value) {
            this._maskCharData = inputMask_1.parseMask(newProps.mask, newProps.maskFormat);
            newProps.value !== undefined && this.setValue(newProps.value);
            this.setState({
                displayValue: inputMask_1.getMaskDisplay(newProps.mask, this._maskCharData, newProps.maskChar),
            });
        }
    };
    MaskedTextField.prototype.componentDidUpdate = function () {
        // Move the cursor to the start of the mask format on update
        if (this._isFocused && this.state.maskCursorPosition !== undefined && this._textField.current) {
            this._textField.current.setSelectionRange(this.state.maskCursorPosition, this.state.maskCursorPosition);
        }
    };
    MaskedTextField.prototype.render = function () {
        return (React.createElement(TextField_1.TextField, tslib_1.__assign({}, this.props, { onFocus: this._onFocus, onBlur: this._onBlur, onMouseDown: this._onMouseDown, onMouseUp: this._onMouseUp, onChange: this._onInputChange, onKeyDown: this._onKeyDown, onPaste: this._onPaste, value: this.state.displayValue || '', componentRef: this._textField })));
    };
    Object.defineProperty(MaskedTextField.prototype, "value", {
        /**
         * @returns The value of all filled format characters or undefined if not all format characters are filled
         */
        get: function () {
            var value = '';
            for (var i = 0; i < this._maskCharData.length; i++) {
                if (!this._maskCharData[i].value) {
                    return undefined;
                }
                value += this._maskCharData[i].value;
            }
            return value;
        },
        enumerable: true,
        configurable: true
    });
    MaskedTextField.prototype.setValue = function (newValue) {
        var valueIndex = 0;
        var charDataIndex = 0;
        while (valueIndex < newValue.length && charDataIndex < this._maskCharData.length) {
            // Test if the next character in the new value fits the next format character
            var testVal = newValue[valueIndex];
            if (this._maskCharData[charDataIndex].format.test(testVal)) {
                this._maskCharData[charDataIndex].value = testVal;
                charDataIndex++;
            }
            valueIndex++;
        }
    };
    MaskedTextField.prototype.focus = function () {
        var current = this._textField.current;
        current && current.focus();
    };
    MaskedTextField.prototype.blur = function () {
        var current = this._textField.current;
        current && current.blur();
    };
    MaskedTextField.prototype.select = function () {
        var current = this._textField.current;
        current && current.select();
    };
    MaskedTextField.prototype.setSelectionStart = function (value) {
        var current = this._textField.current;
        current && current.setSelectionStart(value);
    };
    MaskedTextField.prototype.setSelectionEnd = function (value) {
        var current = this._textField.current;
        current && current.setSelectionEnd(value);
    };
    MaskedTextField.prototype.setSelectionRange = function (start, end) {
        var current = this._textField.current;
        current && current.setSelectionRange(start, end);
    };
    Object.defineProperty(MaskedTextField.prototype, "selectionStart", {
        get: function () {
            var current = this._textField.current;
            return current && current.selectionStart !== null ? current.selectionStart : -1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MaskedTextField.prototype, "selectionEnd", {
        get: function () {
            var current = this._textField.current;
            return current && current.selectionEnd ? current.selectionEnd : -1;
        },
        enumerable: true,
        configurable: true
    });
    MaskedTextField.defaultProps = {
        maskChar: exports.DEFAULT_MASK_CHAR,
        maskFormat: inputMask_1.DEFAULT_MASK_FORMAT_CHARS,
    };
    return MaskedTextField;
}(React.Component));
exports.MaskedTextField = MaskedTextField;
//# sourceMappingURL=MaskedTextField.js.map