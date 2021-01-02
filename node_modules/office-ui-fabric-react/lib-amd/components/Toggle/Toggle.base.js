define(["require", "exports", "tslib", "react", "../../Utilities", "../../Label", "../../KeytipData"], function (require, exports, tslib_1, React, Utilities_1, Label_1, KeytipData_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var COMPONENT_NAME = 'Toggle';
    var ToggleBase = /** @class */ (function (_super) {
        tslib_1.__extends(ToggleBase, _super);
        function ToggleBase(props) {
            var _this = _super.call(this, props) || this;
            _this._toggleButton = React.createRef();
            _this._onClick = function (ev) {
                // eslint-disable-next-line deprecation/deprecation
                var _a = _this.props, disabled = _a.disabled, checkedProp = _a.checked, onChange = _a.onChange, onChanged = _a.onChanged, onClick = _a.onClick;
                var checked = _this.state.checked;
                if (!disabled) {
                    // Only update the state if the user hasn't provided it.
                    if (checkedProp === undefined) {
                        _this.setState({
                            checked: !checked,
                        });
                    }
                    if (onChange) {
                        onChange(ev, !checked);
                    }
                    if (onChanged) {
                        onChanged(!checked);
                    }
                    if (onClick) {
                        onClick(ev);
                    }
                }
            };
            Utilities_1.initializeComponentRef(_this);
            Utilities_1.warnMutuallyExclusive(COMPONENT_NAME, props, {
                checked: 'defaultChecked',
            });
            Utilities_1.warnDeprecations(COMPONENT_NAME, props, {
                onAriaLabel: 'ariaLabel',
                offAriaLabel: undefined,
                onChanged: 'onChange',
            });
            _this.state = {
                checked: !!(props.checked || props.defaultChecked),
            };
            _this._id = props.id || Utilities_1.getId('Toggle');
            return _this;
        }
        ToggleBase.getDerivedStateFromProps = function (nextProps, prevState) {
            if (nextProps.checked === undefined) {
                return null;
            }
            return {
                checked: !!nextProps.checked,
            };
        };
        Object.defineProperty(ToggleBase.prototype, "checked", {
            /**
             * Gets the current checked state of the toggle.
             */
            get: function () {
                return this.state.checked;
            },
            enumerable: true,
            configurable: true
        });
        ToggleBase.prototype.render = function () {
            var _this = this;
            var _a = this.props, _b = _a.as, RootType = _b === void 0 ? 'div' : _b, className = _a.className, theme = _a.theme, disabled = _a.disabled, keytipProps = _a.keytipProps, label = _a.label, ariaLabel = _a.ariaLabel, 
            /* eslint-disable deprecation/deprecation */
            onAriaLabel = _a.onAriaLabel, offAriaLabel = _a.offAriaLabel, 
            /* eslint-enable deprecation/deprecation */
            offText = _a.offText, onText = _a.onText, styles = _a.styles, inlineLabel = _a.inlineLabel;
            var checked = this.state.checked;
            var stateText = checked ? onText : offText;
            var badAriaLabel = checked ? onAriaLabel : offAriaLabel;
            var toggleNativeProps = Utilities_1.getNativeProps(this.props, Utilities_1.inputProperties, ['defaultChecked']);
            var classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                disabled: disabled,
                checked: checked,
                inlineLabel: inlineLabel,
                onOffMissing: !onText && !offText,
            });
            var labelId = this._id + "-label";
            var stateTextId = this._id + "-stateText";
            // The following properties take priority for what Narrator should read:
            // 1. ariaLabel
            // 2. onAriaLabel (if checked) or offAriaLabel (if not checked)
            // 3. label AND stateText, if existent
            var labelledById = undefined;
            if (!ariaLabel && !badAriaLabel) {
                if (label) {
                    labelledById = labelId;
                }
                if (stateText) {
                    labelledById = labelledById ? labelledById + " " + stateTextId : stateTextId;
                }
            }
            var ariaRole = this.props.role ? this.props.role : 'switch';
            var renderPill = function (keytipAttributes) {
                if (keytipAttributes === void 0) { keytipAttributes = {}; }
                return (React.createElement("button", tslib_1.__assign({}, toggleNativeProps, keytipAttributes, { className: classNames.pill, disabled: disabled, id: _this._id, type: "button", role: ariaRole, ref: _this._toggleButton, "aria-disabled": disabled, "aria-checked": checked, "aria-label": ariaLabel ? ariaLabel : badAriaLabel, "data-is-focusable": true, onChange: _this._noop, onClick: _this._onClick, "aria-labelledby": labelledById }),
                    React.createElement("span", { className: classNames.thumb })));
            };
            var pillContent = keytipProps ? (React.createElement(KeytipData_1.KeytipData, { keytipProps: keytipProps, ariaDescribedBy: toggleNativeProps['aria-describedby'], disabled: disabled }, function (keytipAttributes) { return renderPill(keytipAttributes); })) : (renderPill());
            return (React.createElement(RootType, { className: classNames.root, hidden: toggleNativeProps.hidden },
                label && (React.createElement(Label_1.Label, { htmlFor: this._id, className: classNames.label, id: labelId }, label)),
                React.createElement("div", { className: classNames.container },
                    pillContent,
                    stateText && (
                    // This second "htmlFor" property is needed to allow the
                    // toggle's stateText to also trigger a state change when clicked.
                    React.createElement(Label_1.Label, { htmlFor: this._id, className: classNames.text, id: stateTextId }, stateText))),
                React.createElement(Utilities_1.FocusRects, null)));
        };
        ToggleBase.prototype.focus = function () {
            if (this._toggleButton.current) {
                this._toggleButton.current.focus();
            }
        };
        ToggleBase.prototype._noop = function () {
            /* no-op */
        };
        return ToggleBase;
    }(React.Component));
    exports.ToggleBase = ToggleBase;
});
//# sourceMappingURL=Toggle.base.js.map