"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var Callout_1 = require("../../Callout");
var Checkbox_1 = require("../../Checkbox");
var Button_1 = require("../../Button");
var DirectionalHint_1 = require("../../common/DirectionalHint");
var Dropdown_types_1 = require("./Dropdown.types");
var DropdownSizePosCache_1 = require("./utilities/DropdownSizePosCache");
var FocusZone_1 = require("../../FocusZone");
var Icon_1 = require("../../Icon");
var Label_1 = require("../../Label");
var KeytipData_1 = require("../../KeytipData");
var Panel_1 = require("../../Panel");
var withResponsiveMode_1 = require("../../utilities/decorators/withResponsiveMode");
var index_1 = require("../../utilities/selectableOption/index");
var getClassNames = Utilities_1.classNamesFunction();
var DropdownBase = /** @class */ (function (_super) {
    tslib_1.__extends(DropdownBase, _super);
    function DropdownBase(props) {
        var _this = _super.call(this, props) || this;
        _this._host = React.createRef();
        _this._focusZone = React.createRef();
        _this._dropDown = React.createRef();
        _this._scrollIdleDelay = 250 /* ms */;
        _this._sizePosCache = new DropdownSizePosCache_1.DropdownSizePosCache();
        _this._requestAnimationFrame = Utilities_1.safeRequestAnimationFrame(_this);
        _this._onChange = function (event, options, index, checked, multiSelect) {
            // eslint-disable-next-line deprecation/deprecation
            var _a = _this.props, onChange = _a.onChange, onChanged = _a.onChanged;
            if (onChange || onChanged) {
                // for single-select, option passed in will always be selected.
                // for multi-select, flip the checked value
                var changedOpt = multiSelect ? tslib_1.__assign(tslib_1.__assign({}, options[index]), { selected: !checked }) : options[index];
                onChange && onChange(tslib_1.__assign(tslib_1.__assign({}, event), { target: _this._dropDown.current }), changedOpt, index);
                onChanged && onChanged(changedOpt, index);
            }
        };
        /** Get either props.placeholder (new name) or props.placeHolder (old name) */
        _this._getPlaceholder = function () {
            // eslint-disable-next-line deprecation/deprecation
            return _this.props.placeholder || _this.props.placeHolder;
        };
        /** Get text in dropdown input as a string */
        _this._getTitle = function (items, _unused) {
            var _a = _this.props.multiSelectDelimiter, multiSelectDelimiter = _a === void 0 ? ', ' : _a;
            return items.map(function (i) { return i.text; }).join(multiSelectDelimiter);
        };
        /** Render text in dropdown input */
        _this._onRenderTitle = function (items) {
            return React.createElement(React.Fragment, null, _this._getTitle(items));
        };
        /** Render placeholder text in dropdown input */
        _this._onRenderPlaceholder = function (props) {
            if (!_this._getPlaceholder()) {
                return null;
            }
            return React.createElement(React.Fragment, null, _this._getPlaceholder());
        };
        /** Render Callout or Panel container and pass in list */
        _this._onRenderContainer = function (props) {
            var calloutProps = props.calloutProps, panelProps = props.panelProps;
            var _a = _this.props, responsiveMode = _a.responsiveMode, dropdownWidth = _a.dropdownWidth;
            var isSmall = responsiveMode <= withResponsiveMode_1.ResponsiveMode.medium;
            var panelStyles = _this._classNames.subComponentStyles
                ? _this._classNames.subComponentStyles.panel
                : undefined;
            return isSmall ? (React.createElement(Panel_1.Panel, tslib_1.__assign({ isOpen: true, isLightDismiss: true, onDismiss: _this._onDismiss, hasCloseButton: false, styles: panelStyles }, panelProps), _this._renderFocusableList(props))) : (React.createElement(Callout_1.Callout, tslib_1.__assign({ isBeakVisible: false, gapSpace: 0, doNotLayer: false, directionalHintFixed: false, directionalHint: DirectionalHint_1.DirectionalHint.bottomLeftEdge }, calloutProps, { className: _this._classNames.callout, target: _this._dropDown.current, onDismiss: _this._onDismiss, onScroll: _this._onScroll, onPositioned: _this._onPositioned, calloutWidth: dropdownWidth || (_this._dropDown.current ? _this._dropDown.current.clientWidth : 0) }), _this._renderFocusableList(props)));
        };
        /** Render Caret Down Icon */
        _this._onRenderCaretDown = function (props) {
            return React.createElement(Icon_1.Icon, { className: _this._classNames.caretDown, iconName: "ChevronDown", "aria-hidden": true });
        };
        /** Render List of items */
        _this._onRenderList = function (props) {
            var _a = props.onRenderItem, onRenderItem = _a === void 0 ? _this._onRenderItem : _a;
            var queue = { items: [] };
            var renderedList = [];
            var emptyQueue = function () {
                var newGroup = queue.id
                    ? [
                        React.createElement("div", { role: "group", key: queue.id, "aria-labelledby": queue.id }, queue.items),
                    ]
                    : queue.items;
                renderedList = tslib_1.__spreadArrays(renderedList, newGroup);
                // Flush items and id
                queue = { items: [] };
            };
            var placeRenderedOptionIntoQueue = function (item, index) {
                /*
                  Case Header
                    empty queue if it's not already empty
                    ensure unique ID for header and set queue ID
                    push header into queue
                  Case Divider
                    push divider into queue if not first item
                    empty queue if not already empty
                  Default
                    push item into queue
                */
                switch (item.itemType) {
                    case index_1.SelectableOptionMenuItemType.Header:
                        queue.items.length > 0 && emptyQueue();
                        var id = _this._id + item.key;
                        queue.items.push(onRenderItem(tslib_1.__assign(tslib_1.__assign({ id: id }, item), { index: index }), _this._onRenderItem));
                        queue.id = id;
                        break;
                    case index_1.SelectableOptionMenuItemType.Divider:
                        index > 0 && queue.items.push(onRenderItem(tslib_1.__assign(tslib_1.__assign({}, item), { index: index }), _this._onRenderItem));
                        queue.items.length > 0 && emptyQueue();
                        break;
                    default:
                        queue.items.push(onRenderItem(tslib_1.__assign(tslib_1.__assign({}, item), { index: index }), _this._onRenderItem));
                }
            };
            // Place options into the queue. Queue will be emptied anytime a Header or Divider is encountered
            props.options.forEach(function (item, index) {
                placeRenderedOptionIntoQueue(item, index);
            });
            // Push remaining items into all renderedList
            queue.items.length > 0 && emptyQueue();
            return React.createElement(React.Fragment, null, renderedList);
        };
        _this._onRenderItem = function (item) {
            switch (item.itemType) {
                case index_1.SelectableOptionMenuItemType.Divider:
                    return _this._renderSeparator(item);
                case index_1.SelectableOptionMenuItemType.Header:
                    return _this._renderHeader(item);
                default:
                    return _this._renderOption(item);
            }
        };
        _this._renderOption = function (item) {
            var _a = _this.props.onRenderOption, onRenderOption = _a === void 0 ? _this._onRenderOption : _a;
            var _b = _this.state.selectedIndices, selectedIndices = _b === void 0 ? [] : _b;
            var isItemSelected = item.index !== undefined && selectedIndices ? selectedIndices.indexOf(item.index) > -1 : false;
            // select the right className based on the combination of selected/disabled
            var itemClassName = item.hidden // predicate: item hidden
                ? _this._classNames.dropdownItemHidden
                : isItemSelected && item.disabled === true // predicate: both selected and disabled
                    ? _this._classNames.dropdownItemSelectedAndDisabled
                    : isItemSelected // predicate: selected only
                        ? _this._classNames.dropdownItemSelected
                        : item.disabled === true // predicate: disabled only
                            ? _this._classNames.dropdownItemDisabled
                            : _this._classNames.dropdownItem;
            var _c = item.title, title = _c === void 0 ? item.text : _c;
            var multiSelectItemStyles = _this._classNames.subComponentStyles
                ? _this._classNames.subComponentStyles.multiSelectItem
                : undefined;
            return !_this.props.multiSelect ? (React.createElement(Button_1.CommandButton, { id: _this._listId + item.index, key: item.key, "data-index": item.index, "data-is-focusable": !item.disabled, disabled: item.disabled, className: itemClassName, onClick: _this._onItemClick(item), 
                // eslint-disable-next-line react/jsx-no-bind
                onMouseEnter: _this._onItemMouseEnter.bind(_this, item), 
                // eslint-disable-next-line react/jsx-no-bind
                onMouseLeave: _this._onMouseItemLeave.bind(_this, item), 
                // eslint-disable-next-line react/jsx-no-bind
                onMouseMove: _this._onItemMouseMove.bind(_this, item), role: "option", "aria-selected": isItemSelected ? 'true' : 'false', ariaLabel: item.ariaLabel, title: title, "aria-posinset": _this._sizePosCache.positionInSet(item.index), "aria-setsize": _this._sizePosCache.optionSetSize }, onRenderOption(item, _this._onRenderOption))) : (React.createElement(Checkbox_1.Checkbox, { id: _this._listId + item.index, key: item.key, "data-index": item.index, "data-is-focusable": !item.disabled, disabled: item.disabled, onChange: _this._onItemClick(item), inputProps: {
                    'aria-selected': isItemSelected,
                    onMouseEnter: _this._onItemMouseEnter.bind(_this, item),
                    onMouseLeave: _this._onMouseItemLeave.bind(_this, item),
                    onMouseMove: _this._onItemMouseMove.bind(_this, item),
                    role: 'option',
                }, label: item.text, title: title, 
                // eslint-disable-next-line react/jsx-no-bind
                onRenderLabel: _this._onRenderItemLabel.bind(_this, item), className: itemClassName, checked: isItemSelected, styles: multiSelectItemStyles, ariaPositionInSet: _this._sizePosCache.positionInSet(item.index), ariaSetSize: _this._sizePosCache.optionSetSize }));
        };
        /** Render content of item (i.e. text/icon inside of button) */
        _this._onRenderOption = function (item) {
            return React.createElement("span", { className: _this._classNames.dropdownOptionText }, item.text);
        };
        /** Render custom label for drop down item */
        _this._onRenderItemLabel = function (item) {
            var _a = _this.props.onRenderOption, onRenderOption = _a === void 0 ? _this._onRenderOption : _a;
            return onRenderOption(item, _this._onRenderOption);
        };
        _this._onPositioned = function (positions) {
            if (_this._focusZone.current) {
                // Focusing an element can trigger a reflow. Making this wait until there is an animation
                // frame can improve perf significantly.
                _this._requestAnimationFrame(function () {
                    var selectedIndices = _this.state.selectedIndices;
                    if (_this._focusZone.current) {
                        if (selectedIndices && selectedIndices[0] && !_this.props.options[selectedIndices[0]].disabled) {
                            var element = Utilities_1.getDocument().getElementById(_this._id + "-list" + selectedIndices[0]);
                            if (element) {
                                _this._focusZone.current.focusElement(element);
                            }
                        }
                        else {
                            _this._focusZone.current.focus();
                        }
                    }
                });
            }
            if (!_this.state.calloutRenderEdge || _this.state.calloutRenderEdge !== positions.targetEdge) {
                _this.setState({
                    calloutRenderEdge: positions.targetEdge,
                });
            }
        };
        _this._onItemClick = function (item) {
            return function (event) {
                if (!item.disabled) {
                    _this.setSelectedIndex(event, item.index);
                    if (!_this.props.multiSelect) {
                        // only close the callout when it's in single-select mode
                        _this.setState({
                            isOpen: false,
                        });
                    }
                }
            };
        };
        /**
         * Scroll handler for the callout to make sure the mouse events
         * for updating focus are not interacting during scroll
         */
        _this._onScroll = function () {
            if (!_this._isScrollIdle && _this._scrollIdleTimeoutId !== undefined) {
                clearTimeout(_this._scrollIdleTimeoutId);
                _this._scrollIdleTimeoutId = undefined;
            }
            else {
                _this._isScrollIdle = false;
            }
            _this._scrollIdleTimeoutId = setTimeout(function () {
                _this._isScrollIdle = true;
            }, _this._scrollIdleDelay);
        };
        _this._onMouseItemLeave = function (item, ev) {
            if (_this._shouldIgnoreMouseEvent()) {
                return;
            }
            /**
             * IE11 focus() method forces parents to scroll to top of element.
             * Edge and IE expose a setActive() function for focusable divs that
             * sets the page focus but does not scroll the parent element.
             */
            if (_this._host.current) {
                if (_this._host.current.setActive) {
                    try {
                        _this._host.current.setActive();
                    }
                    catch (e) {
                        /* no-op */
                    }
                }
                else {
                    _this._host.current.focus();
                }
            }
        };
        _this._onDismiss = function () {
            _this.setState({ isOpen: false });
        };
        _this._onDropdownBlur = function (ev) {
            // If Dropdown disabled do not proceed with this logic.
            var disabled = _this._isDisabled();
            if (disabled) {
                return;
            }
            // hasFocus tracks whether the root element has focus so always update the state.
            _this.setState({ hasFocus: false });
            if (_this.state.isOpen) {
                // Do not onBlur when the callout is opened
                return;
            }
            if (_this.props.onBlur) {
                _this.props.onBlur(ev);
            }
        };
        _this._onDropdownKeyDown = function (ev) {
            // If Dropdown disabled do not process any keyboard events.
            var disabled = _this._isDisabled();
            if (disabled) {
                return;
            }
            // Take note if we are processing an alt (option) or meta (command) keydown.
            // See comment in _shouldHandleKeyUp for reasoning.
            _this._lastKeyDownWasAltOrMeta = _this._isAltOrMeta(ev);
            if (_this.props.onKeyDown) {
                _this.props.onKeyDown(ev);
                if (ev.defaultPrevented) {
                    return;
                }
            }
            var newIndex;
            var selectedIndex = _this.state.selectedIndices.length ? _this.state.selectedIndices[0] : -1;
            var containsExpandCollapseModifier = ev.altKey || ev.metaKey;
            var isOpen = _this.state.isOpen;
            switch (ev.which) {
                case Utilities_1.KeyCodes.enter:
                    _this.setState({
                        isOpen: !isOpen,
                    });
                    break;
                case Utilities_1.KeyCodes.escape:
                    if (!isOpen) {
                        return;
                    }
                    _this.setState({
                        isOpen: false,
                    });
                    break;
                case Utilities_1.KeyCodes.up:
                    if (containsExpandCollapseModifier) {
                        if (isOpen) {
                            _this.setState({ isOpen: false });
                            break;
                        }
                        return;
                    }
                    if (_this.props.multiSelect) {
                        _this.setState({ isOpen: true });
                    }
                    else if (!_this._isDisabled()) {
                        newIndex = _this._moveIndex(ev, -1, selectedIndex - 1, selectedIndex);
                    }
                    break;
                case Utilities_1.KeyCodes.down:
                    if (containsExpandCollapseModifier) {
                        ev.stopPropagation();
                        ev.preventDefault();
                    }
                    if ((containsExpandCollapseModifier && !isOpen) || _this.props.multiSelect) {
                        _this.setState({ isOpen: true });
                    }
                    else if (!_this._isDisabled()) {
                        newIndex = _this._moveIndex(ev, 1, selectedIndex + 1, selectedIndex);
                    }
                    break;
                case Utilities_1.KeyCodes.home:
                    if (!_this.props.multiSelect) {
                        newIndex = _this._moveIndex(ev, 1, 0, selectedIndex);
                    }
                    break;
                case Utilities_1.KeyCodes.end:
                    if (!_this.props.multiSelect) {
                        newIndex = _this._moveIndex(ev, -1, _this.props.options.length - 1, selectedIndex);
                    }
                    break;
                case Utilities_1.KeyCodes.space:
                    // event handled in _onDropdownKeyUp
                    break;
                default:
                    return;
            }
            if (newIndex !== selectedIndex) {
                ev.stopPropagation();
                ev.preventDefault();
            }
        };
        _this._onDropdownKeyUp = function (ev) {
            // If Dropdown disabled do not process any keyboard events.
            var disabled = _this._isDisabled();
            if (disabled) {
                return;
            }
            var shouldHandleKey = _this._shouldHandleKeyUp(ev);
            var isOpen = _this.state.isOpen;
            if (_this.props.onKeyUp) {
                _this.props.onKeyUp(ev);
                if (ev.defaultPrevented) {
                    return;
                }
            }
            switch (ev.which) {
                case Utilities_1.KeyCodes.space:
                    _this.setState({
                        isOpen: !isOpen,
                    });
                    break;
                default:
                    if (shouldHandleKey && isOpen) {
                        _this.setState({ isOpen: false });
                    }
                    return;
            }
            ev.stopPropagation();
            ev.preventDefault();
        };
        _this._onZoneKeyDown = function (ev) {
            var elementToFocus;
            // Take note if we are processing an alt (option) or meta (command) keydown.
            // See comment in _shouldHandleKeyUp for reasoning.
            _this._lastKeyDownWasAltOrMeta = _this._isAltOrMeta(ev);
            var containsExpandCollapseModifier = ev.altKey || ev.metaKey;
            switch (ev.which) {
                case Utilities_1.KeyCodes.up:
                    if (containsExpandCollapseModifier) {
                        _this.setState({ isOpen: false });
                    }
                    else {
                        if (_this._host.current) {
                            elementToFocus = Utilities_1.getLastFocusable(_this._host.current, _this._host.current.lastChild, true);
                        }
                    }
                    break;
                // All directional keystrokes should be canceled when the zone is rendered.
                // This avoids the body scroll from reacting and thus dismissing the dropdown.
                case Utilities_1.KeyCodes.home:
                case Utilities_1.KeyCodes.end:
                case Utilities_1.KeyCodes.pageUp:
                case Utilities_1.KeyCodes.pageDown:
                    break;
                case Utilities_1.KeyCodes.down:
                    if (!containsExpandCollapseModifier && _this._host.current) {
                        elementToFocus = Utilities_1.getFirstFocusable(_this._host.current, _this._host.current.firstChild, true);
                    }
                    break;
                case Utilities_1.KeyCodes.escape:
                    _this.setState({ isOpen: false });
                    break;
                case Utilities_1.KeyCodes.tab:
                    _this.setState({ isOpen: false });
                    return;
                default:
                    return;
            }
            if (elementToFocus) {
                elementToFocus.focus();
            }
            ev.stopPropagation();
            ev.preventDefault();
        };
        _this._onZoneKeyUp = function (ev) {
            var shouldHandleKey = _this._shouldHandleKeyUp(ev);
            if (shouldHandleKey && _this.state.isOpen) {
                _this.setState({ isOpen: false });
                ev.preventDefault();
            }
        };
        _this._onDropdownClick = function (ev) {
            if (_this.props.onClick) {
                _this.props.onClick(ev);
                if (ev.defaultPrevented) {
                    return;
                }
            }
            var isOpen = _this.state.isOpen;
            var disabled = _this._isDisabled();
            if (!disabled && !_this._shouldOpenOnFocus()) {
                _this.setState({
                    isOpen: !isOpen,
                });
            }
            _this._isFocusedByClick = false; // reset
        };
        _this._onDropdownMouseDown = function () {
            _this._isFocusedByClick = true;
        };
        _this._onFocus = function (ev) {
            var _a = _this.state, isOpen = _a.isOpen, selectedIndices = _a.selectedIndices;
            var multiSelect = _this.props.multiSelect;
            var disabled = _this._isDisabled();
            if (!disabled) {
                if (!_this._isFocusedByClick && !isOpen && selectedIndices.length === 0 && !multiSelect) {
                    // Per aria: https://www.w3.org/TR/wai-aria-practices-1.1/#listbox_kbd_interaction
                    _this._moveIndex(ev, 1, 0, -1);
                }
                if (_this.props.onFocus) {
                    _this.props.onFocus(ev);
                }
                var state = { hasFocus: true };
                if (_this._shouldOpenOnFocus()) {
                    state.isOpen = true;
                }
                _this.setState(state);
            }
        };
        /**
         * Because the isDisabled prop is deprecated, we have had to repeat this logic all over the place.
         * This helper method avoids all the repetition.
         */
        _this._isDisabled = function () {
            var disabled = _this.props.disabled;
            // eslint-disable-next-line deprecation/deprecation
            var isDisabled = _this.props.isDisabled;
            // Remove this deprecation workaround at 1.0.0
            if (disabled === undefined) {
                disabled = isDisabled;
            }
            return disabled;
        };
        _this._onRenderLabel = function (props) {
            var label = props.label, required = props.required, disabled = props.disabled;
            var labelStyles = _this._classNames.subComponentStyles
                ? _this._classNames.subComponentStyles.label
                : undefined;
            return label ? (React.createElement(Label_1.Label, { className: _this._classNames.label, id: _this._labelId, required: required, styles: labelStyles, disabled: disabled }, label)) : null;
        };
        Utilities_1.initializeComponentRef(_this);
        var multiSelect = props.multiSelect, selectedKey = props.selectedKey, selectedKeys = props.selectedKeys, defaultSelectedKey = props.defaultSelectedKey, defaultSelectedKeys = props.defaultSelectedKeys, options = props.options;
        if (process.env.NODE_ENV !== 'production') {
            Utilities_1.warnDeprecations('Dropdown', props, {
                isDisabled: 'disabled',
                onChanged: 'onChange',
                placeHolder: 'placeholder',
                onRenderPlaceHolder: 'onRenderPlaceholder',
            });
            Utilities_1.warnMutuallyExclusive('Dropdown', props, {
                defaultSelectedKey: 'selectedKey',
                defaultSelectedKeys: 'selectedKeys',
                selectedKeys: 'selectedKey',
            });
            if (multiSelect) {
                var warnMultiSelect = function (prop) {
                    return Utilities_1.warn("Dropdown property '" + prop + "' cannot be used when 'multiSelect' is true. Use '" + prop + "s' instead.");
                };
                if (selectedKey !== undefined) {
                    warnMultiSelect('selectedKey');
                }
                if (defaultSelectedKey !== undefined) {
                    warnMultiSelect('defaultSelectedKey');
                }
            }
            else {
                var warnNotMultiSelect = function (prop) {
                    return Utilities_1.warn("Dropdown property '" + prop + "s' cannot be used when 'multiSelect' is false/unset. Use '" + prop + "' instead.");
                };
                if (selectedKeys !== undefined) {
                    warnNotMultiSelect('selectedKey');
                }
                if (defaultSelectedKeys !== undefined) {
                    warnNotMultiSelect('defaultSelectedKey');
                }
            }
        }
        _this._id = props.id || Utilities_1.getId('Dropdown');
        _this._labelId = _this._id + '-label';
        _this._listId = _this._id + '-list';
        _this._optionId = _this._id + '-option';
        _this._isScrollIdle = true;
        var selectedIndices;
        if (multiSelect) {
            selectedIndices = _this._getSelectedIndexes(options, defaultSelectedKeys !== undefined ? defaultSelectedKeys : selectedKeys);
        }
        else {
            selectedIndices = _this._getSelectedIndexes(options, (defaultSelectedKey !== undefined ? defaultSelectedKey : selectedKey));
        }
        _this._sizePosCache.updateOptions(options);
        _this.state = {
            isOpen: false,
            selectedIndices: selectedIndices,
            hasFocus: false,
            calloutRenderEdge: undefined,
        };
        return _this;
    }
    Object.defineProperty(DropdownBase.prototype, "selectedOptions", {
        /**
         * All selected options
         */
        get: function () {
            var options = this.props.options;
            var selectedIndices = this.state.selectedIndices;
            return index_1.getAllSelectedOptions(options, selectedIndices);
        },
        enumerable: true,
        configurable: true
    });
    DropdownBase.prototype.componentWillUnmount = function () {
        clearTimeout(this._scrollIdleTimeoutId);
    };
    DropdownBase.prototype.UNSAFE_componentWillReceiveProps = function (newProps) {
        // In controlled component usage where selectedKey is provided, update the selectedIndex
        // state if the key or options change.
        var selectedKeyProp;
        // this does a shallow compare (assumes options are pure), for the purposes of determining whether
        // defaultSelectedKey/defaultSelectedKeys are respected.
        var didOptionsChange = newProps.options !== this.props.options;
        if (newProps.multiSelect) {
            if (didOptionsChange && newProps.defaultSelectedKeys !== undefined) {
                selectedKeyProp = 'defaultSelectedKeys';
            }
            else {
                selectedKeyProp = 'selectedKeys';
            }
        }
        else {
            if (didOptionsChange && newProps.defaultSelectedKey !== undefined) {
                selectedKeyProp = 'defaultSelectedKey';
            }
            else {
                selectedKeyProp = 'selectedKey';
            }
        }
        if (newProps[selectedKeyProp] !== undefined &&
            (newProps[selectedKeyProp] !== this.props[selectedKeyProp] || didOptionsChange)) {
            this.setState({
                selectedIndices: this._getSelectedIndexes(newProps.options, newProps[selectedKeyProp]),
            });
        }
    };
    DropdownBase.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (prevState.isOpen === true && this.state.isOpen === false) {
            this._gotMouseMove = false;
            if (this.props.onDismiss) {
                this.props.onDismiss();
            }
        }
    };
    DropdownBase.prototype.render = function () {
        var _this = this;
        var _a, _b;
        var id = this._id;
        var props = this.props;
        var className = props.className, label = props.label, options = props.options, ariaLabel = props.ariaLabel, required = props.required, errorMessage = props.errorMessage, keytipProps = props.keytipProps, propStyles = props.styles, theme = props.theme, panelProps = props.panelProps, calloutProps = props.calloutProps, multiSelect = props.multiSelect, _c = props.onRenderTitle, onRenderTitle = _c === void 0 ? this._getTitle : _c, _d = props.onRenderContainer, onRenderContainer = _d === void 0 ? this._onRenderContainer : _d, _e = props.onRenderCaretDown, onRenderCaretDown = _e === void 0 ? this._onRenderCaretDown : _e, _f = props.onRenderLabel, onRenderLabel = _f === void 0 ? this._onRenderLabel : _f;
        var _g = this.state, isOpen = _g.isOpen, selectedIndices = _g.selectedIndices, calloutRenderEdge = _g.calloutRenderEdge;
        // eslint-disable-next-line deprecation/deprecation
        var onRenderPlaceholder = props.onRenderPlaceholder || props.onRenderPlaceHolder || this._getPlaceholder;
        // If our cached options are out of date update our cache
        if (options !== this._sizePosCache.cachedOptions) {
            this._sizePosCache.updateOptions(options);
        }
        var selectedOptions = index_1.getAllSelectedOptions(options, selectedIndices);
        var divProps = Utilities_1.getNativeProps(props, Utilities_1.divProperties);
        var disabled = this._isDisabled();
        var errorMessageId = id + '-errorMessage';
        var ariaActiveDescendant = disabled
            ? undefined
            : isOpen && selectedIndices.length === 1 && selectedIndices[0] >= 0
                ? this._listId + selectedIndices[0]
                : undefined;
        var ariaAttrs = multiSelect
            ? {
                role: 'button',
            }
            : // single select
                {
                    role: 'listbox',
                    childRole: 'option',
                    ariaRequired: required,
                    ariaSetSize: this._sizePosCache.optionSetSize,
                    ariaPosInSet: this._sizePosCache.positionInSet(selectedIndices[0]),
                    ariaSelected: selectedIndices[0] === undefined ? undefined : true,
                };
        this._classNames = getClassNames(propStyles, {
            theme: theme,
            className: className,
            hasError: !!(errorMessage && errorMessage.length > 0),
            hasLabel: !!label,
            isOpen: isOpen,
            required: required,
            disabled: disabled,
            isRenderingPlaceholder: !selectedOptions.length,
            panelClassName: (_a = panelProps) === null || _a === void 0 ? void 0 : _a.className,
            calloutClassName: (_b = calloutProps) === null || _b === void 0 ? void 0 : _b.className,
            calloutRenderEdge: calloutRenderEdge,
        });
        var hasErrorMessage = !!errorMessage && errorMessage.length > 0;
        return (React.createElement("div", { className: this._classNames.root },
            onRenderLabel(this.props, this._onRenderLabel),
            React.createElement(KeytipData_1.KeytipData, { keytipProps: keytipProps, disabled: disabled }, function (keytipAttributes) { return (React.createElement("div", tslib_1.__assign({}, keytipAttributes, { "data-is-focusable": !disabled, ref: _this._dropDown, id: id, tabIndex: disabled ? -1 : 0, role: ariaAttrs.role, "aria-haspopup": "listbox", "aria-expanded": isOpen ? 'true' : 'false', "aria-label": ariaLabel, "aria-labelledby": label && !ariaLabel ? Utilities_1.mergeAriaAttributeValues(_this._labelId, _this._optionId) : undefined, "aria-describedby": Utilities_1.mergeAriaAttributeValues(keytipAttributes['aria-describedby'], hasErrorMessage ? _this._id + '-errorMessage' : undefined), "aria-activedescendant": ariaActiveDescendant, "aria-required": ariaAttrs.ariaRequired, "aria-disabled": disabled, "aria-owns": isOpen ? _this._listId : undefined }, divProps, { className: _this._classNames.dropdown, onBlur: _this._onDropdownBlur, onKeyDown: _this._onDropdownKeyDown, onKeyUp: _this._onDropdownKeyUp, onClick: _this._onDropdownClick, onMouseDown: _this._onDropdownMouseDown, onFocus: _this._onFocus }),
                React.createElement("span", { id: _this._optionId, className: _this._classNames.title, "aria-live": "polite", "aria-atomic": true, "aria-invalid": hasErrorMessage, role: ariaAttrs.childRole, "aria-setsize": ariaAttrs.ariaSetSize, "aria-posinset": ariaAttrs.ariaPosInSet, "aria-selected": ariaAttrs.ariaSelected }, // If option is selected render title, otherwise render the placeholder text
                selectedOptions.length
                    ? onRenderTitle(selectedOptions, _this._onRenderTitle)
                    : onRenderPlaceholder(props, _this._onRenderPlaceholder)),
                React.createElement("span", { className: _this._classNames.caretDownWrapper }, onRenderCaretDown(props, _this._onRenderCaretDown)))); }),
            isOpen && onRenderContainer(tslib_1.__assign(tslib_1.__assign({}, props), { onDismiss: this._onDismiss }), this._onRenderContainer),
            hasErrorMessage && (React.createElement("div", { role: "alert", id: errorMessageId, className: this._classNames.errorMessage }, errorMessage))));
    };
    DropdownBase.prototype.focus = function (shouldOpenOnFocus) {
        if (this._dropDown.current) {
            this._dropDown.current.focus();
            if (shouldOpenOnFocus) {
                this.setState({
                    isOpen: true,
                });
            }
        }
    };
    DropdownBase.prototype.setSelectedIndex = function (event, index) {
        var _this = this;
        var _a = this.props, options = _a.options, selectedKey = _a.selectedKey, selectedKeys = _a.selectedKeys, multiSelect = _a.multiSelect, notifyOnReselect = _a.notifyOnReselect;
        var _b = this.state.selectedIndices, selectedIndices = _b === void 0 ? [] : _b;
        var checked = selectedIndices ? selectedIndices.indexOf(index) > -1 : false;
        var newIndexes = [];
        index = Math.max(0, Math.min(options.length - 1, index));
        // If this is a controlled component then no state change should take place.
        if (selectedKey !== undefined || selectedKeys !== undefined) {
            this._onChange(event, options, index, checked, multiSelect);
            return;
        }
        if (!multiSelect && !notifyOnReselect && index === selectedIndices[0]) {
            return;
        }
        else if (multiSelect) {
            newIndexes = selectedIndices ? this._copyArray(selectedIndices) : [];
            if (checked) {
                var position = newIndexes.indexOf(index);
                if (position > -1) {
                    // unchecked the current one
                    newIndexes.splice(position, 1);
                }
            }
            else {
                // add the new selected index into the existing one
                newIndexes.push(index);
            }
        }
        else {
            // Set the selected option if this is an uncontrolled component
            newIndexes = [index];
        }
        event.persist();
        // Call onChange after state is updated
        this.setState({
            selectedIndices: newIndexes,
        }, function () {
            _this._onChange(event, options, index, checked, multiSelect);
        });
    };
    DropdownBase.prototype._copyArray = function (array) {
        var newArray = [];
        for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
            var element = array_1[_i];
            newArray.push(element);
        }
        return newArray;
    };
    /**
     * Finds the next valid Dropdown option and sets the selected index to it.
     * @param stepValue - Value of how many items the function should traverse.  Should be -1 or 1.
     * @param index - Index of where the search should start
     * @param selectedIndex - The selectedIndex Dropdown's state
     * @returns The next valid dropdown option's index
     */
    DropdownBase.prototype._moveIndex = function (event, stepValue, index, selectedIndex) {
        var options = this.props.options;
        // Return selectedIndex if nothing has changed or options is empty
        if (selectedIndex === index || options.length === 0) {
            return selectedIndex;
        }
        // If the user is pressing the up or down key we want to make
        // sure that the dropdown cycles through the options without
        // causing the screen to scroll. In _onDropdownKeyDown
        // at the very end is a check to see if newIndex !== selectedIndex.
        // If the index is less than 0 and we set it back to 0, then
        // newIndex will equal selectedIndex and not stop the action
        // of the key press happening and vice versa for indexes greater
        // than or equal to the options length.
        if (index >= options.length) {
            index = 0;
        }
        else if (index < 0) {
            index = options.length - 1;
        }
        var stepCounter = 0;
        // If current index is a header or divider, or disabled, increment by step
        while (options[index].itemType === Dropdown_types_1.DropdownMenuItemType.Header ||
            options[index].itemType === Dropdown_types_1.DropdownMenuItemType.Divider ||
            options[index].disabled) {
            // If stepCounter exceeds length of options, then return selectedIndex (-1)
            if (stepCounter >= options.length) {
                return selectedIndex;
            }
            // If index + stepValue is out of bounds, wrap around
            if (index + stepValue < 0) {
                index = options.length;
            }
            else if (index + stepValue >= options.length) {
                index = -1;
            }
            index = index + stepValue;
            stepCounter++;
        }
        this.setSelectedIndex(event, index);
        return index;
    };
    /** Wrap item list in a FocusZone */
    DropdownBase.prototype._renderFocusableList = function (props) {
        var _a = props.onRenderList, onRenderList = _a === void 0 ? this._onRenderList : _a, label = props.label, ariaLabel = props.ariaLabel, multiSelect = props.multiSelect;
        return (React.createElement("div", { className: this._classNames.dropdownItemsWrapper, onKeyDown: this._onZoneKeyDown, onKeyUp: this._onZoneKeyUp, ref: this._host, tabIndex: 0 },
            React.createElement(FocusZone_1.FocusZone, { ref: this._focusZone, direction: FocusZone_1.FocusZoneDirection.vertical, id: this._listId, className: this._classNames.dropdownItems, role: "listbox", "aria-label": ariaLabel, "aria-labelledby": label && !ariaLabel ? this._labelId : undefined, "aria-multiselectable": multiSelect }, onRenderList(props, this._onRenderList))));
    };
    DropdownBase.prototype._renderSeparator = function (item) {
        var index = item.index, key = item.key;
        if (index > 0) {
            return React.createElement("div", { role: "separator", key: key, className: this._classNames.dropdownDivider });
        }
        return null;
    };
    DropdownBase.prototype._renderHeader = function (item) {
        var _a = this.props.onRenderOption, onRenderOption = _a === void 0 ? this._onRenderOption : _a;
        var key = item.key, id = item.id;
        return (React.createElement("div", { id: id, key: key, className: this._classNames.dropdownItemHeader }, onRenderOption(item, this._onRenderOption)));
    };
    DropdownBase.prototype._onItemMouseEnter = function (item, ev) {
        if (this._shouldIgnoreMouseEvent()) {
            return;
        }
        var targetElement = ev.currentTarget;
        targetElement.focus();
    };
    DropdownBase.prototype._onItemMouseMove = function (item, ev) {
        var targetElement = ev.currentTarget;
        this._gotMouseMove = true;
        if (!this._isScrollIdle || document.activeElement === targetElement) {
            return;
        }
        targetElement.focus();
    };
    DropdownBase.prototype._shouldIgnoreMouseEvent = function () {
        return !this._isScrollIdle || !this._gotMouseMove;
    };
    /** Get all selected indexes for multi-select mode */
    DropdownBase.prototype._getSelectedIndexes = function (options, selectedKey) {
        if (selectedKey === undefined) {
            if (this.props.multiSelect) {
                return this._getAllSelectedIndices(options);
            }
            var selectedIndex = this._getSelectedIndex(options, null);
            return selectedIndex !== -1 ? [selectedIndex] : [];
        }
        else if (!Array.isArray(selectedKey)) {
            var selectedIndex = this._getSelectedIndex(options, selectedKey);
            return selectedIndex !== -1 ? [selectedIndex] : [];
        }
        var selectedIndices = [];
        for (var _i = 0, selectedKey_1 = selectedKey; _i < selectedKey_1.length; _i++) {
            var key = selectedKey_1[_i];
            var selectedIndex = this._getSelectedIndex(options, key);
            selectedIndex !== -1 && selectedIndices.push(selectedIndex);
        }
        return selectedIndices;
    };
    DropdownBase.prototype._getAllSelectedIndices = function (options) {
        return options
            .map(function (option, index) { return (option.selected ? index : -1); })
            .filter(function (index) { return index !== -1; });
    };
    DropdownBase.prototype._getSelectedIndex = function (options, selectedKey) {
        return Utilities_1.findIndex(options, function (option) {
            // eslint-disable-next-line eqeqeq
            if (selectedKey != null) {
                return option.key === selectedKey;
            }
            else {
                // eslint-disable-next-line deprecation/deprecation
                return !!option.selected || !!option.isSelected;
            }
        });
    };
    /**
     * Returns true if the key for the event is alt (Mac option) or meta (Mac command).
     */
    DropdownBase.prototype._isAltOrMeta = function (ev) {
        return ev.which === Utilities_1.KeyCodes.alt || ev.key === 'Meta';
    };
    /**
     * We close the menu on key up only if ALL of the following are true:
     * - Most recent key down was alt or meta (command)
     * - The alt/meta key down was NOT followed by some other key (such as down/up arrow to
     *   expand/collapse the menu)
     * - We're not on a Mac (or iOS)
     *
     * This is because on Windows, pressing alt moves focus to the application menu bar or similar,
     * closing any open context menus. There is not a similar behavior on Macs.
     */
    DropdownBase.prototype._shouldHandleKeyUp = function (ev) {
        var keyPressIsAltOrMetaAlone = this._lastKeyDownWasAltOrMeta && this._isAltOrMeta(ev);
        this._lastKeyDownWasAltOrMeta = false;
        return !!keyPressIsAltOrMetaAlone && !(Utilities_1.isMac() || Utilities_1.isIOS());
    };
    /**
     * Returns true if dropdown should set to open on focus.
     * Otherwise, isOpen state should be toggled on click
     */
    DropdownBase.prototype._shouldOpenOnFocus = function () {
        var hasFocus = this.state.hasFocus;
        var openOnKeyboardFocus = this.props.openOnKeyboardFocus;
        return !this._isFocusedByClick && openOnKeyboardFocus === true && !hasFocus;
    };
    DropdownBase.defaultProps = {
        options: [],
    };
    DropdownBase = tslib_1.__decorate([
        withResponsiveMode_1.withResponsiveMode
    ], DropdownBase);
    return DropdownBase;
}(React.Component));
exports.DropdownBase = DropdownBase;
//# sourceMappingURL=Dropdown.base.js.map