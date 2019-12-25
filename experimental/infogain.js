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
            if (Stencil.reflectStencils) {
                var reflected = void 0;
                // Right
                reflected = Stencil.stencil.filter(function (_a) {
                    var x = _a[0], _ = _a[1];
                    return (x > 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [-x, y];
                });
                Stencil.stencil_right = Stencil.stencil_right.concat(reflected);
                console.log('stencil right = ' + JSON.stringify(Stencil.stencil_right) + ', length = ' + Stencil.stencil_right.length);
                // Left
                reflected = Stencil.stencil.filter(function (_a) {
                    var x = _a[0], _ = _a[1];
                    return (x < 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [-x, y];
                });
                Stencil.stencil_left = Stencil.stencil_left.concat(reflected);
                console.log('stencil left = ' + JSON.stringify(Stencil.stencil_left) + ', length = ' + Stencil.stencil_left.length);
                // Top
                reflected = Stencil.stencil.filter(function (_a) {
                    var _ = _a[0], y = _a[1];
                    return (y < 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [x, -y];
                });
                Stencil.stencil_top = Stencil.stencil_top.concat(reflected);
                console.log('stencil top = ' + JSON.stringify(Stencil.stencil_top) + ', length = ' + Stencil.stencil_top.length);
                // Bottom
                reflected = Stencil.stencil.filter(function (_a) {
                    var _ = _a[0], y = _a[1];
                    return (y > 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [x, -y];
                });
                Stencil.stencil_bottom = Stencil.stencil_bottom.concat(reflected);
                console.log('stencil bottom = ' + JSON.stringify(Stencil.stencil_bottom) + ', length = ' + Stencil.stencil_bottom.length);
                // Top left
                // stencil_topleft += [(-x, y) for (x, y) in stencil_top if x < 0]+[(x, -y) for (x, y) in stencil_left if y < 0]
                reflected = Stencil.stencil_top.filter(function (_a) {
                    var x = _a[0], _ = _a[1];
                    return (x < 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [-x, y];
                });
                Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
                reflected = Stencil.stencil_left.filter(function (_a) {
                    var _ = _a[0], y = _a[1];
                    return (y < 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [x, -y];
                });
                Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
                // Remove [1,1]
                Stencil.stencil_topleft.splice(Stencil.stencil_topleft.findIndex(function (o) { return JSON.stringify(o) === JSON.stringify([1, 1]); }), 1);
                console.log('stencil top left = ' + JSON.stringify(Stencil.stencil_topleft) + ', length = ' + Stencil.stencil_topleft.length);
                // Top right
                // stencil_topright += [(-x, y) for (x, y) in stencil_top if x > 0]+[(x, -y) for (x, y) in stencil_right if y < 0]
                reflected = Stencil.stencil_top.filter(function (_a) {
                    var x = _a[0], _ = _a[1];
                    return (x > 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [-x, y];
                });
                Stencil.stencil_topright = Stencil.stencil_topright.concat(reflected);
                reflected = Stencil.stencil_right.filter(function (_a) {
                    var _ = _a[0], y = _a[1];
                    return (y < 0);
                }).map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [x, -y];
                });
                Stencil.stencil_topright = Stencil.stencil_topright.concat(reflected);
                // Remove [-1,1]
                Stencil.stencil_topright.splice(Stencil.stencil_topright.findIndex(function (o) { return JSON.stringify(o) === JSON.stringify([-1, 1]); }), 1);
                console.log('stencil top right = ' + JSON.stringify(Stencil.stencil_topright) + ', length = ' + Stencil.stencil_topright.length);
                // Bottom left
                // stencil_bottomleft += [(-x, y) for (x, y) in stencil_bottom if x < 0]+[(x, -y) for (x, y) in stencil_left if y > 0]
                reflected = Stencil.stencil_bottom.map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [-x, y];
                }).filter(function (_a) {
                    var x = _a[0], _ = _a[1];
                    return (x > 0);
                });
                Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);
                reflected = Stencil.stencil_left.map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [x, -y];
                }).filter(function (_a) {
                    var _ = _a[0], y = _a[1];
                    return (y < 0);
                });
                Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);
                // Remove [1,-1]
                Stencil.stencil_bottomleft.splice(Stencil.stencil_bottomleft.findIndex(function (o) { return JSON.stringify(o) === JSON.stringify([1, -1]); }), 1);
                console.log('stencil bottom left = ' + JSON.stringify(Stencil.stencil_bottomleft) + ', length = ' + Stencil.stencil_bottomleft.length);
                // Bottom right
                // stencil_bottomright += [(-x, y) for (x, y) in stencil_bottom if x > 0]+[(x, -y) for (x, y) in stencil_right if y > 0]
                reflected = Stencil.stencil_bottom.map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [-x, y];
                }).filter(function (_a) {
                    var x = _a[0], _ = _a[1];
                    return (x < 0);
                });
                Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
                reflected = Stencil.stencil_right.map(function (_a) {
                    var x = _a[0], y = _a[1];
                    return [x, -y];
                }).filter(function (_a) {
                    var _ = _a[0], y = _a[1];
                    return (y < 0);
                });
                Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
                // Remove [-1,-1]
                Stencil.stencil_bottomright.splice(Stencil.stencil_bottomright.findIndex(function (o) { return JSON.stringify(o) === JSON.stringify([-1, -1]); }), 1);
                console.log('stencil bottom right = ' + JSON.stringify(Stencil.stencil_bottomright) + ', length = ' + Stencil.stencil_bottomright.length);
            }
            Stencil.initialized = true;
        }
    };
    Stencil.apply_stencil = function (stencil, arr, i, j, base, operator) {
        console.assert(stencil.length === Stencil.stencil.length);
        var v = base;
        for (var ind = 0; ind < stencil.length; ind++) {
            var _a = stencil[ind], x = _a[0], y = _a[1];
            // console.log('[x,y] = [' + x + ',' + y + ']');
            // Transform x and y here, since the first coordinate is
            // actually the row(y - coord) and the second is the column
            // (x - coord).
            v = operator(v, arr[i + y][j + x]);
        }
        return v;
    };
    Stencil.stencil_computation = function (arr, operator, base) {
        Stencil.initialize();
        // Make a new matrix ("new_arr") of the same size as arr, initialized with zeros.
        var nrows = arr.length;
        var ncols = arr[0].length;
        var new_arr = Array(nrows).fill(0).map(function () { return Array(ncols).fill(0); });
        // Interior
        for (var i = 1; i < ncols - 1; i++) {
            for (var j = 1; j < nrows - 1; j++) {
                new_arr[i][j] = Stencil.apply_stencil(Stencil.stencil, arr, i, j, base, operator);
            }
        }
        // Edges
        // Top and bottom
        for (var j = 1; j < ncols - 1; j++) {
            //            console.log('top');
            new_arr[0][j] = Stencil.apply_stencil(Stencil.stencil_top, arr, 0, j, base, operator);
            //           console.log('bottom');
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
