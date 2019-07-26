"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
var RectangleUtils = /** @class */ (function () {
    function RectangleUtils() {
    }
    RectangleUtils.is_adjacent = function (A, B) {
        var _a = __read(A, 2), _b = __read(_a[0], 3), ax1 = _b[0], ay1 = _b[1], az1 = _b[2], _c = __read(_a[1], 3), ax2 = _c[0], ay2 = _c[1], az2 = _c[2];
        var _d = __read(B, 2), _e = __read(_d[0], 3), bx1 = _e[0], by1 = _e[1], bz1 = _e[2], _f = __read(_d[1], 3), bx2 = _f[0], by2 = _f[1], bz2 = _f[2];
        var tolerance = 1;
        var adj = !(((ax1 - bx2) > tolerance)
            || ((bx1 - ax2) > tolerance)
            || ((ay1 - by2) > tolerance)
            || ((by1 - ay2) > tolerance));
        return adj;
    };
    RectangleUtils.bounding_box = function (A, B) {
        var _a = __read(A, 2), _b = __read(_a[0], 3), ax1 = _b[0], ay1 = _b[1], az1 = _b[2], _c = __read(_a[1], 3), ax2 = _c[0], ay2 = _c[1], az2 = _c[2];
        var _d = __read(B, 2), _e = __read(_d[0], 3), bx1 = _e[0], by1 = _e[1], bz1 = _e[2], _f = __read(_d[1], 3), bx2 = _f[0], by2 = _f[1], bz2 = _f[2];
        return [[Math.min(ax1, bx1), Math.min(ay1, by1), 0],
            [Math.max(ax2, bx2), Math.max(ay2, by2), 0]];
    };
    RectangleUtils.area = function (A) {
        var _a = __read(A, 2), _b = __read(_a[0], 3), ax1 = _b[0], ay1 = _b[1], az1 = _b[2], _c = __read(_a[1], 3), ax2 = _c[0], ay2 = _c[1], az2 = _c[2];
        var length = ax2 - ax1 + 1;
        var width = ay2 - ay1 + 1;
        return length * width;
    };
    RectangleUtils.diagonal = function (A) {
        var _a = __read(A, 2), _b = __read(_a[0], 3), ax1 = _b[0], ay1 = _b[1], az1 = _b[2], _c = __read(_a[1], 3), ax2 = _c[0], ay2 = _c[1], az2 = _c[2];
        var length = ax2 - ax1 + 1;
        var width = ay2 - ay1 + 1;
        return Math.sqrt(length * length + width * width);
    };
    RectangleUtils.overlap = function (A, B) {
        var _a = __read(A, 2), _b = __read(_a[0], 3), ax1 = _b[0], ay1 = _b[1], az1 = _b[2], _c = __read(_a[1], 3), ax2 = _c[0], ay2 = _c[1], az2 = _c[2];
        var _d = __read(B, 2), _e = __read(_d[0], 3), bx1 = _e[0], by1 = _e[1], bz1 = _e[2], _f = __read(_d[1], 3), bx2 = _f[0], by2 = _f[1], bz2 = _f[2];
        var width = 0, height = 0;
        if (ax2 > bx2) {
            width = bx2 - ax1 + 1;
        }
        else {
            width = ax2 - bx1 + 1;
        }
        if (ay2 > by2) {
            height = by2 - ay1 + 1;
        }
        else {
            height = ay2 - by1 + 1;
        }
        return width * height; // Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1)) * Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
    };
    RectangleUtils.is_mergeable = function (A, B) {
        return RectangleUtils.is_adjacent(A, B)
            && (RectangleUtils.area(A) + RectangleUtils.area(B) - RectangleUtils.overlap(A, B) === RectangleUtils.area(RectangleUtils.bounding_box(A, B)));
    };
    return RectangleUtils;
}());
exports.RectangleUtils = RectangleUtils;
