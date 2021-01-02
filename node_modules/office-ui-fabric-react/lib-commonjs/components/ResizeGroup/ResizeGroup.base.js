"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var ResizeGroup_types_1 = require("./ResizeGroup.types");
var utilities_1 = require("@uifabric/utilities");
var RESIZE_DELAY = 16;
/**
 * Returns a simple object is able to store measurements with a given key.
 */
exports.getMeasurementCache = function () {
    var measurementsCache = {};
    return {
        /**
         * Checks if the provided data has a cacheKey. If it has a cacheKey and there is a
         * corresponding entry in the measurementsCache, then it will return that value.
         * Returns undefined otherwise.
         */
        getCachedMeasurement: function (data) {
            if (data && data.cacheKey && measurementsCache.hasOwnProperty(data.cacheKey)) {
                return measurementsCache[data.cacheKey];
            }
            return undefined;
        },
        /**
         * Should be called whenever there is a new measurement associated with a given data object.
         * If the data has a cacheKey, store that measurement in the measurementsCache.
         */
        addMeasurementToCache: function (data, measurement) {
            if (data.cacheKey) {
                measurementsCache[data.cacheKey] = measurement;
            }
        },
    };
};
/**
 * Returns a function that is able to compute the next state for the ResizeGroup given the current
 * state and any measurement updates.
 */
exports.getNextResizeGroupStateProvider = function (measurementCache) {
    if (measurementCache === void 0) { measurementCache = exports.getMeasurementCache(); }
    var _measurementCache = measurementCache;
    var _containerDimension;
    /**
     * Gets the width/height of the data rendered in a hidden div.
     * @param measuredData - The data corresponding to the measurement we wish to take.
     * @param getElementToMeasureDimension - A function that returns the measurement of the rendered data.
     * Only called when the measurement is not in the cache.
     */
    function _getMeasuredDimension(measuredData, getElementToMeasureDimension) {
        var cachedDimension = _measurementCache.getCachedMeasurement(measuredData);
        if (cachedDimension !== undefined) {
            return cachedDimension;
        }
        var measuredDimension = getElementToMeasureDimension();
        _measurementCache.addMeasurementToCache(measuredData, measuredDimension);
        return measuredDimension;
    }
    /**
     * Will get the next IResizeGroupState based on the current data while trying to shrink contents
     * to fit in the container.
     * @param data - The initial data point to start measuring.
     * @param onReduceData - Function that transforms the data into something that should render with less width/height.
     * @param getElementToMeasureDimension - A function that returns the measurement of the rendered data.
     * Only called when the measurement is not in the cache.
     */
    function _shrinkContentsUntilTheyFit(data, onReduceData, getElementToMeasureDimension) {
        var dataToMeasure = data;
        var measuredDimension = _getMeasuredDimension(data, getElementToMeasureDimension);
        while (measuredDimension > _containerDimension) {
            var nextMeasuredData = onReduceData(dataToMeasure);
            // We don't want to get stuck in an infinite render loop when there are no more
            // scaling steps, so implementations of onReduceData should return undefined when
            // there are no more scaling states to apply.
            if (nextMeasuredData === undefined) {
                return {
                    renderedData: dataToMeasure,
                    resizeDirection: undefined,
                    dataToMeasure: undefined,
                };
            }
            measuredDimension = _measurementCache.getCachedMeasurement(nextMeasuredData);
            // If the measurement isn't in the cache, we need to rerender with some data in a hidden div
            if (measuredDimension === undefined) {
                return {
                    dataToMeasure: nextMeasuredData,
                    resizeDirection: 'shrink',
                };
            }
            dataToMeasure = nextMeasuredData;
        }
        return {
            renderedData: dataToMeasure,
            resizeDirection: undefined,
            dataToMeasure: undefined,
        };
    }
    /**
     * This function should be called when the state changes in a manner that might allow for more content to fit
     * on the screen, such as the window width/height growing.
     * @param data - The initial data point to start measuring.
     * @param onGrowData - Function that transforms the data into something that may take up more space when rendering.
     * @param getElementToMeasureDimension - A function that returns the measurement of the rendered data.
     * Only called when the measurement is not in the cache.
     */
    function _growDataUntilItDoesNotFit(data, onGrowData, getElementToMeasureDimension, onReduceData) {
        var dataToMeasure = data;
        var measuredDimension = _getMeasuredDimension(data, getElementToMeasureDimension);
        while (measuredDimension < _containerDimension) {
            var nextMeasuredData = onGrowData(dataToMeasure);
            // We don't want to get stuck in an infinite render loop when there are no more
            // scaling steps, so implementations of onGrowData should return undefined when
            // there are no more scaling states to apply.
            if (nextMeasuredData === undefined) {
                return {
                    renderedData: dataToMeasure,
                    resizeDirection: undefined,
                    dataToMeasure: undefined,
                };
            }
            measuredDimension = _measurementCache.getCachedMeasurement(nextMeasuredData);
            // If the measurement isn't in the cache, we need to rerender with some data in a hidden div
            if (measuredDimension === undefined) {
                return {
                    dataToMeasure: nextMeasuredData,
                };
            }
            dataToMeasure = nextMeasuredData;
        }
        // Once the loop is done, we should now shrink until the contents fit.
        return tslib_1.__assign({ resizeDirection: 'shrink' }, _shrinkContentsUntilTheyFit(dataToMeasure, onReduceData, getElementToMeasureDimension));
    }
    /**
     * Handles an update to the container width/height.
     * Should only be called when we knew the previous container width/height.
     * @param newDimension - The new width/height of the container.
     * @param fullDimensionData - The initial data passed in as a prop to resizeGroup.
     * @param renderedData - The data that was rendered prior to the container size changing.
     * @param onGrowData - Set to true if the Resize group has an onGrowData function.
     */
    function _updateContainerDimension(newDimension, fullDimensionData, renderedData, onGrowData) {
        var nextState;
        if (newDimension > _containerDimension) {
            if (onGrowData) {
                nextState = {
                    resizeDirection: 'grow',
                    dataToMeasure: onGrowData(renderedData),
                };
            }
            else {
                nextState = {
                    resizeDirection: 'shrink',
                    dataToMeasure: fullDimensionData,
                };
            }
        }
        else {
            nextState = {
                resizeDirection: 'shrink',
                dataToMeasure: renderedData,
            };
        }
        _containerDimension = newDimension;
        return tslib_1.__assign(tslib_1.__assign({}, nextState), { measureContainer: false });
    }
    function getNextState(props, currentState, getElementToMeasureDimension, newContainerDimension) {
        // If there is no new container width/height or data to measure, there is no need for a new state update
        if (newContainerDimension === undefined && currentState.dataToMeasure === undefined) {
            return undefined;
        }
        if (newContainerDimension) {
            // If we know the last container size and we rendered data at that width/height, we can do an optimized render
            if (_containerDimension && currentState.renderedData && !currentState.dataToMeasure) {
                return tslib_1.__assign(tslib_1.__assign({}, currentState), _updateContainerDimension(newContainerDimension, props.data, currentState.renderedData, props.onGrowData));
            }
            // If we are just setting the container width/height for the first time, we can't do any optimizations
            _containerDimension = newContainerDimension;
        }
        var nextState = tslib_1.__assign(tslib_1.__assign({}, currentState), { measureContainer: false });
        if (currentState.dataToMeasure) {
            if (currentState.resizeDirection === 'grow' && props.onGrowData) {
                nextState = tslib_1.__assign(tslib_1.__assign({}, nextState), _growDataUntilItDoesNotFit(currentState.dataToMeasure, props.onGrowData, getElementToMeasureDimension, props.onReduceData));
            }
            else {
                nextState = tslib_1.__assign(tslib_1.__assign({}, nextState), _shrinkContentsUntilTheyFit(currentState.dataToMeasure, props.onReduceData, getElementToMeasureDimension));
            }
        }
        return nextState;
    }
    /** Function that determines if we need to render content for measurement based on the measurement cache contents. */
    function shouldRenderDataForMeasurement(dataToMeasure) {
        if (!dataToMeasure || _measurementCache.getCachedMeasurement(dataToMeasure) !== undefined) {
            return false;
        }
        return true;
    }
    function getInitialResizeGroupState(data) {
        return {
            dataToMeasure: tslib_1.__assign({}, data),
            resizeDirection: 'grow',
            measureContainer: true,
        };
    }
    return {
        getNextState: getNextState,
        shouldRenderDataForMeasurement: shouldRenderDataForMeasurement,
        getInitialResizeGroupState: getInitialResizeGroupState,
    };
};
// Provides a context property that (if true) tells any child components that
// they are only being used for measurement purposes and will not be visible.
exports.MeasuredContext = React.createContext({ isMeasured: false });
// Styles for the hidden div used for measurement
var hiddenDivStyles = { position: 'fixed', visibility: 'hidden' };
var hiddenParentStyles = { position: 'relative' };
var COMPONENT_NAME = 'ResizeGroup';
var ResizeGroupBase = /** @class */ (function (_super) {
    tslib_1.__extends(ResizeGroupBase, _super);
    function ResizeGroupBase(props) {
        var _this = _super.call(this, props) || this;
        _this._nextResizeGroupStateProvider = exports.getNextResizeGroupStateProvider();
        // The root div which is the container inside of which we are trying to fit content.
        _this._root = React.createRef();
        // A div that can be used for the initial measurement so that we can avoid mounting a second instance
        // of the component being measured for the initial render.
        _this._initialHiddenDiv = React.createRef();
        // A hidden div that is used for mounting a new instance of the component for measurement in a hidden
        // div without unmounting the currently visible content.
        _this._updateHiddenDiv = React.createRef();
        // Tracks if any content has been rendered to the user. This enables us to do some performance optimizations
        // for the initial render.
        _this._hasRenderedContent = false;
        _this.state = _this._nextResizeGroupStateProvider.getInitialResizeGroupState(_this.props.data);
        utilities_1.initializeComponentRef(_this);
        _this._async = new Utilities_1.Async(_this);
        _this._events = new Utilities_1.EventGroup(_this);
        Utilities_1.warnDeprecations(COMPONENT_NAME, props, {
            styles: 'className',
        });
        return _this;
    }
    ResizeGroupBase.prototype.render = function () {
        var _a = this.props, className = _a.className, onRenderData = _a.onRenderData;
        var _b = this.state, dataToMeasure = _b.dataToMeasure, renderedData = _b.renderedData;
        var divProps = Utilities_1.getNativeProps(this.props, Utilities_1.divProperties, ['data']);
        var dataNeedsMeasuring = this._nextResizeGroupStateProvider.shouldRenderDataForMeasurement(dataToMeasure);
        var isInitialMeasure = !this._hasRenderedContent && dataNeedsMeasuring;
        // We only ever render the final content to the user. All measurements are done in a hidden div.
        // For the initial render, we want this to be as fast as possible, so we need to make sure that we only mount one
        // version of the component for measurement and the final render. For renders that update what is on screen, we
        // want to make sure that there are no jarring effects such as the screen flashing as we apply scaling steps for
        // measurement. In the update case, we mount a second version of the component just for measurement purposes and
        // leave the rendered content untouched until we know the next state to show to the user.
        return (React.createElement("div", tslib_1.__assign({}, divProps, { className: className, ref: this._root }),
            React.createElement("div", { style: hiddenParentStyles },
                dataNeedsMeasuring && !isInitialMeasure && (React.createElement("div", { style: hiddenDivStyles, ref: this._updateHiddenDiv },
                    React.createElement(exports.MeasuredContext.Provider, { value: { isMeasured: true } }, onRenderData(dataToMeasure)))),
                React.createElement("div", { ref: this._initialHiddenDiv, style: isInitialMeasure ? hiddenDivStyles : undefined, "data-automation-id": "visibleContent" }, isInitialMeasure ? onRenderData(dataToMeasure) : renderedData && onRenderData(renderedData)))));
    };
    ResizeGroupBase.prototype.componentDidMount = function () {
        this._afterComponentRendered(this.props.direction);
        this._events.on(window, 'resize', this._async.debounce(this._onResize, RESIZE_DELAY, { leading: true }));
    };
    ResizeGroupBase.prototype.UNSAFE_componentWillReceiveProps = function (nextProps) {
        this.setState({
            dataToMeasure: tslib_1.__assign({}, nextProps.data),
            resizeDirection: 'grow',
            // Receiving new props means the parent might rerender and the root width/height might change
            measureContainer: true,
        });
    };
    ResizeGroupBase.prototype.componentDidUpdate = function (prevProps) {
        if (this.state.renderedData) {
            this._hasRenderedContent = true;
            if (this.props.dataDidRender) {
                this.props.dataDidRender(this.state.renderedData);
            }
        }
        this._afterComponentRendered(this.props.direction);
    };
    ResizeGroupBase.prototype.componentWillUnmount = function () {
        this._async.dispose();
        this._events.dispose();
    };
    ResizeGroupBase.prototype.remeasure = function () {
        if (this._root.current) {
            this.setState({ measureContainer: true });
        }
    };
    ResizeGroupBase.prototype._afterComponentRendered = function (direction) {
        var _this = this;
        this._async.requestAnimationFrame(function () {
            var containerDimension = undefined;
            if (_this.state.measureContainer && _this._root.current) {
                var boundingRect = _this._root.current.getBoundingClientRect();
                containerDimension =
                    direction && direction === ResizeGroup_types_1.ResizeGroupDirection.vertical ? boundingRect.height : boundingRect.width;
            }
            var nextState = _this._nextResizeGroupStateProvider.getNextState(_this.props, _this.state, function () {
                var refToMeasure = !_this._hasRenderedContent ? _this._initialHiddenDiv : _this._updateHiddenDiv;
                if (!refToMeasure.current) {
                    return 0;
                }
                return direction && direction === ResizeGroup_types_1.ResizeGroupDirection.vertical
                    ? refToMeasure.current.scrollHeight
                    : refToMeasure.current.scrollWidth;
            }, containerDimension);
            if (nextState) {
                _this.setState(nextState);
            }
        }, this._root.current);
    };
    ResizeGroupBase.prototype._onResize = function () {
        if (this._root.current) {
            this.setState({ measureContainer: true });
        }
    };
    return ResizeGroupBase;
}(React.Component));
exports.ResizeGroupBase = ResizeGroupBase;
//# sourceMappingURL=ResizeGroup.base.js.map