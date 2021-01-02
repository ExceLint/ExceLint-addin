"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var BaseDecorator_1 = require("./BaseDecorator");
var Utilities_1 = require("../../Utilities");
var WindowProvider_1 = require("../../WindowProvider");
var ResponsiveMode;
(function (ResponsiveMode) {
    ResponsiveMode[ResponsiveMode["small"] = 0] = "small";
    ResponsiveMode[ResponsiveMode["medium"] = 1] = "medium";
    ResponsiveMode[ResponsiveMode["large"] = 2] = "large";
    ResponsiveMode[ResponsiveMode["xLarge"] = 3] = "xLarge";
    ResponsiveMode[ResponsiveMode["xxLarge"] = 4] = "xxLarge";
    ResponsiveMode[ResponsiveMode["xxxLarge"] = 5] = "xxxLarge";
    ResponsiveMode[ResponsiveMode["unknown"] = 999] = "unknown";
})(ResponsiveMode = exports.ResponsiveMode || (exports.ResponsiveMode = {}));
var RESPONSIVE_MAX_CONSTRAINT = [479, 639, 1023, 1365, 1919, 99999999];
/**
 * User specified mode to default to, useful for server side rendering scenarios.
 */
var _defaultMode;
/**
 * Tracking the last mode we successfully rendered, which allows us to
 * paint initial renders with the correct size.
 */
var _lastMode;
/**
 * Allows a server rendered scenario to provide a default responsive mode.
 */
function setResponsiveMode(responsiveMode) {
    _defaultMode = responsiveMode;
}
exports.setResponsiveMode = setResponsiveMode;
/**
 * Initializes the responsive mode to the current window size. This can be used to avoid
 * a re-render during first component mount since the window would otherwise not be measured
 * until after mounting.
 */
function initializeResponsiveMode(element) {
    if (typeof window !== 'undefined') {
        var currentWindow = (element && Utilities_1.getWindow(element)) || window;
        getResponsiveMode(currentWindow);
    }
}
exports.initializeResponsiveMode = initializeResponsiveMode;
function getInitialResponsiveMode() {
    return _defaultMode || _lastMode || ResponsiveMode.large;
}
exports.getInitialResponsiveMode = getInitialResponsiveMode;
function withResponsiveMode(ComposedComponent) {
    var _a;
    var resultClass = (_a = /** @class */ (function (_super) {
            tslib_1.__extends(WithResponsiveMode, _super);
            function WithResponsiveMode(props) {
                var _this = _super.call(this, props) || this;
                _this._onResize = function () {
                    var responsiveMode = getResponsiveMode(_this.context.window);
                    if (responsiveMode !== _this.state.responsiveMode) {
                        _this.setState({
                            responsiveMode: responsiveMode,
                        });
                    }
                };
                _this._events = new Utilities_1.EventGroup(_this);
                _this._updateComposedComponentRef = _this._updateComposedComponentRef.bind(_this);
                _this.state = {
                    responsiveMode: getInitialResponsiveMode(),
                };
                return _this;
            }
            WithResponsiveMode.prototype.componentDidMount = function () {
                this._events.on(this.context.window, 'resize', this._onResize);
                this._onResize();
            };
            WithResponsiveMode.prototype.componentWillUnmount = function () {
                this._events.dispose();
            };
            WithResponsiveMode.prototype.render = function () {
                var responsiveMode = this.state.responsiveMode;
                return responsiveMode === ResponsiveMode.unknown ? null : (React.createElement(ComposedComponent, tslib_1.__assign({ ref: this._updateComposedComponentRef, responsiveMode: responsiveMode }, this.props)));
            };
            return WithResponsiveMode;
        }(BaseDecorator_1.BaseDecorator)),
        _a.contextType = WindowProvider_1.WindowContext,
        _a);
    return Utilities_1.hoistStatics(ComposedComponent, resultClass);
}
exports.withResponsiveMode = withResponsiveMode;
function getResponsiveMode(currentWindow) {
    var responsiveMode = ResponsiveMode.small;
    if (currentWindow) {
        try {
            while (currentWindow.innerWidth > RESPONSIVE_MAX_CONSTRAINT[responsiveMode]) {
                responsiveMode++;
            }
        }
        catch (e) {
            // Return a best effort result in cases where we're in the browser but it throws on getting innerWidth.
            responsiveMode = getInitialResponsiveMode();
        }
        // Tracking last mode just gives us a better default in future renders,
        // which avoids starting with the wrong value if we've measured once.
        _lastMode = responsiveMode;
    }
    else {
        if (_defaultMode !== undefined) {
            responsiveMode = _defaultMode;
        }
        else {
            throw new Error('Content was rendered in a server environment without providing a default responsive mode. ' +
                'Call setResponsiveMode to define what the responsive mode is.');
        }
    }
    return responsiveMode;
}
exports.getResponsiveMode = getResponsiveMode;
//# sourceMappingURL=withResponsiveMode.js.map