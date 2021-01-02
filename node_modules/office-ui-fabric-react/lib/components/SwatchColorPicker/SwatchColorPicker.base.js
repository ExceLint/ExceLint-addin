import { __assign, __extends } from "tslib";
import * as React from 'react';
import { Async, classNamesFunction, findIndex, KeyCodes, getId, warnMutuallyExclusive, warnConditionallyRequiredProps, } from '../../Utilities';
import { ButtonGrid } from '../../utilities/ButtonGrid/ButtonGrid';
import { ColorPickerGridCell } from './ColorPickerGridCell';
import { memoizeFunction, warnDeprecations } from '@uifabric/utilities';
var getClassNames = classNamesFunction();
var COMPONENT_NAME = 'SwatchColorPicker';
var SwatchColorPickerBase = /** @class */ (function (_super) {
    __extends(SwatchColorPickerBase, _super);
    function SwatchColorPickerBase(props) {
        var _this = _super.call(this, props) || this;
        _this.navigationIdleDelay = 250 /* ms */;
        // Add an index to each color cells. Memoizes this so that color cells do not re-render on every update.
        _this._getItemsWithIndex = memoizeFunction(function (items) {
            return items.map(function (item, index) {
                return __assign(__assign({}, item), { index: index });
            });
        });
        _this._onRenderItem = function (item, index) {
            var _a = _this.props.onRenderColorCell, onRenderColorCell = _a === void 0 ? _this._renderOption : _a;
            return onRenderColorCell(item, _this._renderOption);
        };
        /**
         * When the whole swatchColorPicker is blurred,
         * make sure to clear the pending focused stated
         */
        _this._onSwatchColorPickerBlur = function () {
            if (_this.props.onCellFocused) {
                _this._cellFocused = false;
                _this.props.onCellFocused();
            }
        };
        /**
         * Render a color cell
         * @param item - The item to render
         * @returns - Element representing the item
         */
        _this._renderOption = function (item) {
            var props = _this.props;
            var id = _this._id;
            return (React.createElement(ColorPickerGridCell, { item: item, idPrefix: id, color: item.color, styles: props.getColorGridCellStyles, disabled: props.disabled, onClick: _this._onCellClick, onHover: _this._onGridCellHovered, onFocus: _this._onGridCellFocused, selected: _this.state.selectedIndex !== undefined && _this.state.selectedIndex === item.index, circle: props.cellShape === 'circle', label: item.label, onMouseEnter: _this._onMouseEnter, onMouseMove: _this._onMouseMove, onMouseLeave: _this._onMouseLeave, onWheel: _this._onWheel, onKeyDown: _this._onKeyDown, height: props.cellHeight, width: props.cellWidth, borderWidth: props.cellBorderWidth }));
        };
        /**
         * Callback passed to the GridCell that will manage triggering the onCellHovered callback for mouseEnter
         */
        _this._onMouseEnter = function (ev) {
            if (!_this.props.focusOnHover) {
                return !_this.isNavigationIdle || !!_this.props.disabled;
            }
            if (_this.isNavigationIdle && !_this.props.disabled) {
                ev.currentTarget.focus();
            }
            return true;
        };
        /**
         * Callback passed to the GridCell that will manage Hover/Focus updates
         */
        _this._onMouseMove = function (ev) {
            if (!_this.props.focusOnHover) {
                return !_this.isNavigationIdle || !!_this.props.disabled;
            }
            var targetElement = ev.currentTarget;
            // If navigation is idle and the targetElement is the focused element bail out
            // if (!this.isNavigationIdle || (document && targetElement === (document.activeElement as HTMLElement))) {
            if (_this.isNavigationIdle && !(document && targetElement === document.activeElement)) {
                targetElement.focus();
            }
            return true;
        };
        /**
         * Callback passed to the GridCell that will manage Hover/Focus updates
         */
        _this._onMouseLeave = function (ev) {
            var parentSelector = _this.props.mouseLeaveParentSelector;
            if (!_this.props.focusOnHover || !parentSelector || !_this.isNavigationIdle || _this.props.disabled) {
                return;
            }
            // Get the elements that math the given selector
            var elements = document.querySelectorAll(parentSelector);
            // iterate over the elements return to make sure it is a parent of the target and focus it
            for (var index = 0; index < elements.length; index += 1) {
                if (elements[index].contains(ev.currentTarget)) {
                    /**
                     * IE11 focus() method forces parents to scroll to top of element.
                     * Edge and IE expose a setActive() function for focusable divs that
                     * sets the page focus but does not scroll the parent element.
                     */
                    if (elements[index].setActive) {
                        try {
                            elements[index].setActive();
                        }
                        catch (e) {
                            /* no-op */
                        }
                    }
                    else {
                        elements[index].focus();
                    }
                    break;
                }
            }
        };
        /**
         * Callback to make sure we don't update the hovered element during mouse wheel
         */
        _this._onWheel = function () {
            _this._setNavigationTimeout();
        };
        /**
         * Callback that
         */
        _this._onKeyDown = function (ev) {
            if (ev.which === KeyCodes.up ||
                ev.which === KeyCodes.down ||
                ev.which === KeyCodes.left ||
                ev.which === KeyCodes.right) {
                _this._setNavigationTimeout();
            }
        };
        /**
         * Sets a timeout so we won't process any mouse "hover" events
         * while navigating (via mouseWheel or arrowKeys)
         */
        _this._setNavigationTimeout = function () {
            if (!_this.isNavigationIdle && _this.navigationIdleTimeoutId !== undefined) {
                _this.async.clearTimeout(_this.navigationIdleTimeoutId);
                _this.navigationIdleTimeoutId = undefined;
            }
            else {
                _this.isNavigationIdle = false;
            }
            _this.navigationIdleTimeoutId = _this.async.setTimeout(function () {
                _this.isNavigationIdle = true;
            }, _this.navigationIdleDelay);
        };
        /**
         * Callback passed to the GridCell class that will trigger the onCellHovered callback of the SwatchColorPicker
         * NOTE: This will not be triggered if shouldFocusOnHover === true
         */
        _this._onGridCellHovered = function (item) {
            var onCellHovered = _this.props.onCellHovered;
            if (onCellHovered) {
                return item ? onCellHovered(item.id, item.color) : onCellHovered();
            }
        };
        /**
         * Callback passed to the GridCell class that will trigger the onCellFocus callback of the SwatchColorPicker
         */
        _this._onGridCellFocused = function (item) {
            var onCellFocused = _this.props.onCellFocused;
            if (onCellFocused) {
                if (item) {
                    _this._cellFocused = true;
                    return onCellFocused(item.id, item.color);
                }
                else {
                    _this._cellFocused = false;
                    return onCellFocused();
                }
            }
        };
        /**
         * Handle the click on a cell
         * @param item - The cell that the click was fired against
         */
        _this._onCellClick = function (item) {
            if (_this.props.disabled) {
                return;
            }
            var index = item.index;
            // If we have a valid index and it is not already
            // selected, select it
            if (index >= 0 && index !== _this.state.selectedIndex) {
                if (_this.props.onCellFocused && _this._cellFocused) {
                    _this._cellFocused = false;
                    _this.props.onCellFocused();
                }
                if (_this.props.onColorChanged) {
                    _this.props.onColorChanged(item.id, item.color);
                }
                // Update internal state only if the component is uncontrolled
                if (_this.props.isControlled !== true) {
                    _this.setState({
                        selectedIndex: index,
                    });
                }
            }
        };
        _this._id = props.id || getId('swatchColorPicker');
        if (process.env.NODE_ENV !== 'production') {
            warnMutuallyExclusive(COMPONENT_NAME, props, {
                focusOnHover: 'onHover',
            });
            warnConditionallyRequiredProps(COMPONENT_NAME, props, ['focusOnHover'], 'mouseLeaveParentSelector', !!props.mouseLeaveParentSelector);
            warnDeprecations(COMPONENT_NAME, props, {
                positionInSet: 'ariaPosInSet',
                setSize: 'ariaSetSize',
            });
        }
        _this.isNavigationIdle = true;
        _this.async = new Async(_this);
        var selectedIndex;
        if (props.selectedId) {
            selectedIndex = _this._getSelectedIndex(props.colorCells, props.selectedId);
        }
        _this.state = {
            selectedIndex: selectedIndex,
        };
        return _this;
    }
    SwatchColorPickerBase.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
        if (newProps.selectedId !== undefined) {
            this.setState({
                selectedIndex: this._getSelectedIndex(newProps.colorCells, newProps.selectedId),
            });
        }
    };
    SwatchColorPickerBase.prototype.componentWillUnmount = function () {
        if (this.props.onCellFocused && this._cellFocused) {
            this._cellFocused = false;
            this.props.onCellFocused();
        }
        this.async.dispose();
    };
    SwatchColorPickerBase.prototype.render = function () {
        var _a = this.props, colorCells = _a.colorCells, columnCount = _a.columnCount, 
        /* eslint-disable deprecation/deprecation */
        _b = _a.ariaPosInSet, 
        /* eslint-disable deprecation/deprecation */
        ariaPosInSet = _b === void 0 ? this.props.positionInSet : _b, _c = _a.ariaSetSize, ariaSetSize = _c === void 0 ? this.props.setSize : _c, 
        /* eslint-enable deprecation/deprecation */
        shouldFocusCircularNavigate = _a.shouldFocusCircularNavigate, className = _a.className, doNotContainWithinFocusZone = _a.doNotContainWithinFocusZone, styles = _a.styles, cellMargin = _a.cellMargin;
        var classNames = getClassNames(styles, {
            theme: this.props.theme,
            className: className,
            cellMargin: cellMargin,
        });
        if (colorCells.length < 1 || columnCount < 1) {
            return null;
        }
        return (React.createElement(ButtonGrid, __assign({}, this.props, { id: this._id, items: this._getItemsWithIndex(colorCells), columnCount: columnCount, onRenderItem: this._onRenderItem, ariaPosInSet: ariaPosInSet, ariaSetSize: ariaSetSize, shouldFocusCircularNavigate: shouldFocusCircularNavigate, doNotContainWithinFocusZone: doNotContainWithinFocusZone, onBlur: this._onSwatchColorPickerBlur, theme: this.props.theme, styles: {
                root: classNames.root,
                tableCell: classNames.tableCell,
                focusedContainer: classNames.focusedContainer,
            } })));
    };
    /**
     * Get the selected item's index
     * @param items - The items to search
     * @param selectedId - The selected item's id to find
     * @returns - The index of the selected item's id, -1 if there was no match
     */
    SwatchColorPickerBase.prototype._getSelectedIndex = function (items, selectedId) {
        var selectedIndex = findIndex(items, function (item) { return item.id === selectedId; });
        return selectedIndex >= 0 ? selectedIndex : undefined;
    };
    SwatchColorPickerBase.defaultProps = {
        cellShape: 'circle',
        disabled: false,
        shouldFocusCircularNavigate: true,
        cellMargin: 10,
    };
    return SwatchColorPickerBase;
}(React.Component));
export { SwatchColorPickerBase };
//# sourceMappingURL=SwatchColorPicker.base.js.map