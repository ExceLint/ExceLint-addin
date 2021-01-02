define(["require", "exports", "tslib", "react", "@uifabric/utilities", "../../Utilities"], function (require, exports, tslib_1, React, utilities_1, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var FocusTrapZone = /** @class */ (function (_super) {
        tslib_1.__extends(FocusTrapZone, _super);
        function FocusTrapZone(props) {
            var _this = _super.call(this, props) || this;
            _this._root = React.createRef();
            _this._firstBumper = React.createRef();
            _this._lastBumper = React.createRef();
            _this._hasFocus = false;
            _this._onRootFocus = function (ev) {
                if (_this.props.onFocus) {
                    _this.props.onFocus(ev);
                }
                _this._hasFocus = true;
            };
            _this._onRootBlur = function (ev) {
                if (_this.props.onBlur) {
                    _this.props.onBlur(ev);
                }
                var relatedTarget = ev.relatedTarget;
                if (ev.relatedTarget === null) {
                    // In IE11, due to lack of support, event.relatedTarget is always
                    // null making every onBlur call to be "outside" of the ComboBox
                    // even when it's not. Using document.activeElement is another way
                    // for us to be able to get what the relatedTarget without relying
                    // on the event
                    relatedTarget = _this._getDocument().activeElement;
                }
                if (!Utilities_1.elementContains(_this._root.current, relatedTarget)) {
                    _this._hasFocus = false;
                }
            };
            _this._onFirstBumperFocus = function () {
                _this._onBumperFocus(true);
            };
            _this._onLastBumperFocus = function () {
                _this._onBumperFocus(false);
            };
            _this._onBumperFocus = function (isFirstBumper) {
                if (_this.props.disabled) {
                    return;
                }
                var currentBumper = (isFirstBumper === _this._hasFocus
                    ? _this._lastBumper.current
                    : _this._firstBumper.current);
                if (_this._root.current) {
                    var nextFocusable = isFirstBumper === _this._hasFocus
                        ? Utilities_1.getLastTabbable(_this._root.current, currentBumper, true, false)
                        : Utilities_1.getFirstTabbable(_this._root.current, currentBumper, true, false);
                    if (nextFocusable) {
                        if (_this._isBumper(nextFocusable)) {
                            // This can happen when FTZ contains no tabbable elements.
                            // focus will take care of finding a focusable element in FTZ.
                            _this.focus();
                        }
                        else {
                            nextFocusable.focus();
                        }
                    }
                }
            };
            _this._onFocusCapture = function (ev) {
                if (_this.props.onFocusCapture) {
                    _this.props.onFocusCapture(ev);
                }
                if (ev.target !== ev.currentTarget && !_this._isBumper(ev.target)) {
                    // every time focus changes within the trap zone, remember the focused element so that
                    // it can be restored if focus leaves the pane and returns via keystroke (i.e. via a call to this.focus(true))
                    _this._previouslyFocusedElementInTrapZone = ev.target;
                }
            };
            _this._forceFocusInTrap = function (ev) {
                if (_this.props.disabled) {
                    return;
                }
                if (FocusTrapZone._focusStack.length && _this === FocusTrapZone._focusStack[FocusTrapZone._focusStack.length - 1]) {
                    var focusedElement = _this._getDocument().activeElement;
                    if (!Utilities_1.elementContains(_this._root.current, focusedElement)) {
                        _this.focus();
                        _this._hasFocus = true; // set focus here since we stop event propagation
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                }
            };
            _this._forceClickInTrap = function (ev) {
                if (_this.props.disabled) {
                    return;
                }
                if (FocusTrapZone._focusStack.length && _this === FocusTrapZone._focusStack[FocusTrapZone._focusStack.length - 1]) {
                    var clickedElement = ev.target;
                    if (clickedElement && !Utilities_1.elementContains(_this._root.current, clickedElement)) {
                        _this.focus();
                        _this._hasFocus = true; // set focus here since we stop event propagation
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                }
            };
            Utilities_1.initializeComponentRef(_this);
            return _this;
        }
        FocusTrapZone.prototype.componentDidMount = function () {
            this._bringFocusIntoZone();
            this._updateEventHandlers(this.props);
            if (!this.props.disabled && this._root.current && this.props.enableAriaHiddenSiblings) {
                this._unmodalize = utilities_1.modalize(this._root.current);
            }
        };
        FocusTrapZone.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
            var elementToFocusOnDismiss = nextProps.elementToFocusOnDismiss;
            if (elementToFocusOnDismiss && this._previouslyFocusedElementOutsideTrapZone !== elementToFocusOnDismiss) {
                this._previouslyFocusedElementOutsideTrapZone = elementToFocusOnDismiss;
            }
            this._updateEventHandlers(nextProps);
        };
        FocusTrapZone.prototype.componentDidUpdate = function (prevProps) {
            var prevForceFocusInsideTrap = prevProps.forceFocusInsideTrap !== undefined ? prevProps.forceFocusInsideTrap : true;
            var newForceFocusInsideTrap = this.props.forceFocusInsideTrap !== undefined ? this.props.forceFocusInsideTrap : true;
            var prevDisabled = prevProps.disabled !== undefined ? prevProps.disabled : false;
            var newDisabled = this.props.disabled !== undefined ? this.props.disabled : false;
            if ((!prevForceFocusInsideTrap && newForceFocusInsideTrap) || (prevDisabled && !newDisabled)) {
                // Transition from forceFocusInsideTrap / FTZ disabled to enabled.
                // Emulate what happens when a FocusTrapZone gets mounted.
                this._bringFocusIntoZone();
                if (!this._unmodalize && this._root.current && this.props.enableAriaHiddenSiblings) {
                    this._unmodalize = utilities_1.modalize(this._root.current);
                }
            }
            else if ((prevForceFocusInsideTrap && !newForceFocusInsideTrap) || (!prevDisabled && newDisabled)) {
                // Transition from forceFocusInsideTrap / FTZ enabled to disabled.
                // Emulate what happens when a FocusTrapZone gets unmounted.
                this._returnFocusToInitiator();
                if (this._unmodalize) {
                    this._unmodalize();
                }
            }
        };
        FocusTrapZone.prototype.componentWillUnmount = function () {
            // don't handle return focus unless forceFocusInsideTrap is true or focus is still within FocusTrapZone
            if (!this.props.disabled ||
                this.props.forceFocusInsideTrap ||
                !Utilities_1.elementContains(this._root.current, this._getDocument().activeElement)) {
                this._returnFocusToInitiator();
            }
            // Dispose of event handlers so their closures can be garbage-collected
            if (this._disposeClickHandler) {
                this._disposeClickHandler();
                this._disposeClickHandler = undefined;
            }
            if (this._disposeFocusHandler) {
                this._disposeFocusHandler();
                this._disposeFocusHandler = undefined;
            }
            if (this._unmodalize) {
                this._unmodalize();
            }
            // Dispose of element references so the DOM Nodes can be garbage-collected
            delete this._previouslyFocusedElementInTrapZone;
            delete this._previouslyFocusedElementOutsideTrapZone;
        };
        FocusTrapZone.prototype.render = function () {
            var _a = this.props, className = _a.className, _b = _a.disabled, disabled = _b === void 0 ? false : _b, ariaLabelledBy = _a.ariaLabelledBy;
            var divProps = Utilities_1.getNativeProps(this.props, Utilities_1.divProperties);
            var bumperProps = {
                'aria-hidden': true,
                style: {
                    pointerEvents: 'none',
                    position: 'fixed',
                },
                tabIndex: disabled ? -1 : 0,
                'data-is-visible': true,
            };
            return (React.createElement("div", tslib_1.__assign({}, divProps, { className: className, ref: this._root, "aria-labelledby": ariaLabelledBy, onFocusCapture: this._onFocusCapture, onFocus: this._onRootFocus, onBlur: this._onRootBlur }),
                React.createElement("div", tslib_1.__assign({}, bumperProps, { ref: this._firstBumper, onFocus: this._onFirstBumperFocus })),
                this.props.children,
                React.createElement("div", tslib_1.__assign({}, bumperProps, { ref: this._lastBumper, onFocus: this._onLastBumperFocus }))));
        };
        FocusTrapZone.prototype.focus = function () {
            // eslint-disable-next-line deprecation/deprecation
            var _a = this.props, focusPreviouslyFocusedInnerElement = _a.focusPreviouslyFocusedInnerElement, firstFocusableSelector = _a.firstFocusableSelector, firstFocusableTarget = _a.firstFocusableTarget;
            if (focusPreviouslyFocusedInnerElement &&
                this._previouslyFocusedElementInTrapZone &&
                Utilities_1.elementContains(this._root.current, this._previouslyFocusedElementInTrapZone)) {
                // focus on the last item that had focus in the zone before we left the zone
                this._focusAsync(this._previouslyFocusedElementInTrapZone);
                return;
            }
            var focusSelector = typeof firstFocusableSelector === 'string'
                ? firstFocusableSelector
                : firstFocusableSelector && firstFocusableSelector();
            var _firstFocusableChild = null;
            if (this._root.current) {
                if (typeof firstFocusableTarget === 'string') {
                    _firstFocusableChild = this._root.current.querySelector(firstFocusableTarget);
                }
                else if (firstFocusableTarget) {
                    _firstFocusableChild = firstFocusableTarget(this._root.current);
                }
                else if (focusSelector) {
                    _firstFocusableChild = this._root.current.querySelector('.' + focusSelector);
                }
                // Fall back to first element if query selector did not match any elements.
                if (!_firstFocusableChild) {
                    _firstFocusableChild = Utilities_1.getNextElement(this._root.current, this._root.current.firstChild, false, false, false, true);
                }
            }
            if (_firstFocusableChild) {
                this._focusAsync(_firstFocusableChild);
            }
        };
        FocusTrapZone.prototype._focusAsync = function (element) {
            if (!this._isBumper(element)) {
                Utilities_1.focusAsync(element);
            }
        };
        FocusTrapZone.prototype._bringFocusIntoZone = function () {
            var _a = this.props, elementToFocusOnDismiss = _a.elementToFocusOnDismiss, _b = _a.disabled, disabled = _b === void 0 ? false : _b, _c = _a.disableFirstFocus, disableFirstFocus = _c === void 0 ? false : _c;
            if (disabled) {
                return;
            }
            FocusTrapZone._focusStack.push(this);
            this._previouslyFocusedElementOutsideTrapZone = elementToFocusOnDismiss
                ? elementToFocusOnDismiss
                : this._getDocument().activeElement;
            if (!disableFirstFocus && !Utilities_1.elementContains(this._root.current, this._previouslyFocusedElementOutsideTrapZone)) {
                this.focus();
            }
        };
        FocusTrapZone.prototype._returnFocusToInitiator = function () {
            var _this = this;
            var ignoreExternalFocusing = this.props.ignoreExternalFocusing;
            FocusTrapZone._focusStack = FocusTrapZone._focusStack.filter(function (value) {
                return _this !== value;
            });
            var doc = this._getDocument();
            var activeElement = doc.activeElement;
            if (!ignoreExternalFocusing &&
                this._previouslyFocusedElementOutsideTrapZone &&
                typeof this._previouslyFocusedElementOutsideTrapZone.focus === 'function' &&
                (Utilities_1.elementContains(this._root.current, activeElement) || activeElement === doc.body)) {
                this._focusAsync(this._previouslyFocusedElementOutsideTrapZone);
            }
        };
        FocusTrapZone.prototype._updateEventHandlers = function (newProps) {
            var _a = newProps.isClickableOutsideFocusTrap, isClickableOutsideFocusTrap = _a === void 0 ? false : _a, _b = newProps.forceFocusInsideTrap, forceFocusInsideTrap = _b === void 0 ? true : _b;
            if (forceFocusInsideTrap && !this._disposeFocusHandler) {
                this._disposeFocusHandler = Utilities_1.on(window, 'focus', this._forceFocusInTrap, true);
            }
            else if (!forceFocusInsideTrap && this._disposeFocusHandler) {
                this._disposeFocusHandler();
                this._disposeFocusHandler = undefined;
            }
            if (!isClickableOutsideFocusTrap && !this._disposeClickHandler) {
                this._disposeClickHandler = Utilities_1.on(window, 'click', this._forceClickInTrap, true);
            }
            else if (isClickableOutsideFocusTrap && this._disposeClickHandler) {
                this._disposeClickHandler();
                this._disposeClickHandler = undefined;
            }
        };
        FocusTrapZone.prototype._isBumper = function (element) {
            return element === this._firstBumper.current || element === this._lastBumper.current;
        };
        FocusTrapZone.prototype._getDocument = function () {
            return Utilities_1.getDocument(this._root.current);
        };
        FocusTrapZone._focusStack = [];
        return FocusTrapZone;
    }(React.Component));
    exports.FocusTrapZone = FocusTrapZone;
});
//# sourceMappingURL=FocusTrapZone.js.map