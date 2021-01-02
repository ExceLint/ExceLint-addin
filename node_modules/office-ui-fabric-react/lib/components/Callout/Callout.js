import { __assign, __extends, __rest } from "tslib";
import * as React from 'react';
import { CalloutContent } from './CalloutContent';
import { Layer } from '../../Layer';
var Callout = /** @class */ (function (_super) {
    __extends(Callout, _super);
    function Callout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Callout.prototype.render = function () {
        var _a = this.props, layerProps = _a.layerProps, rest = __rest(_a, ["layerProps"]);
        var content = React.createElement(CalloutContent, __assign({}, rest));
        return this.props.doNotLayer ? content : React.createElement(Layer, __assign({}, layerProps), content);
    };
    return Callout;
}(React.Component));
export { Callout };
//# sourceMappingURL=Callout.js.map