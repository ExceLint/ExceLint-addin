import { InfoGain, Stencil } from './infogain';

console.log(InfoGain.normalized_entropy([25]));
console.log(InfoGain.normalized_entropy([25, 1]));
console.log(InfoGain.normalized_entropy([25, 1, 1, 1]));
console.log(InfoGain.salience([25, 1], 0));
console.log(InfoGain.salience([25, 1], 1));
let input: Array<Array<number>> = [[1, 1, 1], [1, 2, 1], [1, 1, 1]];
input = [[1, 4, 4, 2, 3], [5, 6, 7, 100, 9], [10, 11, 12, 13, 14], [15, 16, 8, 17, 18], [19, 20, 21, 22, 23]];
let st: any = Stencil.stencil_computation(input, (x: number, y: number) => { return x * y; }, 1);
console.log(st);
// Convert to histogram of counts.
let arr = st.flat(Infinity);
console.log('flattened = ' + JSON.stringify(arr));
let hist = arr.reduce((acc, e) => acc.set(e, (acc.get(e) || 0) + 1), new Map());
let keys: Array<number> = Array.from(hist.keys());
console.log(keys);
let values: Array<number> = Array.from(hist.values());
console.log(values);
for (let i = 0; i < keys.length; i++) {
    console.log('item = ' + JSON.stringify(keys[i]));
    console.log(InfoGain.salience(values, i));
}
