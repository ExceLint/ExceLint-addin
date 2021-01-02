import { __assign, __extends } from "tslib";
import * as React from 'react';
import { hiddenContentStyle } from '../../Styling';
import { initializeComponentRef, Async, divProperties, getNativeProps, getId, assign, hasOverflow, portalContainsElement, classNamesFunction, KeyCodes, } from '../../Utilities';
import { TooltipOverflowMode, } from './TooltipHost.types';
import { Tooltip } from './Tooltip';
import { TooltipDelay } from './Tooltip.types';
var getClassNames = classNamesFunction();
var TooltipHostBase = /** @class */ (function (_super) {
    __extends(TooltipHostBase, _super);
    // Constructor
    function TooltipHostBase(props) {
        var _this = _super.call(this, props) || this;
        // The wrapping div that gets the hover events
        _this._tooltipHost = React.createRef();
        _this._defaultTooltipId = getId('tooltip');
        _this.show = function () {
            _this._toggleTooltip(true);
        };
        _this.dismiss = function () {
            _this._hideTooltip();
        };
        _this._getTargetElement = function () {
            if (!_this._tooltipHost.current) {
                return undefined;
            }
            var overflowMode = _this.props.overflowMode;
            // Select target element based on overflow mode. For parent mode, you want to position the tooltip relative
            // to the parent element, otherwise it might look off.
            if (overflowMode !== undefined) {
                switch (overflowMode) {
                    case TooltipOverflowMode.Parent:
                        return _this._tooltipHost.current.parentElement;
                    case TooltipOverflowMode.Self:
                        return _this._tooltipHost.current;
                }
            }
            return _this._tooltipHost.current;
        };
        // Show Tooltip
        _this._onTooltipMouseEnter = function (ev) {
            var _a = _this.props, overflowMode = _a.overflowMode, delay = _a.delay;
            if (TooltipHostBase._currentVisibleTooltip && TooltipHostBase._currentVisibleTooltip !== _this) {
                TooltipHostBase._currentVisibleTooltip.dismiss();
            }
            TooltipHostBase._currentVisibleTooltip = _this;
            if (overflowMode !== undefined) {
                var overflowElement = _this._getTargetElement();
                if (overflowElement && !hasOverflow(overflowElement)) {
                    return;
                }
            }
            if (ev.target && portalContainsElement(ev.target, _this._getTargetElement())) {
                // Do not show tooltip when target is inside a portal relative to TooltipHost.
                return;
            }
            _this._clearDismissTimer();
            _this._clearOpenTimer();
            if (delay !== TooltipDelay.zero) {
                _this.setState({ isAriaPlaceholderRendered: true });
                var delayTime = _this._getDelayTime(delay); // non-null assertion because we set it in `defaultProps`
                _this._openTimerId = _this._async.setTimeout(function () {
                    _this._toggleTooltip(true);
                }, delayTime);
            }
            else {
                _this._toggleTooltip(true);
            }
        };
        // Hide Tooltip
        _this._onTooltipMouseLeave = function (ev) {
            var closeDelay = _this.props.closeDelay;
            _this._clearDismissTimer();
            _this._clearOpenTimer();
            if (closeDelay) {
                _this._dismissTimerId = _this._async.setTimeout(function () {
                    _this._toggleTooltip(false);
                }, closeDelay);
            }
            else {
                _this._toggleTooltip(false);
            }
            if (TooltipHostBase._currentVisibleTooltip === _this) {
                TooltipHostBase._currentVisibleTooltip = undefined;
            }
        };
        _this._onTooltipKeyDown = function (ev) {
            if ((ev.which === KeyCodes.escape || ev.ctrlKey) && _this.state.isTooltipVisible) {
                _this._hideTooltip();
                ev.stopPropagation();
            }
        };
        _this._clearDismissTimer = function () {
            _this._async.clearTimeout(_this._dismissTimerId);
        };
        _this._clearOpenTimer = function () {
            _this._async.clearTimeout(_this._openTimerId);
        };
        // Hide Tooltip
        _this._hideTooltip = function () {
            _this._clearOpenTimer();
            _this._clearDismissTimer();
            _this._toggleTooltip(false);
        };
        _this._toggleTooltip = function (isTooltipVisible) {
            if (_this.state.isTooltipVisible !== isTooltipVisible) {
                _this.setState({ isAriaPlaceholderRendered: false, isTooltipVisible: isTooltipVisible }, function () { return _this.props.onTooltipToggle && _this.props.onTooltipToggle(isTooltipVisible); });
            }
        };
        _this._getDelayTime = function (delay) {
            switch (delay) {
                case TooltipDelay.medium:
                    return 300;
                case TooltipDelay.long:
                    return 500;
                default:
                    return 0;
            }
        };
        initializeComponentRef(_this);
        _this.state = {
            isAriaPlaceholderRendered: false,
            isTooltipVisible: false,
        };
        _this._async = new Async(_this);
        return _this;
    }
    // Render
    TooltipHostBase.prototype.render = function () {
        var _a = this.props, calloutProps = _a.calloutProps, children = _a.children, content = _a.content, directionalHint = _a.directionalHint, directionalHintForRTL = _a.directionalHintForRTL, className = _a.hostClassName, id = _a.id, _b = _a.setAriaDescribedBy, setAriaDescribedBy = _b === void 0 ? true : _b, tooltipProps = _a.tooltipProps, styles = _a.styles, theme = _a.theme;
        this._classNames = getClassNames(styles, {
            theme: theme,
            className: className,
        });
        var _c = this.state, isAriaPlaceholderRendered = _c.isAriaPlaceholderRendered, isTooltipVisible = _c.isTooltipVisible;
        var tooltipId = id || this._defaultTooltipId;
        var isContentPresent = !!(content ||
            (tooltipProps && tooltipProps.onRenderContent && tooltipProps.onRenderContent()));
        var showTooltip = isTooltipVisible && isContentPresent;
        var ariaDescribedBy = setAriaDescribedBy && isTooltipVisible && isContentPresent ? tooltipId : undefined;
        return (React.createElement("div", __assign({ className: this._classNames.root, ref: this._tooltipHost }, { onFocusCapture: this._onTooltipMouseEnter }, { onBlurCapture: this._hideTooltip }, { onMouseEnter: this._onTooltipMouseEnter, onMouseLeave: this._onTooltipMouseLeave, onKeyDown: this._onTooltipKeyDown, "aria-describedby": ariaDescribedBy }),
            children,
            showTooltip && (React.createElement(Tooltip, __assign({ id: tooltipId, content: content, targetElement: this._getTargetElement(), directionalHint: directionalHint, directionalHintForRTL: directionalHintForRTL, calloutProps: assign({}, calloutProps, {
                    onDismiss: this._hideTooltip,
                    onMouseEnter: this._onTooltipMouseEnter,
                    onMouseLeave: this._onTooltipMouseLeave,
                }), onMouseEnter: this._onTooltipMouseEnter, onMouseLeave: this._onTooltipMouseLeave }, getNativeProps(this.props, divProperties), tooltipProps))),
            isAriaPlaceholderRendered && (React.createElement("div", { id: tooltipId, style: hiddenContentStyle }, content))));
    };
    TooltipHostBase.prototype.componentWillUnmount = function () {
        if (TooltipHostBase._currentVisibleTooltip && TooltipHostBase._currentVisibleTooltip === this) {
            TooltipHostBase._currentVisibleTooltip = undefined;
        }
        this._async.dispose();
    };
    TooltipHostBase.defaultProps = {
        delay: TooltipDelay.medium,
    };
    return TooltipHostBase;
}(React.Component));
export { TooltipHostBase };
//# sourceMappingURL=TooltipHost.base.js.map