define(["require", "exports", "tslib", "react", "../../Utilities", "../../Button", "../../Icon"], function (require, exports, tslib_1, React, Utilities_1, Button_1, Icon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var COMPONENT_NAME = 'SearchBox';
    var SearchBoxBase = /** @class */ (function (_super) {
        tslib_1.__extends(SearchBoxBase, _super);
        function SearchBoxBase(props) {
            var _this = _super.call(this, props) || this;
            _this._rootElement = React.createRef();
            _this._inputElement = React.createRef();
            _this._onClickFocus = function () {
                var inputElement = _this._inputElement.current;
                if (inputElement) {
                    _this.focus();
                    inputElement.selectionStart = inputElement.selectionEnd = 0;
                }
            };
            _this._onFocusCapture = function (ev) {
                _this.setState({
                    hasFocus: true,
                });
                if (_this.props.onFocus) {
                    _this.props.onFocus(ev);
                }
            };
            _this._onClearClick = function (ev) {
                var clearButtonProps = _this.props.clearButtonProps;
                if (clearButtonProps && clearButtonProps.onClick) {
                    clearButtonProps.onClick(ev);
                }
                if (!ev.defaultPrevented) {
                    _this._onClear(ev);
                }
            };
            _this._onKeyDown = function (ev) {
                switch (ev.which) {
                    case Utilities_1.KeyCodes.escape:
                        _this.props.onEscape && _this.props.onEscape(ev);
                        // Only call onClear if the search box has a value to clear. Otherwise, allow the Esc key
                        // to propagate from the empty search box to a parent element such as a dialog, etc.
                        if (_this.state.value && !ev.defaultPrevented) {
                            _this._onClear(ev);
                        }
                        break;
                    case Utilities_1.KeyCodes.enter:
                        if (_this.props.onSearch) {
                            _this.props.onSearch(_this.state.value);
                            ev.preventDefault();
                            ev.stopPropagation();
                        }
                        break;
                    default:
                        _this.props.onKeyDown && _this.props.onKeyDown(ev);
                        if (ev.defaultPrevented) {
                            ev.stopPropagation();
                        }
                        break;
                }
            };
            _this._onBlur = function (ev) {
                _this.setState({
                    hasFocus: false,
                });
                if (_this.props.onBlur) {
                    _this.props.onBlur(ev);
                }
            };
            _this._onInputChange = function (ev) {
                var value = ev.target.value;
                if (value === _this._latestValue) {
                    return;
                }
                _this._latestValue = value;
                _this.setState({ value: value });
                _this._callOnChange(ev, value);
            };
            Utilities_1.initializeComponentRef(_this);
            Utilities_1.warnDeprecations(COMPONENT_NAME, props, {
                labelText: 'placeholder',
                defaultValue: 'value',
            });
            _this._latestValue = props.value || '';
            _this._fallbackId = Utilities_1.getId(COMPONENT_NAME);
            _this.state = {
                value: _this._latestValue,
                hasFocus: false,
            };
            return _this;
        }
        SearchBoxBase.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
            if (newProps.value !== undefined) {
                this._latestValue = newProps.value;
                // If the user passes in null, substitute an empty string
                // (passing null is not allowed per typings, but users might do it anyway)
                this.setState({
                    value: newProps.value || '',
                });
            }
        };
        SearchBoxBase.prototype.render = function () {
            var _a = this.props, ariaLabel = _a.ariaLabel, placeholder = _a.placeholder, className = _a.className, disabled = _a.disabled, underlined = _a.underlined, styles = _a.styles, 
            // eslint-disable-next-line deprecation/deprecation
            labelText = _a.labelText, theme = _a.theme, clearButtonProps = _a.clearButtonProps, disableAnimation = _a.disableAnimation, iconProps = _a.iconProps, role = _a.role, _b = _a.id, id = _b === void 0 ? this._fallbackId : _b;
            var _c = this.state, value = _c.value, hasFocus = _c.hasFocus;
            var placeholderValue = placeholder !== undefined ? placeholder : labelText;
            var classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                underlined: underlined,
                hasFocus: hasFocus,
                disabled: disabled,
                hasInput: value.length > 0,
                disableAnimation: disableAnimation,
            });
            var nativeProps = Utilities_1.getNativeProps(this.props, Utilities_1.inputProperties, [
                'className',
                'placeholder',
                'onFocus',
                'onBlur',
                'value',
                'role',
            ]);
            return (React.createElement("div", { role: role, ref: this._rootElement, className: classNames.root, onFocusCapture: this._onFocusCapture },
                React.createElement("div", { className: classNames.iconContainer, onClick: this._onClickFocus, "aria-hidden": true },
                    React.createElement(Icon_1.Icon, tslib_1.__assign({ iconName: "Search" }, iconProps, { className: classNames.icon }))),
                React.createElement("input", tslib_1.__assign({}, nativeProps, { id: id, className: classNames.field, placeholder: placeholderValue, onChange: this._onInputChange, onInput: this._onInputChange, onBlur: this._onBlur, onKeyDown: this._onKeyDown, value: value, disabled: disabled, role: "searchbox", "aria-label": ariaLabel, ref: this._inputElement })),
                value.length > 0 && (React.createElement("div", { className: classNames.clearButton },
                    React.createElement(Button_1.IconButton, tslib_1.__assign({ onBlur: this._onBlur, styles: { root: { height: 'auto' }, icon: { fontSize: '12px' } }, iconProps: { iconName: 'Clear' } }, clearButtonProps, { onClick: this._onClearClick }))))));
        };
        /**
         * Sets focus to the search box input field
         */
        SearchBoxBase.prototype.focus = function () {
            if (this._inputElement.current) {
                this._inputElement.current.focus();
            }
        };
        /**
         * Returns whether or not the SearchBox has focus
         */
        SearchBoxBase.prototype.hasFocus = function () {
            return !!this.state.hasFocus;
        };
        SearchBoxBase.prototype._onClear = function (ev) {
            this.props.onClear && this.props.onClear(ev);
            if (!ev.defaultPrevented) {
                this._latestValue = '';
                this.setState({
                    value: '',
                });
                this._callOnChange(undefined, '');
                ev.stopPropagation();
                ev.preventDefault();
                this.focus();
            }
        };
        SearchBoxBase.prototype._callOnChange = function (ev, newValue) {
            // eslint-disable-next-line deprecation/deprecation
            var _a = this.props, onChange = _a.onChange, onChanged = _a.onChanged;
            // Call @deprecated method.
            if (onChanged) {
                onChanged(newValue);
            }
            if (onChange) {
                onChange(ev, newValue);
            }
        };
        SearchBoxBase.defaultProps = {
            disableAnimation: false,
            clearButtonProps: { ariaLabel: 'Clear text' },
        };
        return SearchBoxBase;
    }(React.Component));
    exports.SearchBoxBase = SearchBoxBase;
});
//# sourceMappingURL=SearchBox.base.js.map