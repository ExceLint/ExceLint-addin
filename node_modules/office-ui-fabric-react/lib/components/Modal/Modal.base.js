import { __assign, __decorate, __extends } from "tslib";
import * as React from 'react';
import { classNamesFunction, getId, allowScrollOnElement, allowOverscrollOnElement, KeyCodes, elementContains, warnDeprecations, Async, EventGroup, } from '../../Utilities';
import { FocusTrapZone } from '../FocusTrapZone/index';
import { animationDuration } from './Modal.styles';
import { Overlay } from '../../Overlay';
import { Layer } from '../../Layer';
import { Popup } from '../Popup/index';
import { withResponsiveMode, ResponsiveMode } from '../../utilities/decorators/withResponsiveMode';
import { DirectionalHint } from '../Callout/index';
import { Icon } from '../Icon/index';
import { DraggableZone } from '../../utilities/DraggableZone/index';
import { initializeComponentRef } from '@uifabric/utilities';
// @TODO - need to change this to a panel whenever the breakpoint is under medium (verify the spec)
var DefaultLayerProps = {
    eventBubblingEnabled: false,
};
var getClassNames = classNamesFunction();
var COMPONENT_NAME = 'Modal';
var ModalBase = /** @class */ (function (_super) {
    __extends(ModalBase, _super);
    function ModalBase(props) {
        var _this = _super.call(this, props) || this;
        _this._focusTrapZone = React.createRef();
        _this._registerInitialModalPosition = function () {
            var _a;
            if (((_a = _this.props.dragOptions) === null || _a === void 0 ? void 0 : _a.keepInBounds) && !_this._minClampedPosition && !_this._maxClampedPosition) {
                var dialogMain = document.querySelector("[data-id=" + _this.state.id + "]");
                if (dialogMain) {
                    var modalRectangle = dialogMain.getBoundingClientRect();
                    _this._minClampedPosition = { x: -modalRectangle.x, y: -modalRectangle.y };
                    _this._maxClampedPosition = { x: modalRectangle.x, y: modalRectangle.y };
                }
            }
        };
        // Allow the user to scroll within the modal but not on the body
        _this._allowScrollOnModal = function (elt) {
            if (elt) {
                if (_this._allowTouchBodyScroll) {
                    allowOverscrollOnElement(elt, _this._events);
                }
                else {
                    allowScrollOnElement(elt, _this._events);
                }
            }
            else {
                _this._events.off(_this._scrollableContent);
            }
            _this._scrollableContent = elt;
        };
        _this._onModalContextMenuClose = function () {
            _this.setState({ isModalMenuOpen: false });
        };
        _this._onModalClose = function () {
            _this._lastSetX = 0;
            _this._lastSetY = 0;
            _this.setState({
                isModalMenuOpen: false,
                isInKeyboardMoveMode: false,
                isOpen: false,
                x: 0,
                y: 0,
            });
            if (_this.props.dragOptions && _this._hasRegisteredKeyUp) {
                _this._events.off(window, 'keyup', _this._onKeyUp, true /* useCapture */);
            }
            // Call the onDismiss callback
            if (_this.props.onDismissed) {
                _this.props.onDismissed();
            }
        };
        _this._onDragStart = function () {
            _this.setState({ isModalMenuOpen: false, isInKeyboardMoveMode: false });
        };
        _this._onDrag = function (_, ui) {
            var _a = _this.state, x = _a.x, y = _a.y;
            _this.setState(_this._getClampedPosition({ x: x + ui.delta.x, y: y + ui.delta.y }));
        };
        _this._onDragStop = function () {
            _this.focus();
        };
        _this._onKeyUp = function (event) {
            // Need to handle the CTRL + ALT + SPACE key during keyup due to FireFox bug:
            // https://bugzilla.mozilla.org/show_bug.cgi?id=1220143
            // Otherwise it would continue to fire a click even if the event was cancelled
            // during mouseDown.
            if (event.altKey && event.ctrlKey && event.keyCode === KeyCodes.space) {
                // Since this is a global handler, we should make sure the target is within the dialog
                // before opening the dropdown
                if (elementContains(_this._scrollableContent, event.target)) {
                    _this.setState({ isModalMenuOpen: !_this.state.isModalMenuOpen });
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        };
        // We need a global onKeyDown event when we are in the move mode so that we can
        // handle the key presses and the components inside the modal do not get the events
        _this._onKeyDown = function (event) {
            if (event.altKey && event.ctrlKey && event.keyCode === KeyCodes.space) {
                // CTRL + ALT + SPACE is handled during keyUp
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            if (_this.state.isModalMenuOpen && (event.altKey || event.keyCode === KeyCodes.escape)) {
                _this.setState({ isModalMenuOpen: false });
            }
            if (_this.state.isInKeyboardMoveMode && (event.keyCode === KeyCodes.escape || event.keyCode === KeyCodes.enter)) {
                _this.setState({ isInKeyboardMoveMode: false });
                event.preventDefault();
                event.stopPropagation();
            }
            if (_this.state.isInKeyboardMoveMode) {
                var handledEvent = true;
                var delta = _this._getMoveDelta(event);
                switch (event.keyCode) {
                    /* eslint-disable no-fallthrough */
                    case KeyCodes.escape:
                        _this.setState({ x: _this._lastSetX, y: _this._lastSetY });
                    case KeyCodes.enter: {
                        // TODO: determine if fallthrough was intentional
                        /* eslint-enable no-fallthrough */
                        _this._lastSetX = 0;
                        _this._lastSetY = 0;
                        _this.setState({ isInKeyboardMoveMode: false });
                        break;
                    }
                    case KeyCodes.up: {
                        _this.setState({
                            y: _this._getClampedPositionY(_this.state.y - delta),
                        });
                        break;
                    }
                    case KeyCodes.down: {
                        _this.setState({
                            y: _this._getClampedPositionY(_this.state.y + delta),
                        });
                        break;
                    }
                    case KeyCodes.left: {
                        _this.setState({
                            x: _this._getClampedPositionX(_this.state.x - delta),
                        });
                        break;
                    }
                    case KeyCodes.right: {
                        _this.setState({
                            x: _this._getClampedPositionX(_this.state.x + delta),
                        });
                        break;
                    }
                    default: {
                        handledEvent = false;
                    }
                }
                if (handledEvent) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        };
        _this._onEnterKeyboardMoveMode = function () {
            _this._lastSetX = _this.state.x;
            _this._lastSetY = _this.state.y;
            _this.setState({ isInKeyboardMoveMode: true, isModalMenuOpen: false });
            _this._events.on(window, 'keydown', _this._onKeyDown, true /* useCapture */);
        };
        _this._onExitKeyboardMoveMode = function () {
            _this._lastSetX = 0;
            _this._lastSetY = 0;
            _this.setState({ isInKeyboardMoveMode: false });
            _this._events.off(window, 'keydown', _this._onKeyDown, true /* useCapture */);
        };
        _this._registerForKeyUp = function () {
            if (!_this._hasRegisteredKeyUp) {
                _this._events.on(window, 'keyup', _this._onKeyUp, true /* useCapture */);
                _this._hasRegisteredKeyUp = true;
            }
        };
        _this._async = new Async(_this);
        _this._events = new EventGroup(_this);
        initializeComponentRef(_this);
        warnDeprecations(COMPONENT_NAME, props, {
            onLayerDidMount: 'layerProps.onLayerDidMount',
        });
        _this.state = {
            id: getId('Modal'),
            isOpen: props.isOpen,
            isVisible: props.isOpen,
            hasBeenOpened: props.isOpen,
            x: 0,
            y: 0,
        };
        _this._lastSetX = 0;
        _this._lastSetY = 0;
        var _a = _this.props.allowTouchBodyScroll, allowTouchBodyScroll = _a === void 0 ? false : _a;
        _this._allowTouchBodyScroll = allowTouchBodyScroll;
        return _this;
    }
    ModalBase.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
        clearTimeout(this._onModalCloseTimer);
        // Opening the dialog
        if (newProps.isOpen) {
            if (!this.state.isOpen) {
                // First Open
                this.setState({
                    isOpen: true,
                });
                // Add a keyUp handler for all key up events when the dialog is open
                if (newProps.dragOptions) {
                    this._registerForKeyUp();
                }
            }
            else {
                // Modal has been opened
                // Reopen during closing
                this.setState({
                    hasBeenOpened: true,
                    isVisible: true,
                });
                if (newProps.topOffsetFixed) {
                    var dialogMain = document.getElementsByClassName('ms-Dialog-main');
                    var modalRectangle = void 0;
                    if (dialogMain.length > 0) {
                        modalRectangle = dialogMain[0].getBoundingClientRect();
                        this.setState({
                            modalRectangleTop: modalRectangle.top,
                        });
                    }
                }
            }
        }
        // Closing the dialog
        if (!newProps.isOpen && this.state.isOpen) {
            this._onModalCloseTimer = this._async.setTimeout(this._onModalClose, parseFloat(animationDuration) * 1000);
            this.setState({
                isVisible: false,
            });
        }
    };
    ModalBase.prototype.componentDidMount = function () {
        // Not all modals show just by updating their props. Some only render when they are mounted and pass in
        // isOpen as true. We need to add the keyUp handler in componentDidMount if we are in that case.
        if (this.state.isOpen && this.state.isVisible) {
            this._registerForKeyUp();
            this._registerInitialModalPosition();
        }
    };
    ModalBase.prototype.componentDidUpdate = function (prevProps, prevState) {
        var _this = this;
        if (!prevProps.isOpen && !prevState.isVisible) {
            this.setState({
                isVisible: true,
            });
        }
        if (!prevProps.isOpen && this.props.isOpen) {
            requestAnimationFrame(function () { return setTimeout(_this._registerInitialModalPosition, 0); });
        }
    };
    ModalBase.prototype.componentWillUnmount = function () {
        this._async.dispose();
        this._events.dispose();
    };
    ModalBase.prototype.render = function () {
        var _a = this.props, className = _a.className, containerClassName = _a.containerClassName, scrollableContentClassName = _a.scrollableContentClassName, elementToFocusOnDismiss = _a.elementToFocusOnDismiss, firstFocusableSelector = _a.firstFocusableSelector, forceFocusInsideTrap = _a.forceFocusInsideTrap, ignoreExternalFocusing = _a.ignoreExternalFocusing, isBlocking = _a.isBlocking, isClickableOutsideFocusTrap = _a.isClickableOutsideFocusTrap, isDarkOverlay = _a.isDarkOverlay, onDismiss = _a.onDismiss, layerProps = _a.layerProps, overlay = _a.overlay, responsiveMode = _a.responsiveMode, titleAriaId = _a.titleAriaId, styles = _a.styles, subtitleAriaId = _a.subtitleAriaId, theme = _a.theme, topOffsetFixed = _a.topOffsetFixed, 
        // eslint-disable-next-line deprecation/deprecation
        onLayerDidMount = _a.onLayerDidMount, isModeless = _a.isModeless, dragOptions = _a.dragOptions, enableAriaHiddenSiblings = _a.enableAriaHiddenSiblings;
        var _b = this.state, isOpen = _b.isOpen, isVisible = _b.isVisible, hasBeenOpened = _b.hasBeenOpened, modalRectangleTop = _b.modalRectangleTop, x = _b.x, y = _b.y, isInKeyboardMoveMode = _b.isInKeyboardMoveMode;
        if (!isOpen) {
            return null;
        }
        var layerClassName = layerProps === undefined ? '' : layerProps.className;
        var classNames = getClassNames(styles, {
            theme: theme,
            className: className,
            containerClassName: containerClassName,
            scrollableContentClassName: scrollableContentClassName,
            isOpen: isOpen,
            isVisible: isVisible,
            hasBeenOpened: hasBeenOpened,
            modalRectangleTop: modalRectangleTop,
            topOffsetFixed: topOffsetFixed,
            isModeless: isModeless,
            layerClassName: layerClassName,
            isDefaultDragHandle: dragOptions && !dragOptions.dragHandleSelector,
        });
        var mergedLayerProps = __assign(__assign(__assign({}, DefaultLayerProps), this.props.layerProps), { onLayerDidMount: layerProps && layerProps.onLayerDidMount ? layerProps.onLayerDidMount : onLayerDidMount, insertFirst: isModeless, className: classNames.layer });
        var modalContent = (React.createElement(FocusTrapZone, { "data-id": this.state.id, componentRef: this._focusTrapZone, className: classNames.main, elementToFocusOnDismiss: elementToFocusOnDismiss, isClickableOutsideFocusTrap: isModeless || isClickableOutsideFocusTrap || !isBlocking, ignoreExternalFocusing: ignoreExternalFocusing, forceFocusInsideTrap: isModeless ? !isModeless : forceFocusInsideTrap, firstFocusableSelector: firstFocusableSelector, focusPreviouslyFocusedInnerElement: true, onBlur: isInKeyboardMoveMode ? this._onExitKeyboardMoveMode : undefined, enableAriaHiddenSiblings: enableAriaHiddenSiblings },
            dragOptions && isInKeyboardMoveMode && (React.createElement("div", { className: classNames.keyboardMoveIconContainer }, dragOptions.keyboardMoveIconProps ? (React.createElement(Icon, __assign({}, dragOptions.keyboardMoveIconProps))) : (React.createElement(Icon, { iconName: "move", className: classNames.keyboardMoveIcon })))),
            React.createElement("div", { ref: this._allowScrollOnModal, className: classNames.scrollableContent, "data-is-scrollable": true },
                dragOptions && this.state.isModalMenuOpen && (React.createElement(dragOptions.menu, { items: [
                        { key: 'move', text: dragOptions.moveMenuItemText, onClick: this._onEnterKeyboardMoveMode },
                        { key: 'close', text: dragOptions.closeMenuItemText, onClick: this._onModalClose },
                    ], onDismiss: this._onModalContextMenuClose, alignTargetEdge: true, coverTarget: true, directionalHint: DirectionalHint.topLeftEdge, directionalHintFixed: true, shouldFocusOnMount: true, target: this._scrollableContent })),
                this.props.children)));
        // @temp tuatology - Will adjust this to be a panel at certain breakpoints
        if (responsiveMode >= ResponsiveMode.small) {
            return (React.createElement(Layer, __assign({}, mergedLayerProps),
                React.createElement(Popup, { role: isModeless || !isBlocking ? 'dialog' : 'alertdialog', "aria-modal": !isModeless, ariaLabelledBy: titleAriaId, ariaDescribedBy: subtitleAriaId, onDismiss: onDismiss, shouldRestoreFocus: !ignoreExternalFocusing },
                    React.createElement("div", { className: classNames.root, role: !isModeless ? 'document' : undefined },
                        !isModeless && (React.createElement(Overlay, __assign({ isDarkThemed: isDarkOverlay, onClick: isBlocking ? undefined : onDismiss, allowTouchBodyScroll: this._allowTouchBodyScroll }, overlay))),
                        dragOptions ? (React.createElement(DraggableZone, { handleSelector: dragOptions.dragHandleSelector || "." + classNames.main.split(' ')[0], preventDragSelector: "button", onStart: this._onDragStart, onDragChange: this._onDrag, onStop: this._onDragStop, position: { x: x, y: y } }, modalContent)) : (modalContent)))));
        }
        return null;
    };
    ModalBase.prototype.focus = function () {
        if (this._focusTrapZone.current) {
            this._focusTrapZone.current.focus();
        }
    };
    /**
     * Clamps the position coordinates to the maximum/minimum value specified in props
     */
    ModalBase.prototype._getClampedPosition = function (position) {
        if (!this.props.dragOptions || !this.props.dragOptions.keepInBounds) {
            return position;
        }
        return { x: this._getClampedPositionX(position.x), y: this._getClampedPositionY(position.y) };
    };
    ModalBase.prototype._getClampedPositionY = function (y) {
        var minPosition = this._minClampedPosition;
        var maxPosition = this._maxClampedPosition;
        if (minPosition) {
            y = Math.max(minPosition.y, y);
        }
        if (maxPosition) {
            y = Math.min(maxPosition.y, y);
        }
        return y;
    };
    ModalBase.prototype._getClampedPositionX = function (x) {
        var minPosition = this._minClampedPosition;
        var maxPosition = this._maxClampedPosition;
        if (minPosition) {
            x = Math.max(minPosition.x, x);
        }
        if (maxPosition) {
            x = Math.min(maxPosition.x, x);
        }
        return x;
    };
    ModalBase.prototype._getMoveDelta = function (event) {
        var delta = 10;
        if (event.shiftKey) {
            if (!event.ctrlKey) {
                delta = 50;
            }
        }
        else if (event.ctrlKey) {
            delta = 1;
        }
        return delta;
    };
    ModalBase.defaultProps = {
        isOpen: false,
        isDarkOverlay: true,
        isBlocking: false,
        className: '',
        containerClassName: '',
    };
    ModalBase = __decorate([
        withResponsiveMode
    ], ModalBase);
    return ModalBase;
}(React.Component));
export { ModalBase };
//# sourceMappingURL=Modal.base.js.map