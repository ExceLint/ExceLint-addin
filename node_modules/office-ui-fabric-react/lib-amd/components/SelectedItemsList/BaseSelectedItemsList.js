define(["require", "exports", "tslib", "react", "../../Selection", "../../Utilities"], function (require, exports, tslib_1, React, Selection_1, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BaseSelectedItemsList = /** @class */ (function (_super) {
        tslib_1.__extends(BaseSelectedItemsList, _super);
        function BaseSelectedItemsList(basePickerProps) {
            var _this = _super.call(this, basePickerProps) || this;
            _this.addItems = function (items) {
                var processedItems = _this.props.onItemSelected
                    ? _this.props.onItemSelected(items)
                    : items;
                var processedItemObjects = processedItems;
                var processedItemPromiseLikes = processedItems;
                if (processedItemPromiseLikes && processedItemPromiseLikes.then) {
                    processedItemPromiseLikes.then(function (resolvedProcessedItems) {
                        var newItems = _this.state.items.concat(resolvedProcessedItems);
                        _this.updateItems(newItems);
                    });
                }
                else {
                    var newItems = _this.state.items.concat(processedItemObjects);
                    _this.updateItems(newItems);
                }
            };
            _this.removeItemAt = function (index) {
                var items = _this.state.items;
                if (_this._canRemoveItem(items[index])) {
                    if (index > -1) {
                        if (_this.props.onItemsDeleted) {
                            _this.props.onItemsDeleted([items[index]]);
                        }
                        var newItems = items.slice(0, index).concat(items.slice(index + 1));
                        _this.updateItems(newItems);
                    }
                }
            };
            _this.removeItem = function (item) {
                var items = _this.state.items;
                var index = items.indexOf(item);
                _this.removeItemAt(index);
            };
            _this.replaceItem = function (itemToReplace, itemsToReplaceWith) {
                var items = _this.state.items;
                var index = items.indexOf(itemToReplace);
                if (index > -1) {
                    var newItems = items
                        .slice(0, index)
                        .concat(itemsToReplaceWith)
                        .concat(items.slice(index + 1));
                    _this.updateItems(newItems);
                }
            };
            _this.removeItems = function (itemsToRemove) {
                var items = _this.state.items;
                var itemsCanRemove = itemsToRemove.filter(function (item) { return _this._canRemoveItem(item); });
                var newItems = items.filter(function (item) { return itemsCanRemove.indexOf(item) === -1; });
                var firstItemToRemove = itemsCanRemove[0];
                var index = items.indexOf(firstItemToRemove);
                if (_this.props.onItemsDeleted) {
                    _this.props.onItemsDeleted(itemsCanRemove);
                }
                _this.updateItems(newItems, index);
            };
            _this.onCopy = function (ev) {
                if (_this.props.onCopyItems && _this.selection.getSelectedCount() > 0) {
                    var selectedItems = _this.selection.getSelection();
                    _this.copyItems(selectedItems);
                }
            };
            _this.renderItems = function () {
                var removeButtonAriaLabel = _this.props.removeButtonAriaLabel;
                var onRenderItem = _this.props.onRenderItem;
                var items = _this.state.items;
                return items.map(function (item, index) {
                    return onRenderItem({
                        item: item,
                        index: index,
                        key: item.key ? item.key : index,
                        selected: _this.selection.isIndexSelected(index),
                        onRemoveItem: function () { return _this.removeItem(item); },
                        onItemChange: _this.onItemChange,
                        removeButtonAriaLabel: removeButtonAriaLabel,
                        onCopyItem: function (itemToCopy) { return _this.copyItems([itemToCopy]); },
                    });
                });
            };
            _this.onSelectionChanged = function () {
                _this.forceUpdate();
            };
            _this.onItemChange = function (changedItem, index) {
                var items = _this.state.items;
                if (index >= 0) {
                    var newItems = items;
                    newItems[index] = changedItem;
                    _this.updateItems(newItems);
                }
            };
            Utilities_1.initializeComponentRef(_this);
            var items = basePickerProps.selectedItems || basePickerProps.defaultSelectedItems || [];
            _this.state = {
                items: items,
            };
            // Create a new selection if one is not specified
            _this.selection = _this.props.selection
                ? _this.props.selection
                : new Selection_1.Selection({ onSelectionChanged: _this.onSelectionChanged });
            return _this;
        }
        Object.defineProperty(BaseSelectedItemsList.prototype, "items", {
            get: function () {
                return this.state.items;
            },
            enumerable: true,
            configurable: true
        });
        BaseSelectedItemsList.prototype.removeSelectedItems = function () {
            if (this.state.items.length && this.selection.getSelectedCount() > 0) {
                this.removeItems(this.selection.getSelection());
            }
        };
        /**
         * Controls what happens whenever there is an action that impacts the selected items.
         * If selectedItems is provided, this will act as a controlled component and will not update its own state.
         */
        BaseSelectedItemsList.prototype.updateItems = function (items, focusIndex) {
            var _this = this;
            if (this.props.selectedItems) {
                // If the component is a controlled component then the controlling component will need to pass the new props
                this.onChange(items);
            }
            else {
                this.setState({ items: items }, function () {
                    _this._onSelectedItemsUpdated(items, focusIndex);
                });
            }
        };
        BaseSelectedItemsList.prototype.hasSelectedItems = function () {
            return this.selection.getSelectedCount() > 0;
        };
        BaseSelectedItemsList.prototype.unselectAll = function () {
            this.selection.setAllSelected(false);
        };
        BaseSelectedItemsList.prototype.highlightedItems = function () {
            return this.selection.getSelection();
        };
        BaseSelectedItemsList.prototype.UNSAFE_componentWillUpdate = function (newProps, newState) {
            if (newState.items && newState.items !== this.state.items) {
                this.selection.setItems(newState.items);
            }
        };
        BaseSelectedItemsList.prototype.componentDidMount = function () {
            this.selection.setItems(this.state.items);
        };
        BaseSelectedItemsList.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
            var newItems = newProps.selectedItems;
            if (newItems) {
                this.setState({ items: newItems });
            }
            if (newProps.selection) {
                this.selection = newProps.selection;
            }
        };
        BaseSelectedItemsList.prototype.render = function () {
            return this.renderItems();
        };
        BaseSelectedItemsList.prototype.onChange = function (items) {
            if (this.props.onChange) {
                this.props.onChange(items);
            }
        };
        BaseSelectedItemsList.prototype.copyItems = function (items) {
            if (this.props.onCopyItems) {
                var copyText = this.props.onCopyItems(items);
                var copyInput = document.createElement('input');
                document.body.appendChild(copyInput);
                try {
                    // Try to copy the text directly to the clipboard
                    copyInput.value = copyText;
                    copyInput.select();
                    if (!document.execCommand('copy')) {
                        // The command failed. Fallback to the method below.
                        throw new Error();
                    }
                }
                catch (err) {
                    // no op
                }
                finally {
                    document.body.removeChild(copyInput);
                }
            }
        };
        BaseSelectedItemsList.prototype._onSelectedItemsUpdated = function (items, focusIndex) {
            this.onChange(items);
        };
        BaseSelectedItemsList.prototype._canRemoveItem = function (item) {
            return !this.props.canRemoveItem || this.props.canRemoveItem(item);
        };
        return BaseSelectedItemsList;
    }(React.Component));
    exports.BaseSelectedItemsList = BaseSelectedItemsList;
});
//# sourceMappingURL=BaseSelectedItemsList.js.map