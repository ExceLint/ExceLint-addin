"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var FocusZone_1 = require("../../FocusZone");
var getClassNames = Utilities_1.classNamesFunction();
var ButtonGridBase = /** @class */ (function (_super) {
    tslib_1.__extends(ButtonGridBase, _super);
    function ButtonGridBase(props) {
        var _this = _super.call(this, props) || this;
        Utilities_1.initializeComponentRef(_this);
        _this._id = props.id || Utilities_1.getId();
        return _this;
    }
    ButtonGridBase.prototype.render = function () {
        var _this = this;
        var props = this.props;
        var items = props.items, columnCount = props.columnCount, onRenderItem = props.onRenderItem, 
        /* eslint-disable deprecation/deprecation */
        _a = props.ariaPosInSet, 
        /* eslint-disable deprecation/deprecation */
        ariaPosInSet = _a === void 0 ? props.positionInSet : _a, _b = props.ariaSetSize, ariaSetSize = _b === void 0 ? props.setSize : _b, 
        /* eslint-enable deprecation/deprecation */
        styles = props.styles, doNotContainWithinFocusZone = props.doNotContainWithinFocusZone;
        var htmlProps = Utilities_1.getNativeProps(this.props, Utilities_1.htmlElementProperties, 
        // avoid applying onBlur on the table if it's being used in the FocusZone
        doNotContainWithinFocusZone ? [] : ['onBlur']);
        var classNames = getClassNames(styles, { theme: this.props.theme });
        // Array to store the cells in the correct row index
        var rowsOfItems = Utilities_1.toMatrix(items, columnCount);
        var content = (React.createElement("table", tslib_1.__assign({ "aria-posinset": ariaPosInSet, "aria-setsize": ariaSetSize, id: this._id, role: "grid" }, htmlProps, { className: classNames.root }),
            React.createElement("tbody", null, rowsOfItems.map(function (rows, rowIndex) {
                return (React.createElement("tr", { role: 'row', key: _this._id + '-' + rowIndex + '-row' }, rows.map(function (cell, cellIndex) {
                    return (React.createElement("td", { role: 'presentation', key: _this._id + '-' + cellIndex + '-cell', className: classNames.tableCell }, onRenderItem(cell, cellIndex)));
                })));
            }))));
        // Create the table/grid
        return doNotContainWithinFocusZone ? (content) : (React.createElement(FocusZone_1.FocusZone, { isCircularNavigation: this.props.shouldFocusCircularNavigate, className: classNames.focusedContainer, onBlur: this.props.onBlur }, content));
    };
    return ButtonGridBase;
}(React.Component));
exports.ButtonGridBase = ButtonGridBase;
/**
 * @deprecated - use ButtonGridBase instead
 */
exports.GridBase = ButtonGridBase;
//# sourceMappingURL=ButtonGrid.base.js.map