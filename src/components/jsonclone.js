"use strict";
exports.__esModule = true;
var JSONclone = /** @class */ (function () {
    function JSONclone() {
    }
    JSONclone.clone = function (data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.slice();
            }
            if (data.constructor === Object) {
                var obj = {};
                for (var _i = 0, _a = Object.keys(data); _i < _a.length; _i++) {
                    var k = _a[_i];
                    obj[k] = JSONclone.clone(data[k]);
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
