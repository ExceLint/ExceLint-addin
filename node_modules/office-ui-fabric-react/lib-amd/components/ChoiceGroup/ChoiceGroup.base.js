define(["require", "exports", "tslib", "react", "../../Label", "../../Utilities", "./ChoiceGroupOption/index"], function (require, exports, tslib_1, React, Label_1, Utilities_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    /**
     * {@docCategory ChoiceGroup}
     */
    var ChoiceGroupBase = /** @class */ (function (_super) {
        tslib_1.__extends(ChoiceGroupBase, _super);
        function ChoiceGroupBase(props) {
            var _this = _super.call(this, props) || this;
            _this._focusCallbacks = {};
            _this._changeCallbacks = {};
            _this._onBlur = function (ev, option) {
                _this.setState({
                    keyFocused: undefined,
                });
            };
            Utilities_1.initializeComponentRef(_this);
            
            var defaultSelectedKey = props.defaultSelectedKey, _a = props.options, options = _a === void 0 ? [] : _a;
            var validDefaultSelectedKey = !_isControlled(props) &&
                defaultSelectedKey !== undefined &&
                options.some(function (option) { return option.key === defaultSelectedKey; });
            _this.state = {
                keyChecked: validDefaultSelectedKey ? defaultSelectedKey : _this._getKeyChecked(props),
            };
            _this._id = Utilities_1.getId('ChoiceGroup');
            _this._labelId = Utilities_1.getId('ChoiceGroupLabel');
            return _this;
        }
        Object.defineProperty(ChoiceGroupBase.prototype, "checkedOption", {
            /**
             * Gets the current checked option.
             */
            get: function () {
                var _this = this;
                var _a = this.props.options, options = _a === void 0 ? [] : _a;
                return Utilities_1.find(options, function (value) { return value.key === _this.state.keyChecked; });
            },
            enumerable: true,
            configurable: true
        });
        ChoiceGroupBase.prototype.componentDidUpdate = function (prevProps, prevState) {
            // Only update if a new props object has been passed in (don't care about state updates)
            if (prevProps !== this.props) {
                var newKeyChecked = this._getKeyChecked(this.props);
                var oldKeyChecked = this._getKeyChecked(prevProps);
                if (newKeyChecked !== oldKeyChecked) {
                    this.setState({
                        keyChecked: newKeyChecked,
                    });
                }
            }
        };
        ChoiceGroupBase.prototype.render = function () {
            var _this = this;
            var _a = this.props, className = _a.className, theme = _a.theme, styles = _a.styles, _b = _a.options, options = _b === void 0 ? [] : _b, label = _a.label, required = _a.required, disabled = _a.disabled, name = _a.name;
            var _c = this.state, keyChecked = _c.keyChecked, keyFocused = _c.keyFocused;
            var divProps = Utilities_1.getNativeProps(this.props, Utilities_1.divProperties, [
                'onChange',
                'className',
                'required',
            ]);
            var classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                optionsContainIconOrImage: options.some(function (option) { return !!(option.iconProps || option.imageSrc); }),
            });
            var labelId = this._id + '-label';
            var ariaLabelledBy = this.props.ariaLabelledBy || (label ? labelId : this.props['aria-labelledby']);
            // TODO (Fabric 8?) - if possible, move `root` class to the actual root and eliminate
            // `applicationRole` class (but the div structure will stay the same by necessity)
            return (
            // eslint-disable-next-line deprecation/deprecation
            React.createElement("div", tslib_1.__assign({ className: classNames.applicationRole }, divProps),
                React.createElement("div", tslib_1.__assign({ className: classNames.root, role: "radiogroup" }, (ariaLabelledBy && { 'aria-labelledby': ariaLabelledBy })),
                    label && (React.createElement(Label_1.Label, { className: classNames.label, required: required, id: labelId, disabled: disabled }, label)),
                    React.createElement("div", { className: classNames.flexContainer }, options.map(function (option) {
                        var innerOptionProps = tslib_1.__assign(tslib_1.__assign({}, option), { focused: option.key === keyFocused, checked: option.key === keyChecked, disabled: option.disabled || disabled, id: _this._getOptionId(option), labelId: _this._getOptionLabelId(option), name: name || _this._id, required: required });
                        return (React.createElement(index_1.ChoiceGroupOption, tslib_1.__assign({ key: option.key, onBlur: _this._onBlur, onFocus: _this._onFocus(option.key), onChange: _this._onChange(option.key) }, innerOptionProps)));
                    })))));
        };
        ChoiceGroupBase.prototype.focus = function () {
            var _a = this.props.options, options = _a === void 0 ? [] : _a;
            var optionToFocus = this.checkedOption || options.filter(function (option) { return !option.disabled; })[0];
            var elementToFocus = optionToFocus && document.getElementById(this._getOptionId(optionToFocus));
            if (elementToFocus) {
                elementToFocus.focus();
            }
        };
        ChoiceGroupBase.prototype._onFocus = function (key) {
            var _this = this;
            // This extra mess is necessary because React won't pass the `key` prop through to ChoiceGroupOption
            if (!this._focusCallbacks[key]) {
                this._focusCallbacks[key] = function (ev, option) {
                    _this.setState({
                        keyFocused: key,
                    });
                };
            }
            return this._focusCallbacks[key];
        };
        ChoiceGroupBase.prototype._onChange = function (key) {
            var _this = this;
            // This extra mess is necessary because React won't pass the `key` prop through to ChoiceGroupOption
            if (!this._changeCallbacks[key]) {
                this._changeCallbacks[key] = function (evt, option) {
                    // eslint-disable-next-line deprecation/deprecation
                    var _a = _this.props, onChanged = _a.onChanged, onChange = _a.onChange;
                    // Only manage state in uncontrolled scenarios.
                    if (!_isControlled(_this.props)) {
                        _this.setState({
                            keyChecked: key,
                        });
                    }
                    // Get the original option without the `key` prop removed
                    var originalOption = Utilities_1.find(_this.props.options || [], function (value) { return value.key === key; });
                    // TODO: onChanged deprecated, remove else if after 07/17/2017 when onChanged has been removed.
                    if (onChange) {
                        onChange(evt, originalOption);
                    }
                    else if (onChanged) {
                        onChanged(originalOption, evt);
                    }
                };
            }
            return this._changeCallbacks[key];
        };
        /**
         * Returns `selectedKey` if provided, or the key of the first option with the `checked` prop set.
         */
        ChoiceGroupBase.prototype._getKeyChecked = function (props) {
            if (props.selectedKey !== undefined) {
                return props.selectedKey;
            }
            var _a = props.options, options = _a === void 0 ? [] : _a;
            // eslint-disable-next-line deprecation/deprecation
            var optionsChecked = options.filter(function (option) { return option.checked; });
            return optionsChecked[0] && optionsChecked[0].key;
        };
        ChoiceGroupBase.prototype._getOptionId = function (option) {
            return option.id || this._id + "-" + option.key;
        };
        ChoiceGroupBase.prototype._getOptionLabelId = function (option) {
            return option.labelId || this._labelId + "-" + option.key;
        };
        return ChoiceGroupBase;
    }(React.Component));
    exports.ChoiceGroupBase = ChoiceGroupBase;
    function _isControlled(props) {
        return Utilities_1.isControlled(props, 'selectedKey');
    }
});
//# sourceMappingURL=ChoiceGroup.base.js.map