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

    public static to_histogram(data: Array<any>): Map<number, number> {
        let arr = (data as any).flat(Infinity);
        let hist = arr.reduce((acc: Map<number, number>, e: number) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
        return hist;
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

            if (Stencil.reflectStencils) {
                let reflected: any;

                // Right
                reflected = Stencil.stencil.filter(([x, _]) => (x > 0)).map(([x, y]) => [-x, y]);
                Stencil.stencil_right = Stencil.stencil_right.concat(reflected);
                //console.log('stencil right = ' + JSON.stringify(Stencil.stencil_right) + ', length = ' + Stencil.stencil_right.length);

                // Left
                reflected = Stencil.stencil.filter(([x, _]) => (x < 0)).map(([x, y]) => [-x, y]);
                Stencil.stencil_left = Stencil.stencil_left.concat(reflected);
                //console.log('stencil left = ' + JSON.stringify(Stencil.stencil_left) + ', length = ' + Stencil.stencil_left.length);

                // Top
                reflected = Stencil.stencil.filter(([_, y]) => (y < 0)).map(([x, y]) => [x, -y]);
                Stencil.stencil_top = Stencil.stencil_top.concat(reflected);
                //console.log('stencil top = ' + JSON.stringify(Stencil.stencil_top) + ', length = ' + Stencil.stencil_top.length);

                // Bottom
                reflected = Stencil.stencil.filter(([_, y]) => (y > 0)).map(([x, y]) => [x, -y]);
                Stencil.stencil_bottom = Stencil.stencil_bottom.concat(reflected);
                //console.log('stencil bottom = ' + JSON.stringify(Stencil.stencil_bottom) + ', length = ' + Stencil.stencil_bottom.length);

                // Top left
                // stencil_topleft += [(-x, y) for (x, y) in stencil_top if x < 0]+[(x, -y) for (x, y) in stencil_left if y < 0]

                reflected = Stencil.stencil_top.filter(([x, _]) => (x < 0)).map(([x, y]) => [-x, y]);
                Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
                reflected = Stencil.stencil_left.filter(([_, y]) => (y < 0)).map(([x, y]) => [x, -y]);
                Stencil.stencil_topleft = Stencil.stencil_topleft.concat(reflected);
                // Remove [1,1]
                Stencil.stencil_topleft.splice(Stencil.stencil_topleft.findIndex((o) => JSON.stringify(o) === JSON.stringify([1, 1])), 1);
                //console.log('stencil top left = ' + JSON.stringify(Stencil.stencil_topleft) + ', length = ' + Stencil.stencil_topleft.length);

                // Top right
                // stencil_topright += [(-x, y) for (x, y) in stencil_top if x > 0]+[(x, -y) for (x, y) in stencil_right if y < 0]

                reflected = Stencil.stencil_top.filter(([x, _]) => (x > 0)).map(([x, y]) => [-x, y]);
                Stencil.stencil_topright = Stencil.stencil_topright.concat(reflected);
                reflected = Stencil.stencil_right.filter(([_, y]) => (y < 0)).map(([x, y]) => [x, -y]);
                Stencil.stencil_topright = Stencil.stencil_topright.concat(reflected);
                // Remove [-1,1]
                Stencil.stencil_topright.splice(Stencil.stencil_topright.findIndex((o) => JSON.stringify(o) === JSON.stringify([-1, 1])), 1);

                //console.log('stencil top right = ' + JSON.stringify(Stencil.stencil_topright) + ', length = ' + Stencil.stencil_topright.length);
                // Bottom left
                // stencil_bottomleft += [(-x, y) for (x, y) in stencil_bottom if x < 0]+[(x, -y) for (x, y) in stencil_left if y > 0]

                reflected = Stencil.stencil_bottom.map(([x, y]) => [-x, y]).filter(([x, _]) => (x > 0));
                Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);
                reflected = Stencil.stencil_left.map(([x, y]) => [x, -y]).filter(([_, y]) => (y < 0));
                Stencil.stencil_bottomleft = Stencil.stencil_bottomleft.concat(reflected);
                // Remove [1,-1]
                Stencil.stencil_bottomleft.splice(Stencil.stencil_bottomleft.findIndex((o) => JSON.stringify(o) === JSON.stringify([1, -1])), 1);
                //console.log('stencil bottom left = ' + JSON.stringify(Stencil.stencil_bottomleft) + ', length = ' + Stencil.stencil_bottomleft.length);

                // Bottom right
                // stencil_bottomright += [(-x, y) for (x, y) in stencil_bottom if x > 0]+[(x, -y) for (x, y) in stencil_right if y > 0]


                reflected = Stencil.stencil_bottom.map(([x, y]) => [-x, y]).filter(([x, _]) => (x < 0));
                Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
                reflected = Stencil.stencil_right.map(([x, y]) => [x, -y]).filter(([_, y]) => (y < 0));
                Stencil.stencil_bottomright = Stencil.stencil_bottomright.concat(reflected);
                // Remove [-1,-1]
                Stencil.stencil_bottomright.splice(Stencil.stencil_bottomright.findIndex((o) => JSON.stringify(o) === JSON.stringify([-1, -1])), 1);
                //console.log('stencil bottom right = ' + JSON.stringify(Stencil.stencil_bottomright) + ', length = ' + Stencil.stencil_bottomright.length);
            }
            Stencil.initialized = true;
        }
    }

    private static apply_stencil(stencil: Array<[number, number]>, arr: Array<Array<number>>, i: number, j: number, base: number, operator: (a: number, b: number) => number): number {
        console.assert(stencil.length === Stencil.stencil.length);
        let v = base;
        for (let ind = 0; ind < stencil.length; ind++) {
            let [x, y] = stencil[ind];
            // console.log('[x,y] = [' + x + ',' + y + ']');
            // Transform x and y here, since the first coordinate is
            // actually the row(y - coord) and the second is the column
            // (x - coord).
            v = operator(v, arr[i + y][j + x]);
        }
        return v;
    }

    public static stencil_computation(arr: Array<Array<number>>, operator: (a: number, b: number) => number, base: number): Array<Array<number>> {
        Stencil.initialize();
        // Make a new matrix ("new_arr") of the same size as arr, initialized with zeros.
        const nrows = arr.length;
        const ncols = arr[0].length;
        let new_arr = Array(nrows).fill(0).map(() => Array(ncols).fill(0));
//        console.log('new_arr = ' + JSON.stringify(new_arr));

        // Interior
        for (let i = 1; i < ncols - 1; i++) {
            for (let j = 1; j < nrows - 1; j++) {
//                console.log('i = ' + i + ', j = ' + j);
                new_arr[j][i] = Stencil.apply_stencil(Stencil.stencil, arr, i, j, base, operator);
            }
        }
  //      console.log('new_arr = ' + JSON.stringify(new_arr));

        // Edges
        // Top and bottom
        for (let j = 1; j < ncols - 1; j++) {
            //            console.log('top');
            new_arr[0][j] = Stencil.apply_stencil(Stencil.stencil_top, arr, 0, j, base, operator);
            //           console.log('bottom');
            new_arr[nrows - 1][j] = Stencil.apply_stencil(Stencil.stencil_bottom, arr, nrows - 1, j, base, operator);
        }
    //    console.log('new_arr = ' + JSON.stringify(new_arr));
        // Left and right
        for (let i = 1; i < nrows - 1; i++) {
            new_arr[i][0] = Stencil.apply_stencil(Stencil.stencil_left, arr, i, 0, base, operator);
            new_arr[i][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_right, arr, i, ncols - 1, base, operator);
        }

      //  console.log('new_arr = ' + JSON.stringify(new_arr));
        // Corners
        new_arr[0][0] = Stencil.apply_stencil(Stencil.stencil_topleft, arr, 0, 0, base, operator);
        new_arr[0][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_topright, arr, 0, ncols - 1, base, operator);
        new_arr[nrows - 1][0] = Stencil.apply_stencil(Stencil.stencil_bottomleft, arr, nrows - 1, 0, base, operator);
        new_arr[nrows - 1][ncols - 1] = Stencil.apply_stencil(Stencil.stencil_bottomright, arr, nrows - 1, ncols - 1, base, operator);
        // console.log('new_arr = ' + JSON.stringify(new_arr));
        return new_arr;
    }
}
