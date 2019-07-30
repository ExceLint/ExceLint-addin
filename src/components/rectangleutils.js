"use strict";
exports.__esModule = true;
var RectangleUtils = /** @class */ (function () {
    function RectangleUtils() {
    }
    RectangleUtils.is_adjacent = function (A, B) {
        var _a = A[0], ax1 = _a[0], ay1 = _a[1], az1 = _a[2], _b = A[1], ax2 = _b[0], ay2 = _b[1], az2 = _b[2];
        var _c = B[0], bx1 = _c[0], by1 = _c[1], bz1 = _c[2], _d = B[1], bx2 = _d[0], by2 = _d[1], bz2 = _d[2];
        var tolerance = 1;
        var adj = !(((ax1 - bx2) > tolerance)
            || ((bx1 - ax2) > tolerance)
            || ((ay1 - by2) > tolerance)
            || ((by1 - ay2) > tolerance));
        return adj;
    };
    RectangleUtils.bounding_box = function (A, B) {
        var _a = A[0], ax1 = _a[0], ay1 = _a[1], az1 = _a[2], _b = A[1], ax2 = _b[0], ay2 = _b[1], az2 = _b[2];
        var _c = B[0], bx1 = _c[0], by1 = _c[1], bz1 = _c[2], _d = B[1], bx2 = _d[0], by2 = _d[1], bz2 = _d[2];
        return [[Math.min(ax1, bx1), Math.min(ay1, by1), 0],
            [Math.max(ax2, bx2), Math.max(ay2, by2), 0]];
    };
    RectangleUtils.area = function (A) {
        var _a = A[0], ax1 = _a[0], ay1 = _a[1], az1 = _a[2], _b = A[1], ax2 = _b[0], ay2 = _b[1], az2 = _b[2];
        var length = ax2 - ax1 + 1;
        var width = ay2 - ay1 + 1;
        return length * width;
    };
    RectangleUtils.diagonal = function (A) {
        var _a = A[0], ax1 = _a[0], ay1 = _a[1], az1 = _a[2], _b = A[1], ax2 = _b[0], ay2 = _b[1], az2 = _b[2];
        var length = ax2 - ax1 + 1;
        var width = ay2 - ay1 + 1;
        return Math.sqrt(length * length + width * width);
    };
    RectangleUtils.overlap = function (A, B) {
        var _a = A[0], ax1 = _a[0], ay1 = _a[1], az1 = _a[2], _b = A[1], ax2 = _b[0], ay2 = _b[1], az2 = _b[2];
        var _c = B[0], bx1 = _c[0], by1 = _c[1], bz1 = _c[2], _d = B[1], bx2 = _d[0], by2 = _d[1], bz2 = _d[2];
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
