"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var ShimmerElementsGroup_1 = require("./ShimmerElementsGroup/ShimmerElementsGroup");
var TRANSITION_ANIMATION_INTERVAL = 200; /* ms */
var getClassNames = Utilities_1.classNamesFunction();
/**
 * {@docCategory Shimmer}
 */
var ShimmerBase = /** @class */ (function (_super) {
    tslib_1.__extends(ShimmerBase, _super);
    function ShimmerBase(props) {
        var _this = _super.call(this, props) || this;
        Utilities_1.initializeComponentRef(_this);
        _this.state = {
            contentLoaded: props.isDataLoaded,
        };
        _this._async = new Utilities_1.Async(_this);
        return _this;
    }
    ShimmerBase.prototype.componentDidUpdate = function (prevProps) {
        var _this = this;
        var isDataLoaded = this.props.isDataLoaded;
        if (isDataLoaded !== prevProps.isDataLoaded) {
            this._async.clearTimeout(this._lastTimeoutId);
            // Removing the shimmerWrapper div from the DOM only after the fade out animation completed.
            if (isDataLoaded) {
                this._lastTimeoutId = this._async.setTimeout(function () {
                    _this.setState({
                        contentLoaded: isDataLoaded,
                    });
                }, TRANSITION_ANIMATION_INTERVAL);
            }
            else {
                this.setState({
                    contentLoaded: isDataLoaded,
                });
            }
        }
    };
    ShimmerBase.prototype.componentWillUnmount = function () {
        this._async.dispose();
    };
    ShimmerBase.prototype.render = function () {
        var _a = this.props, styles = _a.styles, shimmerElements = _a.shimmerElements, children = _a.children, isDataLoaded = _a.isDataLoaded, width = _a.width, className = _a.className, customElementsGroup = _a.customElementsGroup, theme = _a.theme, ariaLabel = _a.ariaLabel, shimmerColors = _a.shimmerColors;
        var contentLoaded = this.state.contentLoaded;
        this._classNames = getClassNames(styles, {
            theme: theme,
            isDataLoaded: isDataLoaded,
            className: className,
            transitionAnimationInterval: TRANSITION_ANIMATION_INTERVAL,
            shimmerColor: shimmerColors && shimmerColors.shimmer,
            shimmerWaveColor: shimmerColors && shimmerColors.shimmerWave,
        });
        var divProps = Utilities_1.getNativeProps(this.props, Utilities_1.divProperties);
        return (React.createElement("div", tslib_1.__assign({}, divProps, { className: this._classNames.root }),
            !contentLoaded && (React.createElement("div", { style: { width: width ? width : '100%' }, className: this._classNames.shimmerWrapper },
                React.createElement("div", { className: this._classNames.shimmerGradient }),
                customElementsGroup ? (customElementsGroup) : (React.createElement(ShimmerElementsGroup_1.ShimmerElementsGroup, { shimmerElements: shimmerElements, backgroundColor: shimmerColors && shimmerColors.background })))),
            children && React.createElement("div", { className: this._classNames.dataWrapper }, children),
            ariaLabel && !isDataLoaded && (React.createElement("div", { role: "status", "aria-live": "polite" },
                React.createElement(Utilities_1.DelayedRender, null,
                    React.createElement("div", { className: this._classNames.screenReaderText }, ariaLabel))))));
    };
    ShimmerBase.defaultProps = {
        isDataLoaded: false,
    };
    return ShimmerBase;
}(React.Component));
exports.ShimmerBase = ShimmerBase;
//# sourceMappingURL=Shimmer.base.js.map