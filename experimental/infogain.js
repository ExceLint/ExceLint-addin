"use strict";
exports.__esModule = true;
var InfoGain = /** @class */ (function () {
    function InfoGain() {
    }
    InfoGain.normalized_entropy = function (counts) {
        var total = counts.reduce(function (a, b) { return a + b; }, 0);
        var entropy = 0;
        for (var i = 0; i < counts.length; i++) {
            var freq = counts[i] / total;
            if (freq !== 0) {
                entropy -= freq * Math.log2(freq);
            }
        }
        return entropy / Math.log2(total);
    };
    InfoGain.salience = function (counts, index) {
        var total = counts.reduce(function (a, b) { return a + b; }, 0);
        var p_index = counts[index] / total;
        var salience = (1 - p_index) * (1 - InfoGain.normalized_entropy(counts));
        return salience;
    };
    return InfoGain;
}());
exports.InfoGain = InfoGain;
var Stencil = /** @class */ (function () {
    function Stencil() {
    }
    Stencil.initialize = function () {
        if (!Stencil.initialized) {
            //  Define boundary condition stencils by clipping the stencil at
            // the boundaries(edges and then corners).
            // NOTE: we optionally REFLECT the stencil here so it is always the same size.
            Stencil.stencil_right = Stencil.stencil.filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x <= 0);
            });
            Stencil.stencil_left = Stencil.stencil.filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x >= 0);
            });
            Stencil.stencil_top = Stencil.stencil.filter(function (_a) {
                var _ = _a[0], y = _a[1];
                return (y >= 0);
            });
            Stencil.stencil_bottom = Stencil.stencil.filter(function (_a) {
                var _ = _a[0], y = _a[1];
                return (y <= 0);
            });
            Stencil.stencil_topleft = Stencil.stencil_top.filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x >= 0);
            });
            Stencil.stencil_topright = Stencil.stencil_top.filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x <= 0);
            });
            Stencil.stencil_bottomleft = Stencil.stencil_bottom.filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x >= 0);
            });
            Stencil.stencil_bottomright = Stencil.stencil_bottom.filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x <= 0);
            });
            Stencil.initialized = true;
        }
        if (Stencil.reflectStencils) {
            var reflected = void 0;
            // Right
            reflected = Stencil.stencil.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [-x, y];
            }).filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x > 0);
            });
            Stencil.stencil_right = Stencil.stencil_right.concat(reflected);
            // Left
            reflected = Stencil.stencil.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [-x, y];
            }).filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x < 0);
            });
            Stencil.stencil_left = Stencil.stencil_left.concat(reflected);
            // Top
            reflected = Stencil.stencil.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [x, -y];
            }).filter(function (_a) {
                var _ = _a[0], y = _a[1];
                return (y < 0);
            });
            Stencil.stencil_top = Stencil.stencil_top.concat(reflected);
            // Bottom
            reflected = Stencil.stencil.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [x, -y];
            }).filter(function (_a) {
                var _ = _a[0], y = _a[1];
                return (y > 0);
            });
            Stencil.stencil_bottom = Stencil.stencil_bottom.concat(reflected);
            // Top left
            // stencil_topleft += [(-x, y) for (x, y) in stencil_top if x < 0]+[(x, -y) for (x, y) in stencil_left if y < 0]
            reflected = Stencil.stencil_top.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [-x, y];
            }).filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x < 0);
            });
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
            reflected = Stencil.stencil_left.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [x, -y];
            }).filter(function (_a) {
                var _ = _a[0], y = _a[1];
                return (y < 0);
            });
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
            // Top right
            // stencil_topright += [(-x, y) for (x, y) in stencil_top if x > 0]+[(x, -y) for (x, y) in stencil_right if y < 0]
            reflected = Stencil.stencil_top.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [-x, y];
            }).filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x > 0);
            });
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
            reflected = Stencil.stencil_right.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [x, -y];
            }).filter(function (_a) {
                var _ = _a[0], y = _a[1];
                return (y < 0);
            });
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
            // Bottom left
            // stencil_bottomleft += [(-x, y) for (x, y) in stencil_bottom if x < 0]+[(x, -y) for (x, y) in stencil_left if y > 0]
            reflected = Stencil.stencil_bottom.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [-x, y];
            }).filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x < 0);
            });
            Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);
            reflected = Stencil.stencil_left.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [x, -y];
            }).filter(function (_a) {
                var x = _a[0], y = _a[1];
                return (y > 0);
            });
            Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);
            // Bottom right
            // stencil_bottomright += [(-x, y) for (x, y) in stencil_bottom if x > 0]+[(x, -y) for (x, y) in stencil_right if y > 0]
            reflected = Stencil.stencil_bottom.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [-x, y];
            }).filter(function (_a) {
                var x = _a[0], _ = _a[1];
                return (x > 0);
            });
            Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
            reflected = Stencil.stencil_right.map(function (_a) {
                var x = _a[0], y = _a[1];
                return [x, -y];
            }).filter(function (_a) {
                var x = _a[0], y = _a[1];
                return (y > 0);
            });
            Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
        }
    };
    Stencil.apply_stencil = function (stencil, arr, i, j, base, operator) {
        var v = base;
        for (var ind = 0; ind < stencil.length; ind++) {
            var _a = stencil[ind], x = _a[0], y = _a[1];
            // Transform x and y here, since the first coordinate is
            // actually the row(y - coord) and the second is the column
            // (x - coord).
            v = operator(v, arr[i + y][j + x]);
        }
        return v; // (v / len(stencil)) # FIXME ?
    };
    Stencil.stencil_computation = function (arr, operator, base) {
        Stencil.initialize();
        var nrows = arr.length;
        var ncols = arr[0].length;
        var new_arr = arr.slice();
        // Interior
        for (var i = 1; i < ncols - 1; i++) {
            for (var j = 1; j < nrows - 1; j++) {
                new_arr[i][j] = Stencil.apply_stencil(Stencil.stencil, arr, i, j, base, operator);
            }
        }
        // Edges
        // Top and bottom
        for (var j = 1; j < ncols - 1; j++) {
            new_arr[0][j] = Stencil.apply_stencil(Stencil.stencil_top, arr, 0, j, base, operator);
            new_arr[nrows - 1][j] = Stencil.apply_stencil(Stencil.stencil_bottom, arr, nrows - 1, j, base, operator);
        }
        // Left and right
        for (var i = 1; i < nrows - 1; i++) {
            new_arr[i][0] = Stencil.apply_stencil(Stencil.stencil_left, arr, i, 0, base, operator);
            new_arr[i][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_right, arr, i, ncols - 1, base, operator);
        }
        // Corners
        new_arr[0][0] = Stencil.apply_stencil(Stencil.stencil_topleft, arr, 0, 0, base, operator);
        new_arr[0][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_topright, arr, 0, ncols - 1, base, operator);
        new_arr[nrows - 1][0] = Stencil.apply_stencil(Stencil.stencil_bottomleft, arr, nrows - 1, 0, base, operator);
        new_arr[nrows - 1][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_bottomright, arr, nrows - 1, ncols - 1, base, operator);
        return new_arr;
    };
    Stencil.reflectStencils = true;
    Stencil.ninePointStencil = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]];
    Stencil.stencil = Stencil.ninePointStencil;
    Stencil.initialized = false;
    return Stencil;
}());
exports.Stencil = Stencil;
