define(["require", "exports", "tslib", "react", "../../Utilities", "../../Icon", "../../KeytipData"], function (require, exports, tslib_1, React, Utilities_1, Icon_1, KeytipData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var CheckboxBase = /** @class */ (function (_super) {
        tslib_1.__extends(CheckboxBase, _super);
        /**
         * Initialize a new instance of the Checkbox
         * @param props - Props for the component
         * @param context - Context or initial state for the base component.
         */
        function CheckboxBase(props, context) {
            var _this = _super.call(this, props, context) || this;
            _this._checkBox = React.createRef();
            _this._renderContent = function (checked, indeterminate, keytipAttributes) {
                if (keytipAttributes === void 0) { keytipAttributes = {}; }
                var _a = _this.props, disabled = _a.disabled, inputProps = _a.inputProps, name = _a.name, ariaLabel = _a.ariaLabel, ariaLabelledBy = _a.ariaLabelledBy, ariaDescribedBy = _a.ariaDescribedBy, _b = _a.onRenderLabel, onRenderLabel = _b === void 0 ? _this._onRenderLabel : _b, checkmarkIconProps = _a.checkmarkIconProps, ariaPositionInSet = _a.ariaPositionInSet, ariaSetSize = _a.ariaSetSize, title = _a.title, label = _a.label;
                return (React.createElement("div", { className: _this._classNames.root, title: title },
                    React.createElement(Utilities_1.FocusRects, null),
                    React.createElement("input", tslib_1.__assign({ type: "checkbox" }, inputProps, { "data-ktp-execute-target": keytipAttributes['data-ktp-execute-target'], checked: checked, disabled: disabled, className: _this._classNames.input, ref: _this._checkBox, name: name, id: _this._id, title: title, onChange: _this._onChange, onFocus: _this._onFocus, onBlur: _this._onBlur, "aria-disabled": disabled, "aria-label": ariaLabel || label, "aria-labelledby": ariaLabelledBy, "aria-describedby": Utilities_1.mergeAriaAttributeValues(ariaDescribedBy, keytipAttributes['aria-describedby']), "aria-posinset": ariaPositionInSet, "aria-setsize": ariaSetSize, "aria-checked": indeterminate ? 'mixed' : checked ? 'true' : 'false' })),
                    React.createElement("label", { className: _this._classNames.label, htmlFor: _this._id },
                        React.createElement("div", { className: _this._classNames.checkbox, "data-ktp-target": keytipAttributes['data-ktp-target'] },
                            React.createElement(Icon_1.Icon, tslib_1.__assign({ iconName: "CheckMark" }, checkmarkIconProps, { className: _this._classNames.checkmark }))),
                        onRenderLabel(_this.props, _this._onRenderLabel))));
            };
            _this._onFocus = function (ev) {
                var inputProps = _this.props.inputProps;
                if (inputProps && inputProps.onFocus) {
                    inputProps.onFocus(ev);
                }
            };
            _this._onBlur = function (ev) {
                var inputProps = _this.props.inputProps;
                if (inputProps && inputProps.onBlur) {
                    inputProps.onBlur(ev);
                }
            };
            _this._onChange = function (ev) {
                var onChange = _this.props.onChange;
                var _a = _this.state, isChecked = _a.isChecked, isIndeterminate = _a.isIndeterminate;
                if (!isIndeterminate) {
                    if (onChange) {
                        onChange(ev, !isChecked);
                    }
                    if (_this.props.checked === undefined) {
                        _this.setState({ isChecked: !isChecked });
                    }
                }
                else {
                    // If indeterminate, clicking the checkbox *only* removes the indeterminate state (or if
                    // controlled, lets the consumer know to change it by calling onChange). It doesn't
                    // change the checked state.
                    if (onChange) {
                        onChange(ev, isChecked);
                    }
                    if (_this.props.indeterminate === undefined) {
                        _this.setState({ isIndeterminate: false });
                    }
                }
            };
            _this._onRenderLabel = function (props) {
                var label = props.label, title = props.title;
                return label ? (React.createElement("span", { "aria-hidden": "true", className: _this._classNames.text, title: title }, label)) : null;
            };
            Utilities_1.initializeComponentRef(_this);
            
            _this._id = _this.props.id || Utilities_1.getId('checkbox-');
            _this.state = {
                isChecked: !!(props.checked !== undefined ? props.checked : props.defaultChecked),
                isIndeterminate: !!(props.indeterminate !== undefined ? props.indeterminate : props.defaultIndeterminate),
            };
            return _this;
        }
        CheckboxBase.getDerivedStateFromProps = function (nextProps, prevState) {
            var stateUpdate = {};
            if (nextProps.indeterminate !== undefined) {
                stateUpdate.isIndeterminate = !!nextProps.indeterminate;
            }
            if (nextProps.checked !== undefined) {
                stateUpdate.isChecked = !!nextProps.checked;
            }
            return Object.keys(stateUpdate).length ? stateUpdate : null;
        };
        /**
         * Render the Checkbox based on passed props
         */
        CheckboxBase.prototype.render = function () {
            var _this = this;
            var _a = this.props, className = _a.className, disabled = _a.disabled, boxSide = _a.boxSide, theme = _a.theme, styles = _a.styles, _b = _a.onRenderLabel, onRenderLabel = _b === void 0 ? this._onRenderLabel : _b, keytipProps = _a.keytipProps;
            var _c = this.state, isChecked = _c.isChecked, isIndeterminate = _c.isIndeterminate;
            this._classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                disabled: disabled,
                indeterminate: isIndeterminate,
                checked: isChecked,
                reversed: boxSide !== 'start',
                isUsingCustomLabelRender: onRenderLabel !== this._onRenderLabel,
            });
            if (keytipProps) {
                return (React.createElement(KeytipData_1.KeytipData, { keytipProps: keytipProps, disabled: disabled }, function (keytipAttributes) { return _this._renderContent(isChecked, isIndeterminate, keytipAttributes); }));
            }
            return this._renderContent(isChecked, isIndeterminate);
        };
        Object.defineProperty(CheckboxBase.prototype, "indeterminate", {
            get: function () {
                return !!this.state.isIndeterminate;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CheckboxBase.prototype, "checked", {
            get: function () {
                return !!this.state.isChecked;
            },
            enumerable: true,
            configurable: true
        });
        CheckboxBase.prototype.focus = function () {
            if (this._checkBox.current) {
                this._checkBox.current.focus();
            }
        };
        CheckboxBase.defaultProps = {
            boxSide: 'start',
        };
        return CheckboxBase;
    }(React.Component));
    exports.CheckboxBase = CheckboxBase;
});
//# sourceMappingURL=Checkbox.base.js.map