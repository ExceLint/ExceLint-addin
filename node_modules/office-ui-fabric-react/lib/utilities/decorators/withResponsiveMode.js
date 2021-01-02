import { __assign, __extends } from "tslib";
import * as React from 'react';
import { BaseDecorator } from './BaseDecorator';
import { getWindow, hoistStatics, EventGroup } from '../../Utilities';
import { WindowContext } from '../../WindowProvider';
export var ResponsiveMode;
(function (ResponsiveMode) {
    ResponsiveMode[ResponsiveMode["small"] = 0] = "small";
    ResponsiveMode[ResponsiveMode["medium"] = 1] = "medium";
    ResponsiveMode[ResponsiveMode["large"] = 2] = "large";
    ResponsiveMode[ResponsiveMode["xLarge"] = 3] = "xLarge";
    ResponsiveMode[ResponsiveMode["xxLarge"] = 4] = "xxLarge";
    ResponsiveMode[ResponsiveMode["xxxLarge"] = 5] = "xxxLarge";
    ResponsiveMode[ResponsiveMode["unknown"] = 999] = "unknown";
})(ResponsiveMode || (ResponsiveMode = {}));
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
export function setResponsiveMode(responsiveMode) {
    _defaultMode = responsiveMode;
}
/**
 * Initializes the responsive mode to the current window size. This can be used to avoid
 * a re-render during first component mount since the window would otherwise not be measured
 * until after mounting.
 */
export function initializeResponsiveMode(element) {
    if (typeof window !== 'undefined') {
        var currentWindow = (element && getWindow(element)) || window;
        getResponsiveMode(currentWindow);
    }
}
export function getInitialResponsiveMode() {
    return _defaultMode || _lastMode || ResponsiveMode.large;
}
export function withResponsiveMode(ComposedComponent) {
    var _a;
    var resultClass = (_a = /** @class */ (function (_super) {
            __extends(WithResponsiveMode, _super);
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
                _this._events = new EventGroup(_this);
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
                return responsiveMode === ResponsiveMode.unknown ? null : (React.createElement(ComposedComponent, __assign({ ref: this._updateComposedComponentRef, responsiveMode: responsiveMode }, this.props)));
            };
            return WithResponsiveMode;
        }(BaseDecorator)),
        _a.contextType = WindowContext,
        _a);
    return hoistStatics(ComposedComponent, resultClass);
}
export function getResponsiveMode(currentWindow) {
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
//# sourceMappingURL=withResponsiveMode.js.map