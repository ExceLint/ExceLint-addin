"use strict";
// colorutils
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
var ColorUtils = /** @class */ (function () {
    function ColorUtils() {
    }
    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSV representation
     */
    ColorUtils.RGBtoHSV = function (r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min) {
            h = 0; // achromatic
        }
        else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, v];
    };
    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 255].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  v       The value
     * @return  Array           The RGB representation
     */
    ColorUtils.HSVtoRGB = function (h, s, v) {
        var r, g, b;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [r * 255, g * 255, b * 255];
    };
    ColorUtils.adjust_brightness = function (color, multiplier) {
        var c = ColorUtils.rgb_ex.exec(color);
        var _a = __read([parseInt(c[1], 16), parseInt(c[2], 16), parseInt(c[3], 16)], 3), r = _a[0], g = _a[1], b = _a[2];
        var _b = __read(ColorUtils.RGBtoHSV(r, g, b), 3), h = _b[0], s = _b[1], v = _b[2];
        v = multiplier * v;
        if (v <= 0.0) {
            v = 0.0;
        }
        if (v >= 1.0) {
            v = 0.99;
        }
        var rgb = ColorUtils.HSVtoRGB(h, s, v);
        var _c = __read(rgb.map(function (x) { return Math.round(x).toString(16).padStart(2, '0'); }), 3), rs = _c[0], gs = _c[1], bs = _c[2];
        var str = '#' + rs + gs + bs;
        str = str.toUpperCase();
        return str;
    };
    ColorUtils.rgb_ex = new RegExp('#([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])([A-Za-z0-9][A-Za-z0-9])');
    return ColorUtils;
}());
exports.ColorUtils = ColorUtils;
