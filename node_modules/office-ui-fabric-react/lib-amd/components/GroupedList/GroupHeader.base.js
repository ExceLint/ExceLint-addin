define(["require", "exports", "tslib", "react", "../../Utilities", "../../utilities/selection/index", "../../Check", "../../Icon", "./GroupSpacer", "../../Spinner"], function (require, exports, tslib_1, React, Utilities_1, index_1, Check_1, Icon_1, GroupSpacer_1, Spinner_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getClassNames = Utilities_1.classNamesFunction();
    var GroupHeaderBase = /** @class */ (function (_super) {
        tslib_1.__extends(GroupHeaderBase, _super);
        function GroupHeaderBase(props) {
            var _this = _super.call(this, props) || this;
            _this._toggleCollapse = function () {
                var _a = _this.props, group = _a.group, onToggleCollapse = _a.onToggleCollapse, isGroupLoading = _a.isGroupLoading;
                var isCollapsed = _this.state.isCollapsed;
                var newCollapsed = !isCollapsed;
                var newLoadingVisible = !newCollapsed && isGroupLoading && isGroupLoading(group);
                _this.setState({
                    isCollapsed: newCollapsed,
                    isLoadingVisible: newLoadingVisible,
                });
                if (onToggleCollapse) {
                    onToggleCollapse(group);
                }
            };
            _this._onKeyUp = function (ev) {
                var _a = _this.props, group = _a.group, onGroupHeaderKeyUp = _a.onGroupHeaderKeyUp;
                if (onGroupHeaderKeyUp) {
                    onGroupHeaderKeyUp(ev, group);
                }
                if (!ev.defaultPrevented) {
                    var shouldOpen = _this.state.isCollapsed && ev.which === Utilities_1.getRTLSafeKeyCode(Utilities_1.KeyCodes.right, _this.props.theme);
                    var shouldClose = !_this.state.isCollapsed && ev.which === Utilities_1.getRTLSafeKeyCode(Utilities_1.KeyCodes.left, _this.props.theme);
                    if (shouldClose || shouldOpen) {
                        _this._toggleCollapse();
                        ev.stopPropagation();
                        ev.preventDefault();
                    }
                }
            };
            _this._onToggleClick = function (ev) {
                _this._toggleCollapse();
                ev.stopPropagation();
                ev.preventDefault();
            };
            _this._onToggleSelectGroupClick = function (ev) {
                var _a = _this.props, onToggleSelectGroup = _a.onToggleSelectGroup, group = _a.group;
                if (onToggleSelectGroup) {
                    onToggleSelectGroup(group);
                }
                ev.preventDefault();
                ev.stopPropagation();
            };
            _this._onHeaderClick = function () {
                var _a = _this.props, group = _a.group, onGroupHeaderClick = _a.onGroupHeaderClick, onToggleSelectGroup = _a.onToggleSelectGroup;
                if (onGroupHeaderClick) {
                    onGroupHeaderClick(group);
                }
                else if (onToggleSelectGroup) {
                    onToggleSelectGroup(group);
                }
            };
            _this._onRenderTitle = function (props) {
                var group = props.group, ariaColSpan = props.ariaColSpan;
                if (!group) {
                    return null;
                }
                return (React.createElement("div", { className: _this._classNames.title, role: "gridcell", "aria-colspan": ariaColSpan },
                    React.createElement("span", null, group.name),
                    React.createElement("span", { className: _this._classNames.headerCount },
                        "(",
                        group.count,
                        group.hasMoreData && '+',
                        ")")));
            };
            _this.state = {
                isCollapsed: (_this.props.group && _this.props.group.isCollapsed),
                isLoadingVisible: false,
            };
            return _this;
        }
        GroupHeaderBase.getDerivedStateFromProps = function (nextProps, previousState) {
            if (nextProps.group) {
                var newCollapsed = nextProps.group.isCollapsed;
                var isGroupLoading = nextProps.isGroupLoading;
                var newLoadingVisible = !newCollapsed && isGroupLoading && isGroupLoading(nextProps.group);
                return tslib_1.__assign(tslib_1.__assign({}, previousState), { isCollapsed: newCollapsed || false, isLoadingVisible: newLoadingVisible || false });
            }
            return previousState;
        };
        GroupHeaderBase.prototype.render = function () {
            var _a = this.props, group = _a.group, _b = _a.groupLevel, groupLevel = _b === void 0 ? 0 : _b, viewport = _a.viewport, selectionMode = _a.selectionMode, loadingText = _a.loadingText, 
            // eslint-disable-next-line deprecation/deprecation
            _c = _a.isSelected, 
            // eslint-disable-next-line deprecation/deprecation
            isSelected = _c === void 0 ? false : _c, _d = _a.selected, selected = _d === void 0 ? false : _d, indentWidth = _a.indentWidth, _e = _a.onRenderTitle, onRenderTitle = _e === void 0 ? this._onRenderTitle : _e, onRenderGroupHeaderCheckbox = _a.onRenderGroupHeaderCheckbox, _f = _a.isCollapsedGroupSelectVisible, isCollapsedGroupSelectVisible = _f === void 0 ? true : _f, expandButtonProps = _a.expandButtonProps, expandButtonIcon = _a.expandButtonIcon, selectAllButtonProps = _a.selectAllButtonProps, theme = _a.theme, styles = _a.styles, className = _a.className, compact = _a.compact, ariaPosInSet = _a.ariaPosInSet, ariaSetSize = _a.ariaSetSize, useFastIcons = _a.useFastIcons;
            var defaultCheckboxRender = useFastIcons ? this._fastDefaultCheckboxRender : this._defaultCheckboxRender;
            var onRenderCheckbox = onRenderGroupHeaderCheckbox
                ? Utilities_1.composeRenderFunction(onRenderGroupHeaderCheckbox, defaultCheckboxRender)
                : defaultCheckboxRender;
            var _g = this.state, isCollapsed = _g.isCollapsed, isLoadingVisible = _g.isLoadingVisible;
            var canSelectGroup = selectionMode === index_1.SelectionMode.multiple;
            var isSelectionCheckVisible = canSelectGroup && (isCollapsedGroupSelectVisible || !(group && group.isCollapsed));
            var currentlySelected = selected || isSelected;
            var isRTL = Utilities_1.getRTL(theme);
            this._classNames = getClassNames(styles, {
                theme: theme,
                className: className,
                selected: currentlySelected,
                isCollapsed: isCollapsed,
                compact: compact,
            });
            if (!group) {
                return null;
            }
            return (React.createElement("div", { className: this._classNames.root, style: viewport ? { minWidth: viewport.width } : {}, onClick: this._onHeaderClick, role: "row", "aria-setsize": ariaSetSize, "aria-posinset": ariaPosInSet, "data-is-focusable": true, onKeyUp: this._onKeyUp, "aria-label": group.ariaLabel || group.name, "aria-expanded": !this.state.isCollapsed, "aria-level": groupLevel + 1 },
                React.createElement("div", { className: this._classNames.groupHeaderContainer, role: "presentation" },
                    isSelectionCheckVisible ? (React.createElement("div", { role: "gridcell" },
                        React.createElement("button", tslib_1.__assign({ "data-is-focusable": false, type: "button", className: this._classNames.check, role: "checkbox", "aria-checked": currentlySelected, "data-selection-toggle": true, onClick: this._onToggleSelectGroupClick }, selectAllButtonProps), onRenderCheckbox({ checked: currentlySelected, theme: theme }, onRenderCheckbox)))) : (selectionMode !== index_1.SelectionMode.none && React.createElement(GroupSpacer_1.GroupSpacer, { indentWidth: indentWidth, count: 1 })),
                    React.createElement(GroupSpacer_1.GroupSpacer, { indentWidth: indentWidth, count: groupLevel }),
                    React.createElement("div", { className: this._classNames.dropIcon, role: "presentation" },
                        React.createElement(Icon_1.Icon, { iconName: "Tag" })),
                    React.createElement("div", { role: "gridcell" },
                        React.createElement("button", tslib_1.__assign({ "data-is-focusable": false, type: "button", className: this._classNames.expand, onClick: this._onToggleClick, "aria-expanded": !this.state.isCollapsed }, expandButtonProps),
                            React.createElement(Icon_1.Icon, { className: this._classNames.expandIsCollapsed, iconName: expandButtonIcon || (isRTL ? 'ChevronLeftMed' : 'ChevronRightMed') }))),
                    onRenderTitle(this.props, this._onRenderTitle),
                    isLoadingVisible && React.createElement(Spinner_1.Spinner, { label: loadingText }))));
        };
        GroupHeaderBase.prototype._defaultCheckboxRender = function (checkboxProps) {
            return React.createElement(Check_1.Check, { checked: checkboxProps.checked });
        };
        GroupHeaderBase.prototype._fastDefaultCheckboxRender = function (checkboxProps) {
            return React.createElement(FastCheck, { theme: checkboxProps.theme, checked: checkboxProps.checked });
        };
        GroupHeaderBase.defaultProps = {
            expandButtonProps: { 'aria-label': 'expand collapse group' },
        };
        return GroupHeaderBase;
    }(React.Component));
    exports.GroupHeaderBase = GroupHeaderBase;
    var FastCheck = React.memo(function (props) {
        return React.createElement(Check_1.Check, { theme: props.theme, checked: props.checked, className: props.className, useFastIcons: true });
    });
});
//# sourceMappingURL=GroupHeader.base.js.map