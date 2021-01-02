import { __assign, __extends, __rest } from "tslib";
import * as React from 'react';
import { warnDeprecations, KeyCodes, getId, getNativeProps, divProperties, classNamesFunction, warn, initializeComponentRef, } from '../../Utilities';
import { CommandButton } from '../../Button';
import { FocusZone, FocusZoneDirection } from '../../FocusZone';
import { PivotItem } from './PivotItem';
import { PivotLinkFormat } from './Pivot.types';
import { PivotLinkSize } from './Pivot.types';
import { Icon } from '../../Icon';
var getClassNames = classNamesFunction();
var PivotName = 'Pivot';
/**
 *  Usage:
 *
 *     <Pivot>
 *       <PivotItem headerText="Foo">
 *         <Label>Pivot #1</Label>
 *       </PivotItem>
 *       <PivotItem headerText="Bar">
 *         <Label>Pivot #2</Label>
 *       </PivotItem>
 *       <PivotItem headerText="Bas">
 *         <Label>Pivot #3</Label>
 *       </PivotItem>
 *     </Pivot>
 */
var PivotBase = /** @class */ (function (_super) {
    __extends(PivotBase, _super);
    function PivotBase(props) {
        var _this = _super.call(this, props) || this;
        _this._focusZone = React.createRef();
        _this._renderPivotLink = function (linkCollection, link, selectedKey) {
            var itemKey = link.itemKey, headerButtonProps = link.headerButtonProps;
            var tabId = linkCollection.keyToTabIdMapping[itemKey];
            var onRenderItemLink = link.onRenderItemLink;
            var linkContent;
            var isSelected = selectedKey === itemKey;
            if (onRenderItemLink) {
                linkContent = onRenderItemLink(link, _this._renderLinkContent);
            }
            else {
                linkContent = _this._renderLinkContent(link);
            }
            var contentString = link.headerText || '';
            contentString += link.itemCount ? ' (' + link.itemCount + ')' : '';
            // Adding space supplementary for icon
            contentString += link.itemIcon ? ' xx' : '';
            return (React.createElement(CommandButton, __assign({}, headerButtonProps, { id: tabId, key: itemKey, className: isSelected ? _this._classNames.linkIsSelected : _this._classNames.link, 
                // eslint-disable-next-line react/jsx-no-bind
                onClick: _this._onLinkClick.bind(_this, itemKey), 
                // eslint-disable-next-line react/jsx-no-bind
                onKeyDown: _this._onKeyDown.bind(_this, itemKey), "aria-label": link.ariaLabel, role: "tab", "aria-selected": isSelected, name: link.headerText, keytipProps: link.keytipProps, "data-content": contentString }), linkContent));
        };
        _this._renderLinkContent = function (link) {
            var itemCount = link.itemCount, itemIcon = link.itemIcon, headerText = link.headerText;
            var classNames = _this._classNames;
            return (React.createElement("span", { className: classNames.linkContent },
                itemIcon !== undefined && (React.createElement("span", { className: classNames.icon },
                    React.createElement(Icon, { iconName: itemIcon }))),
                headerText !== undefined && React.createElement("span", { className: classNames.text },
                    " ",
                    link.headerText),
                itemCount !== undefined && React.createElement("span", { className: classNames.count },
                    " (",
                    itemCount,
                    ")")));
        };
        initializeComponentRef(_this);
        if (process.env.NODE_ENV !== 'production') {
            warnDeprecations(PivotName, props, {
                initialSelectedKey: 'defaultSelectedKey',
                initialSelectedIndex: 'defaultSelectedIndex',
            });
        }
        _this._pivotId = getId(PivotName);
        var links = _this._getPivotLinks(props).links;
        // eslint-disable-next-line deprecation/deprecation
        var _a = props.defaultSelectedKey, defaultSelectedKey = _a === void 0 ? props.initialSelectedKey : _a, _b = props.defaultSelectedIndex, defaultSelectedIndex = _b === void 0 ? props.initialSelectedIndex : _b;
        var selectedKey;
        if (defaultSelectedKey) {
            selectedKey = defaultSelectedKey;
        }
        else if (typeof defaultSelectedIndex === 'number') {
            selectedKey = links[defaultSelectedIndex].itemKey;
        }
        else if (links.length) {
            selectedKey = links[0].itemKey;
        }
        _this.state = {
            selectedKey: selectedKey,
        };
        return _this;
    }
    /**
     * Sets focus to the first pivot tab.
     */
    PivotBase.prototype.focus = function () {
        if (this._focusZone.current) {
            this._focusZone.current.focus();
        }
    };
    PivotBase.prototype.render = function () {
        var _this = this;
        var linkCollection = this._getPivotLinks(this.props);
        var selectedKey = this._getSelectedKey(linkCollection);
        var divProps = getNativeProps(this.props, divProperties);
        this._classNames = this._getClassNames(this.props);
        return (React.createElement("div", __assign({ role: "toolbar" }, divProps),
            this._renderPivotLinks(linkCollection, selectedKey),
            selectedKey &&
                linkCollection.links.map(function (link) {
                    return (link.alwaysRender === true || selectedKey === link.itemKey) &&
                        _this._renderPivotItem(linkCollection, link.itemKey, selectedKey === link.itemKey);
                })));
    };
    PivotBase.prototype._getSelectedKey = function (linkCollection) {
        var propsSelectedKey = this.props.selectedKey;
        if (this._isKeyValid(linkCollection, propsSelectedKey) || propsSelectedKey === null) {
            return propsSelectedKey;
        }
        var stateSelectedKey = this.state.selectedKey;
        if (this._isKeyValid(linkCollection, stateSelectedKey)) {
            return stateSelectedKey;
        }
        if (linkCollection.links.length) {
            return linkCollection.links[0].itemKey;
        }
        return undefined;
    };
    /**
     * Renders the set of links to route between pivots
     */
    PivotBase.prototype._renderPivotLinks = function (linkCollection, selectedKey) {
        var _this = this;
        var items = linkCollection.links.map(function (l) { return _this._renderPivotLink(linkCollection, l, selectedKey); });
        return (React.createElement(FocusZone, { className: this._classNames.root, role: "tablist", componentRef: this._focusZone, direction: FocusZoneDirection.horizontal }, items));
    };
    /**
     * Renders a Pivot Item
     */
    PivotBase.prototype._renderPivotItem = function (linkCollection, itemKey, isActive) {
        if (this.props.headersOnly || !itemKey) {
            return null;
        }
        var index = linkCollection.keyToIndexMapping[itemKey];
        var selectedTabId = linkCollection.keyToTabIdMapping[itemKey];
        return (React.createElement("div", { role: "tabpanel", hidden: !isActive, key: itemKey, "aria-hidden": !isActive, "aria-labelledby": selectedTabId, className: this._classNames.itemContainer }, React.Children.toArray(this.props.children)[index]));
    };
    /**
     * Gets the set of PivotLinks as array of IPivotItemProps
     * The set of Links is determined by child components of type PivotItem
     */
    PivotBase.prototype._getPivotLinks = function (props) {
        var _this = this;
        var result = {
            links: [],
            keyToIndexMapping: {},
            keyToTabIdMapping: {},
        };
        React.Children.map(React.Children.toArray(props.children), function (child, index) {
            if (_isPivotItem(child)) {
                var pivotItem = child;
                var _a = pivotItem.props, linkText = _a.linkText, pivotItemProps = __rest(_a, ["linkText"]);
                var itemKey = pivotItem.props.itemKey || index.toString();
                result.links.push(__assign(__assign({ 
                    // Use linkText (deprecated) if headerText is not provided
                    headerText: linkText }, pivotItemProps), { itemKey: itemKey }));
                result.keyToIndexMapping[itemKey] = index;
                result.keyToTabIdMapping[itemKey] = _this._getTabId(itemKey, index);
            }
            else {
                warn('The children of a Pivot component must be of type PivotItem to be rendered.');
            }
        });
        return result;
    };
    /**
     * Generates the Id for the tab button.
     */
    PivotBase.prototype._getTabId = function (itemKey, index) {
        if (this.props.getTabId) {
            return this.props.getTabId(itemKey, index);
        }
        return this._pivotId + ("-Tab" + index);
    };
    /**
     * whether the key exists in the pivot items.
     */
    PivotBase.prototype._isKeyValid = function (linkCollection, itemKey) {
        return itemKey !== undefined && itemKey !== null && linkCollection.keyToIndexMapping[itemKey] !== undefined;
    };
    /**
     * Handles the onClick event on PivotLinks
     */
    PivotBase.prototype._onLinkClick = function (itemKey, ev) {
        ev.preventDefault();
        this._updateSelectedItem(itemKey, ev);
    };
    /**
     * Handle the onKeyDown event on the PivotLinks
     */
    PivotBase.prototype._onKeyDown = function (itemKey, ev) {
        if (ev.which === KeyCodes.enter) {
            ev.preventDefault();
            this._updateSelectedItem(itemKey);
        }
    };
    /**
     * Updates the state with the new selected index
     */
    PivotBase.prototype._updateSelectedItem = function (itemKey, ev) {
        this.setState({
            selectedKey: itemKey,
        });
        var linkCollection = this._getPivotLinks(this.props);
        if (this.props.onLinkClick && linkCollection.keyToIndexMapping[itemKey] >= 0) {
            var index = linkCollection.keyToIndexMapping[itemKey];
            // React.Element<any> cannot directly convert to PivotItem.
            var item = React.Children.toArray(this.props.children)[index];
            if (_isPivotItem(item)) {
                this.props.onLinkClick(item, ev);
            }
        }
    };
    PivotBase.prototype._getClassNames = function (props) {
        var theme = props.theme;
        var rootIsLarge = props.linkSize === PivotLinkSize.large;
        var rootIsTabs = props.linkFormat === PivotLinkFormat.tabs;
        return getClassNames(props.styles, {
            theme: theme,
            rootIsLarge: rootIsLarge,
            rootIsTabs: rootIsTabs,
        });
    };
    return PivotBase;
}(React.Component));
export { PivotBase };
function _isPivotItem(item) {
    // In theory, we should be able to just check item.type === PivotItem.
    // However, under certain unclear circumstances (see https://github.com/microsoft/fluentui/issues/10785),
    // the object identity is different despite the function implementation being the same.
    return (!!item &&
        typeof item === 'object' &&
        !!item.type &&
        // Casting as an any to avoid [ object Object ] errors.
        item.type.name === PivotItem.name);
}
//# sourceMappingURL=Pivot.base.js.map