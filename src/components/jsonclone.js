"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
exports.__esModule = true;
var JSONclone = /** @class */ (function () {
    function JSONclone() {
    }
    JSONclone.clone = function (data) {
        var e_1, _a;
        if (data) {
            if (Array.isArray(data)) {
                return data.slice();
            }
            if (data.constructor === Object) {
                var obj = {};
                try {
                    for (var _b = __values(Object.keys(data)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var k = _c.value;
                        obj[k] = JSONclone.clone(data[k]);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return obj;
            }
            return data;
        }
        return null;
    };
    return JSONclone;
}());
exports.JSONclone = JSONclone;
