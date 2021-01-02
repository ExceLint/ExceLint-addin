"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Utilities_1 = require("../../Utilities");
var COMPONENT_NAME = 'PivotItem';
var PivotItem = /** @class */ (function (_super) {
    tslib_1.__extends(PivotItem, _super);
    function PivotItem(props) {
        var _this = _super.call(this, props) || this;
        Utilities_1.initializeComponentRef(_this);
        Utilities_1.warnDeprecations(COMPONENT_NAME, props, {
            linkText: 'headerText',
        });
        return _this;
    }
    PivotItem.prototype.render = function () {
        return React.createElement("div", tslib_1.__assign({}, Utilities_1.getNativeProps(this.props, Utilities_1.divProperties)), this.props.children);
    };
    return PivotItem;
}(React.Component));
exports.PivotItem = PivotItem;
//# sourceMappingURL=PivotItem.js.map