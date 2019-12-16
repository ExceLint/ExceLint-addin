export class InfoGain {

    public static normalized_entropy(counts: Array<number>): number {
        const total = counts.reduce((a, b) => a + b, 0);
        let entropy = 0;
        for (let i = 0; i < counts.length; i++) {
            const freq = counts[i] / total;
            if (freq !== 0) {
                entropy -= freq * Math.log2(freq);
            }
        }
        return entropy / Math.log2(total);
    }

    public static salience(counts: Array<number>, index: number): number {
        const total = counts.reduce((a, b) => a + b, 0);
        const p_index = counts[index] / total;
        const salience = (1 - p_index) * (1 - InfoGain.normalized_entropy(counts));
        return salience;
    }
}

export class Stencil {

    private static reflectStencils = true;
    private static ninePointStencil: Array<[number, number]> = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]];

    private static stencil = Stencil.ninePointStencil;
    private static stencil_right: Array<[number, number]>;
    private static stencil_left: Array<[number, number]>;
    private static stencil_top: Array<[number, number]>;
    private static stencil_bottom: Array<[number, number]>;
    private static stencil_topleft: Array<[number, number]>;
    private static stencil_topright: Array<[number, number]>;
    private static stencil_bottomleft: Array<[number, number]>;
    private static stencil_bottomright: Array<[number, number]>;

    private static initialized = false;

    public static initialize(): void {
        if (!Stencil.initialized) {
            //  Define boundary condition stencils by clipping the stencil at
            // the boundaries(edges and then corners).
            // NOTE: we optionally REFLECT the stencil here so it is always the same size.
            Stencil.stencil_right = Stencil.stencil.filter(([x, _]) => {
                return (x <= 0);
            });
            Stencil.stencil_left = Stencil.stencil.filter(([x, _]) => {
                return (x >= 0);
            });
            Stencil.stencil_top = Stencil.stencil.filter(([_, y]) => {
                return (y >= 0);
            });
            Stencil.stencil_bottom = Stencil.stencil.filter(([_, y]) => {
                return (y <= 0);
            });
            Stencil.stencil_topleft = Stencil.stencil_top.filter(([x, _]) => {
                return (x >= 0);
            });
            Stencil.stencil_topright = Stencil.stencil_top.filter(([x, _]) => {
                return (x <= 0);
            });
            Stencil.stencil_bottomleft = Stencil.stencil_bottom.filter(([x, _]) => {
                return (x >= 0);
            });
            Stencil.stencil_bottomright = Stencil.stencil_bottom.filter(([x, _]) => {
                return (x <= 0);
            });
            Stencil.initialized = true;
        }
        if (Stencil.reflectStencils) {
            let reflected: any;

            // Right
            reflected = Stencil.stencil.map(([x, y]) => [-x, y]).filter(([x, _]) => (x > 0));
            Stencil.stencil_right = Stencil.stencil_right.concat(reflected);

            // Left
            reflected = Stencil.stencil.map(([x, y]) => [-x, y]).filter(([x, _]) => (x < 0));
            Stencil.stencil_left = Stencil.stencil_left.concat(reflected);

            // Top
            reflected = Stencil.stencil.map(([x, y]) => [x, -y]).filter(([_, y]) => (y < 0));
            Stencil.stencil_top = Stencil.stencil_top.concat(reflected);

            // Bottom
            reflected = Stencil.stencil.map(([x, y]) => [x, -y]).filter(([_, y]) => (y > 0));
            Stencil.stencil_bottom = Stencil.stencil_bottom.concat(reflected);

            // Top left
            // stencil_topleft += [(-x, y) for (x, y) in stencil_top if x < 0]+[(x, -y) for (x, y) in stencil_left if y < 0]

            reflected = Stencil.stencil_top.map(([x, y]) => [-x, y]).filter(([x, _]) => (x < 0));
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
            reflected = Stencil.stencil_left.map(([x, y]) => [x, -y]).filter(([_, y]) => (y < 0));
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);

            // Top right
            // stencil_topright += [(-x, y) for (x, y) in stencil_top if x > 0]+[(x, -y) for (x, y) in stencil_right if y < 0]

            reflected = Stencil.stencil_top.map(([x, y]) => [-x, y]).filter(([x, _]) => (x > 0));
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
            reflected = Stencil.stencil_right.map(([x, y]) => [x, -y]).filter(([_, y]) => (y < 0));
            Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);

            // Bottom left
            // stencil_bottomleft += [(-x, y) for (x, y) in stencil_bottom if x < 0]+[(x, -y) for (x, y) in stencil_left if y > 0]

            reflected = Stencil.stencil_bottom.map(([x, y]) => [-x, y]).filter(([x, _]) => (x < 0));
            Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);
            reflected = Stencil.stencil_left.map(([x, y]) => [x, -y]).filter(([x, y]) => (y > 0));
            Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);

            // Bottom right
            // stencil_bottomright += [(-x, y) for (x, y) in stencil_bottom if x > 0]+[(x, -y) for (x, y) in stencil_right if y > 0]


            reflected = Stencil.stencil_bottom.map(([x, y]) => [-x, y]).filter(([x, _]) => (x > 0));
            Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
            reflected = Stencil.stencil_right.map(([x, y]) => [x, -y]).filter(([x, y]) => (y > 0));
            Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
        }
    }

    private static apply_stencil(stencil, arr: Array<Array<number>>, i: number, j: number, base: number, operator: any): number {
        let v = base;
        for (let ind = 0; ind < stencil.length; ind++) {
            let [x, y] = stencil[ind];
            // Transform x and y here, since the first coordinate is
            // actually the row(y - coord) and the second is the column
            // (x - coord).
            v = operator(v, arr[i + y][j + x]);
        }
        return v; // (v / len(stencil)) # FIXME ?
    }

    public static stencil_computation(arr: Array<Array<number>>, operator: any, base: number): Array<Array<number>> {
        Stencil.initialize();
        const nrows = arr.length;
        const ncols = arr[0].length;
        let new_arr = arr.slice();
        // Interior
        for (let i = 1; i < ncols - 1; i++) {
            for (let j = 1; j < nrows - 1; j++) {
                new_arr[i][j] = Stencil.apply_stencil(Stencil.stencil, arr, i, j, base, operator);
            }
        }
        // Edges
        // Top and bottom
        for (let j = 1; j < ncols - 1; j++) {
            new_arr[0][j] = Stencil.apply_stencil(Stencil.stencil_top, arr, 0, j, base, operator);
            new_arr[nrows - 1][j] = Stencil.apply_stencil(Stencil.stencil_bottom, arr, nrows - 1, j, base, operator);
        }
        // Left and right
        for (let i = 1; i < nrows - 1; i++) {
            new_arr[i][0] = Stencil.apply_stencil(Stencil.stencil_left, arr, i, 0, base, operator);
            new_arr[i][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_right, arr, i, ncols - 1, base, operator);
        }
        // Corners
        new_arr[0][0] = Stencil.apply_stencil(Stencil.stencil_topleft, arr, 0, 0, base, operator);
        new_arr[0][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_topright, arr, 0, ncols - 1, base, operator);
        new_arr[nrows - 1][0] = Stencil.apply_stencil(Stencil.stencil_bottomleft, arr, nrows - 1, 0, base, operator);
        new_arr[nrows - 1][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_bottomright, arr, nrows - 1, ncols - 1, base, operator);
        return new_arr;
    }
}
