define(["require", "exports", "tslib", "react", "@fluentui/react-focus", "../../Utilities", "../../utilities/keytips/KeytipManager"], function (require, exports, tslib_1, React, react_focus_1, Utilities_1, KeytipManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var COMPONENT_NAME = 'OverflowSet';
    var OverflowSetBase = /** @class */ (function (_super) {
        tslib_1.__extends(OverflowSetBase, _super);
        function OverflowSetBase(props) {
            var _this = _super.call(this, props) || this;
            _this._focusZone = React.createRef();
            _this._persistedKeytips = {};
            _this._keytipManager = KeytipManager_1.KeytipManager.getInstance();
            _this._divContainer = React.createRef();
            _this._onRenderItems = function (items) {
                return items.map(function (item, i) {
                    return (React.createElement("div", { key: item.key, className: _this._classNames.item }, _this.props.onRenderItem(item)));
                });
            };
            _this._onRenderOverflowButtonWrapper = function (items) {
                var wrapperDivProps = {
                    className: _this._classNames.overflowButton,
                };
                var overflowKeytipSequences = _this.props.keytipSequences;
                var newOverflowItems = [];
                if (overflowKeytipSequences) {
                    items.forEach(function (overflowItem) {
                        var keytip = overflowItem.keytipProps;
                        if (keytip) {
                            // Create persisted keytip
                            var persistedKeytip = {
                                content: keytip.content,
                                keySequences: keytip.keySequences,
                                disabled: keytip.disabled || !!(overflowItem.disabled || overflowItem.isDisabled),
                                hasDynamicChildren: keytip.hasDynamicChildren,
                                hasMenu: keytip.hasMenu,
                            };
                            if (keytip.hasDynamicChildren || _this._getSubMenuForItem(overflowItem)) {
                                // If the keytip has a submenu or children nodes, change onExecute to persistedKeytipExecute
                                persistedKeytip.onExecute = _this._keytipManager.menuExecute.bind(_this._keytipManager, overflowKeytipSequences, overflowItem.keytipProps.keySequences);
                            }
                            else {
                                // If the keytip doesn't have a submenu, just execute the original function
                                persistedKeytip.onExecute = keytip.onExecute;
                            }
                            // Add this persisted keytip to our internal list, use a temporary uniqueID (its content)
                            // uniqueID will get updated on register
                            _this._persistedKeytips[persistedKeytip.content] = persistedKeytip;
                            // Add the overflow sequence to this item
                            var newOverflowItem = tslib_1.__assign(tslib_1.__assign({}, overflowItem), { keytipProps: tslib_1.__assign(tslib_1.__assign({}, keytip), { overflowSetSequence: overflowKeytipSequences }) });
                            newOverflowItems.push(newOverflowItem);
                        }
                        else {
                            // Nothing to change, add overflowItem to list
                            newOverflowItems.push(overflowItem);
                        }
                    });
                }
                else {
                    newOverflowItems = items;
                }
                return React.createElement("div", tslib_1.__assign({}, wrapperDivProps), _this.props.onRenderOverflowButton(newOverflowItems));
            };
            Utilities_1.initializeComponentRef(_this);
            Utilities_1.warnMutuallyExclusive(COMPONENT_NAME, props, {
                doNotContainWithinFocusZone: 'focusZoneProps',
            });
            return _this;
        }
        OverflowSetBase.prototype.render = function () {
            var _a = this.props, items = _a.items, overflowItems = _a.overflowItems, className = _a.className, 
            // eslint-disable-next-line deprecation/deprecation
            focusZoneProps = _a.focusZoneProps, styles = _a.styles, vertical = _a.vertical, 
            // eslint-disable-next-line deprecation/deprecation
            doNotContainWithinFocusZone = _a.doNotContainWithinFocusZone, role = _a.role, _b = _a.overflowSide, overflowSide = _b === void 0 ? 'end' : _b;
            this._classNames = getClassNames(styles, { className: className, vertical: vertical });
            var Tag;
            var uniqueComponentProps;
            if (doNotContainWithinFocusZone) {
                Tag = 'div';
                uniqueComponentProps = tslib_1.__assign(tslib_1.__assign({}, Utilities_1.getNativeProps(this.props, Utilities_1.divProperties)), { ref: this._divContainer });
            }
            else {
                Tag = react_focus_1.FocusZone;
                uniqueComponentProps = tslib_1.__assign(tslib_1.__assign(tslib_1.__assign({}, Utilities_1.getNativeProps(this.props, Utilities_1.divProperties)), focusZoneProps), { componentRef: this._focusZone, direction: vertical ? react_focus_1.FocusZoneDirection.vertical : react_focus_1.FocusZoneDirection.horizontal });
            }
            var showOverflow = overflowItems && overflowItems.length > 0;
            return (React.createElement(Tag, tslib_1.__assign({ role: role || 'group', "aria-orientation": role === 'menubar' ? (vertical === true ? 'vertical' : 'horizontal') : undefined }, uniqueComponentProps, { className: this._classNames.root }),
                overflowSide === 'start' && showOverflow && this._onRenderOverflowButtonWrapper(overflowItems),
                items && this._onRenderItems(items),
                overflowSide === 'end' && showOverflow && this._onRenderOverflowButtonWrapper(overflowItems)));
        };
        /**
         * Sets focus to the first tabbable item in the OverflowSet.
         * @param forceIntoFirstElement - If true, focus will be forced into the first element,
         * even if focus is already in theOverflowSet
         * @returns True if focus could be set to an active element, false if no operation was taken.
         */
        OverflowSetBase.prototype.focus = function (forceIntoFirstElement) {
            var focusSucceeded = false;
            // eslint-disable-next-line deprecation/deprecation
            if (this.props.doNotContainWithinFocusZone) {
                if (this._divContainer.current) {
                    focusSucceeded = Utilities_1.focusFirstChild(this._divContainer.current);
                }
            }
            else if (this._focusZone.current) {
                focusSucceeded = this._focusZone.current.focus(forceIntoFirstElement);
            }
            return focusSucceeded;
        };
        /**
         * Sets focus to a specific child element within the OverflowSet.
         * @param childElement - The child element within the zone to focus.
         * @returns True if focus could be set to an active element, false if no operation was taken.
         */
        OverflowSetBase.prototype.focusElement = function (childElement) {
            var focusSucceeded = false;
            if (!childElement) {
                return false;
            }
            // eslint-disable-next-line deprecation/deprecation
            if (this.props.doNotContainWithinFocusZone) {
                if (this._divContainer.current && Utilities_1.elementContains(this._divContainer.current, childElement)) {
                    childElement.focus();
                    focusSucceeded = document.activeElement === childElement;
                }
            }
            else if (this._focusZone.current) {
                focusSucceeded = this._focusZone.current.focusElement(childElement);
            }
            return focusSucceeded;
        };
        // Add keytip register/unregister handlers to lifecycle functions to correctly manage persisted keytips
        OverflowSetBase.prototype.componentDidMount = function () {
            this._registerPersistedKeytips();
        };
        OverflowSetBase.prototype.componentWillUnmount = function () {
            this._unregisterPersistedKeytips();
        };
        OverflowSetBase.prototype.UNSAFE_componentWillUpdate = function () {
            this._unregisterPersistedKeytips();
        };
        OverflowSetBase.prototype.componentDidUpdate = function () {
            this._registerPersistedKeytips();
        };
        OverflowSetBase.prototype._registerPersistedKeytips = function () {
            var _this = this;
            Object.keys(this._persistedKeytips).forEach(function (key) {
                var keytip = _this._persistedKeytips[key];
                var uniqueID = _this._keytipManager.register(keytip, true);
                // Update map
                _this._persistedKeytips[uniqueID] = keytip;
                delete _this._persistedKeytips[key];
            });
        };
        OverflowSetBase.prototype._unregisterPersistedKeytips = function () {
            var _this = this;
            // Delete all persisted keytips saved
            Object.keys(this._persistedKeytips).forEach(function (uniqueID) {
                _this._keytipManager.unregister(_this._persistedKeytips[uniqueID], uniqueID, true);
            });
            this._persistedKeytips = {};
        };
        /**
         * Gets the subMenu for an overflow item
         * Checks if itemSubMenuProvider has been defined, if not defaults to subMenuProps
         */
        OverflowSetBase.prototype._getSubMenuForItem = function (item) {
            if (this.props.itemSubMenuProvider) {
                return this.props.itemSubMenuProvider(item);
            }
            if (item.subMenuProps) {
                return item.subMenuProps.items;
            }
            return undefined;
        };
        return OverflowSetBase;
    }(React.Component));
    exports.OverflowSetBase = OverflowSetBase;
});
//# sourceMappingURL=OverflowSet.base.js.map