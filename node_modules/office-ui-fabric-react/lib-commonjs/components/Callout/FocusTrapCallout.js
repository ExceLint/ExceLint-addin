"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var Callout_1 = require("./Callout");
var FocusTrapZone_1 = require("../../FocusTrapZone");
/**
 * A special Callout that uses FocusTrapZone to trap focus
 * @param props - Props for the component
 */
exports.FocusTrapCallout = function (props) {
    return (React.createElement(Callout_1.Callout, tslib_1.__assign({}, props),
        React.createElement(FocusTrapZone_1.FocusTrapZone, tslib_1.__assign({ disabled: props.hidden }, props.focusTrapProps), props.children)));
};
//# sourceMappingURL=FocusTrapCallout.js.map