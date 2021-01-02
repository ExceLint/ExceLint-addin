define(["require", "exports", "tslib", "react", "../../Utilities", "../../Button"], function (require, exports, tslib_1, React, Utilities_1, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ButtonGridCell = /** @class */ (function (_super) {
        tslib_1.__extends(ButtonGridCell, _super);
        function ButtonGridCell() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._onClick = function () {
                var _a = _this.props, onClick = _a.onClick, disabled = _a.disabled, item = _a.item;
                if (onClick && !disabled) {
                    onClick(item);
                }
            };
            _this._onMouseEnter = function (ev) {
                var _a = _this.props, onHover = _a.onHover, disabled = _a.disabled, item = _a.item, onMouseEnter = _a.onMouseEnter;
                var didUpdateOnEnter = onMouseEnter && onMouseEnter(ev);
                if (!didUpdateOnEnter && onHover && !disabled) {
                    onHover(item);
                }
            };
            _this._onMouseMove = function (ev) {
                var _a = _this.props, onHover = _a.onHover, disabled = _a.disabled, item = _a.item, onMouseMove = _a.onMouseMove;
                var didUpdateOnMove = onMouseMove && onMouseMove(ev);
                if (!didUpdateOnMove && onHover && !disabled) {
                    onHover(item);
                }
            };
            _this._onMouseLeave = function (ev) {
                var _a = _this.props, onHover = _a.onHover, disabled = _a.disabled, onMouseLeave = _a.onMouseLeave;
                var didUpdateOnLeave = onMouseLeave && onMouseLeave(ev);
                if (!didUpdateOnLeave && onHover && !disabled) {
                    onHover();
                }
            };
            _this._onFocus = function () {
                var _a = _this.props, onFocus = _a.onFocus, disabled = _a.disabled, item = _a.item;
                if (onFocus && !disabled) {
                    onFocus(item);
                }
            };
            return _this;
        }
        ButtonGridCell.prototype.render = function () {
            var _a;
            var _b = this.props, item = _b.item, id = _b.id, className = _b.className, role = _b.role, selected = _b.selected, disabled = _b.disabled, onRenderItem = _b.onRenderItem, cellDisabledStyle = _b.cellDisabledStyle, cellIsSelectedStyle = _b.cellIsSelectedStyle, index = _b.index, label = _b.label, getClassNames = _b.getClassNames;
            return (React.createElement(Button_1.CommandButton, { id: id, "data-index": index, "data-is-focusable": true, disabled: disabled, className: Utilities_1.css(className, (_a = {},
                    _a['' + cellIsSelectedStyle] = selected,
                    _a['' + cellDisabledStyle] = disabled,
                    _a)), onClick: this._onClick, onMouseEnter: this._onMouseEnter, onMouseMove: this._onMouseMove, onMouseLeave: this._onMouseLeave, onFocus: this._onFocus, role: role, "aria-selected": selected, ariaLabel: label, title: label, getClassNames: getClassNames }, onRenderItem(item)));
        };
        ButtonGridCell.defaultProps = {
            disabled: false,
        };
        return ButtonGridCell;
    }(React.Component));
    exports.ButtonGridCell = ButtonGridCell;
    /**
     * @deprecated - use ButtonGridCell instead
     */
    exports.GridCell = ButtonGridCell;
});
//# sourceMappingURL=ButtonGridCell.js.map