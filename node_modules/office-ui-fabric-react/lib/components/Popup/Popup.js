import { __assign, __extends } from "tslib";
import * as React from 'react';
import { Async, KeyCodes, divProperties, doesElementContainFocus, getDocument, getNativeProps, on, getWindow, elementContains, } from '../../Utilities';
/**
 * This adds accessibility to Dialog and Panel controls
 */
var Popup = /** @class */ (function (_super) {
    __extends(Popup, _super);
    function Popup(props) {
        var _this = _super.call(this, props) || this;
        _this._root = React.createRef();
        _this._disposables = [];
        _this._onKeyDown = function (ev) {
            switch (ev.which) {
                case KeyCodes.escape:
                    if (_this.props.onDismiss) {
                        _this.props.onDismiss(ev);
                        ev.preventDefault();
                        ev.stopPropagation();
                    }
                    break;
            }
        };
        _this._onFocus = function () {
            _this._containsFocus = true;
        };
        _this._onBlur = function (ev) {
            /** The popup should update this._containsFocus when:
             * relatedTarget exists AND
             * the relatedTarget is not contained within the popup.
             * If the relatedTarget is within the popup, that means the popup still has focus
             * and focused moved from one element to another within the popup.
             * If relatedTarget is undefined or null that usually means that a
             * keyboard event occured and focus didn't change
             */
            if (_this._root.current &&
                ev.relatedTarget &&
                !elementContains(_this._root.current, ev.relatedTarget)) {
                _this._containsFocus = false;
            }
        };
        _this._async = new Async(_this);
        _this.state = { needsVerticalScrollBar: false };
        return _this;
    }
    Popup.prototype.UNSAFE_componentWillMount = function () {
        this._originalFocusedElement = getDocument().activeElement;
    };
    Popup.prototype.componentDidMount = function () {
        if (this._root.current) {
            this._disposables.push(on(this._root.current, 'focus', this._onFocus, true), on(this._root.current, 'blur', this._onBlur, true));
            var currentWindow = getWindow(this._root.current);
            if (currentWindow) {
                this._disposables.push(on(currentWindow, 'keydown', this._onKeyDown));
            }
            if (doesElementContainFocus(this._root.current)) {
                this._containsFocus = true;
            }
        }
        this._updateScrollBarAsync();
    };
    Popup.prototype.componentDidUpdate = function () {
        this._updateScrollBarAsync();
        this._async.dispose();
    };
    Popup.prototype.componentWillUnmount = function () {
        var _a;
        this._disposables.forEach(function (dispose) { return dispose(); });
        // eslint-disable-next-line deprecation/deprecation
        if (this.props.shouldRestoreFocus) {
            var _b = this.props.onRestoreFocus, onRestoreFocus = _b === void 0 ? defaultFocusRestorer : _b;
            onRestoreFocus({
                originalElement: this._originalFocusedElement,
                containsFocus: this._containsFocus,
                documentContainsFocus: ((_a = getDocument()) === null || _a === void 0 ? void 0 : _a.hasFocus()) || false,
            });
        }
        // De-reference DOM Node to avoid retainment via transpiled closure of _onKeyDown
        delete this._originalFocusedElement;
    };
    Popup.prototype.render = function () {
        var _a = this.props, role = _a.role, className = _a.className, ariaLabel = _a.ariaLabel, ariaLabelledBy = _a.ariaLabelledBy, ariaDescribedBy = _a.ariaDescribedBy, style = _a.style;
        return (React.createElement("div", __assign({ ref: this._root }, getNativeProps(this.props, divProperties), { className: className, role: role, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, "aria-describedby": ariaDescribedBy, onKeyDown: this._onKeyDown, style: __assign({ overflowY: this.state.needsVerticalScrollBar ? 'scroll' : undefined, outline: 'none' }, style) }), this.props.children));
    };
    Popup.prototype._updateScrollBarAsync = function () {
        var _this = this;
        this._async.requestAnimationFrame(function () {
            _this._getScrollBar();
        });
    };
    Popup.prototype._getScrollBar = function () {
        // If overflowY is overriden, don't waste time calculating whether the scrollbar is necessary.
        if (this.props.style && this.props.style.overflowY) {
            return;
        }
        var needsVerticalScrollBar = false;
        if (this._root && this._root.current && this._root.current.firstElementChild) {
            // ClientHeight returns the client height of an element rounded to an
            // integer. On some browsers at different zoom levels this rounding
            // can generate different results for the root container and child even
            // though they are the same height. This causes us to show a scroll bar
            // when not needed. Ideally we would use BoundingClientRect().height
            // instead however seems that the API is 90% slower than using ClientHeight.
            // Therefore instead we will calculate the difference between heights and
            // allow for a 1px difference to still be considered ok and not show the
            // scroll bar.
            var rootHeight = this._root.current.clientHeight;
            var firstChildHeight = this._root.current.firstElementChild.clientHeight;
            if (rootHeight > 0 && firstChildHeight > rootHeight) {
                needsVerticalScrollBar = firstChildHeight - rootHeight > 1;
            }
        }
        if (this.state.needsVerticalScrollBar !== needsVerticalScrollBar) {
            this.setState({
                needsVerticalScrollBar: needsVerticalScrollBar,
            });
        }
    };
    Popup.defaultProps = {
        shouldRestoreFocus: true,
    };
    return Popup;
}(React.Component));
export { Popup };
function defaultFocusRestorer(options) {
    var originalElement = options.originalElement, containsFocus = options.containsFocus;
    if (originalElement && containsFocus && originalElement !== window) {
        // Make sure that the focus method actually exists
        // In some cases the object might exist but not be a real element.
        // This is primarily for IE 11 and should be removed once IE 11 is no longer in use.
        if (originalElement.focus) {
            originalElement.focus();
        }
    }
}
//# sourceMappingURL=Popup.js.map