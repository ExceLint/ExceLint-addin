define(["require", "exports", "tslib", "react", "react-dom", "../../Fabric", "../../Utilities", "./Layer.notification"], function (require, exports, tslib_1, React, ReactDOM, Fabric_1, Utilities_1, Layer_notification_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var LayerBase = /** @class */ (function (_super) {
        tslib_1.__extends(LayerBase, _super);
        function LayerBase(props) {
            var _this = _super.call(this, props) || this;
            _this._rootRef = React.createRef();
            _this._createLayerElement = function () {
                var hostId = _this.props.hostId;
                var doc = Utilities_1.getDocument(_this._rootRef.current);
                var host = _this._getHost();
                if (!doc || !host) {
                    return;
                }
                // If one was already existing, remove.
                _this._removeLayerElement();
                var layerElement = doc.createElement('div');
                var classNames = _this._getClassNames();
                layerElement.className = classNames.root;
                Utilities_1.setPortalAttribute(layerElement);
                Utilities_1.setVirtualParent(layerElement, _this._rootRef.current);
                _this.props.insertFirst ? host.insertBefore(layerElement, host.firstChild) : host.appendChild(layerElement);
                _this.setState({
                    hostId: hostId,
                    layerElement: layerElement,
                }, function () {
                    // eslint-disable-next-line deprecation/deprecation
                    var _a = _this.props, onLayerDidMount = _a.onLayerDidMount, onLayerMounted = _a.onLayerMounted;
                    if (onLayerMounted) {
                        onLayerMounted();
                    }
                    if (onLayerDidMount) {
                        onLayerDidMount();
                    }
                });
            };
            _this.state = {};
            
            return _this;
        }
        LayerBase.prototype.componentDidMount = function () {
            var hostId = this.props.hostId;
            this._createLayerElement();
            if (hostId) {
                Layer_notification_1.registerLayer(hostId, this._createLayerElement);
            }
        };
        LayerBase.prototype.render = function () {
            var layerElement = this.state.layerElement;
            var classNames = this._getClassNames();
            var eventBubblingEnabled = this.props.eventBubblingEnabled;
            return (React.createElement("span", { className: "ms-layer", ref: this._rootRef }, layerElement &&
                ReactDOM.createPortal(React.createElement(Fabric_1.Fabric, tslib_1.__assign({}, (!eventBubblingEnabled && _getFilteredEvents()), { className: classNames.content }), this.props.children), layerElement)));
        };
        LayerBase.prototype.componentDidUpdate = function () {
            if (this.props.hostId !== this.state.hostId) {
                this._createLayerElement();
            }
        };
        LayerBase.prototype.componentWillUnmount = function () {
            var hostId = this.props.hostId;
            this._removeLayerElement();
            if (hostId) {
                Layer_notification_1.unregisterLayer(hostId, this._createLayerElement);
            }
        };
        LayerBase.prototype._removeLayerElement = function () {
            var onLayerWillUnmount = this.props.onLayerWillUnmount;
            var layerElement = this.state.layerElement;
            if (layerElement) {
                Utilities_1.setVirtualParent(layerElement, null);
            }
            if (onLayerWillUnmount) {
                onLayerWillUnmount();
            }
            if (layerElement && layerElement.parentNode) {
                var parentNode = layerElement.parentNode;
                if (parentNode) {
                    parentNode.removeChild(layerElement);
                }
            }
        };
        LayerBase.prototype._getClassNames = function () {
            var _a = this.props, className = _a.className, styles = _a.styles, theme = _a.theme;
            var classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                isNotHost: !this.props.hostId,
            });
            return classNames;
        };
        LayerBase.prototype._getHost = function () {
            var hostId = this.props.hostId;
            var doc = Utilities_1.getDocument(this._rootRef.current);
            if (!doc) {
                return undefined;
            }
            if (hostId) {
                return doc.getElementById(hostId);
            }
            else {
                var defaultHostSelector = Layer_notification_1.getDefaultTarget();
                return defaultHostSelector ? doc.querySelector(defaultHostSelector) : doc.body;
            }
        };
        LayerBase.defaultProps = {
            onLayerDidMount: function () { return undefined; },
            onLayerWillUnmount: function () { return undefined; },
        };
        LayerBase = tslib_1.__decorate([
            Utilities_1.customizable('Layer', ['theme', 'hostId'])
        ], LayerBase);
        return LayerBase;
    }(React.Component));
    exports.LayerBase = LayerBase;
    var _onFilterEvent = function (ev) {
        // We should just be able to check ev.bubble here and only stop events that are bubbling up. However, even though
        // mouseenter and mouseleave do NOT bubble up, they are showing up as bubbling. Therefore we stop events based on
        // event name rather than ev.bubble.
        if (ev.eventPhase === Event.BUBBLING_PHASE &&
            ev.type !== 'mouseenter' &&
            ev.type !== 'mouseleave' &&
            ev.type !== 'touchstart' &&
            ev.type !== 'touchend') {
            ev.stopPropagation();
        }
    };
    var _filteredEventProps;
    function _getFilteredEvents() {
        if (!_filteredEventProps) {
            _filteredEventProps = {};
            [
                'onClick',
                'onContextMenu',
                'onDoubleClick',
                'onDrag',
                'onDragEnd',
                'onDragEnter',
                'onDragExit',
                'onDragLeave',
                'onDragOver',
                'onDragStart',
                'onDrop',
                'onMouseDown',
                'onMouseEnter',
                'onMouseLeave',
                'onMouseMove',
                'onMouseOver',
                'onMouseOut',
                'onMouseUp',
                'onTouchMove',
                'onTouchStart',
                'onTouchCancel',
                'onTouchEnd',
                'onKeyDown',
                'onKeyPress',
                'onKeyUp',
                'onFocus',
                'onBlur',
                'onChange',
                'onInput',
                'onInvalid',
                'onSubmit',
            ].forEach(function (name) { return (_filteredEventProps[name] = _onFilterEvent); });
        }
        return _filteredEventProps;
    }
});
//# sourceMappingURL=Layer.base.js.map