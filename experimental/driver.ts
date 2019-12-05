import { InfoGain, Stencil } from './infogain';

console.log(InfoGain.normalized_entropy([25]));
console.log(InfoGain.normalized_entropy([25, 1]));
console.log(InfoGain.normalized_entropy([25, 1, 1, 1]));
console.log(InfoGain.salience([25, 1], 0));
console.log(InfoGain.salience([25, 1], 1));
let arr: Array<Array<number>> = [[1, 1, 1], [1, 2, 1], [1, 1, 1]];
console.log(Stencil.stencil_computation(arr, (x: number, y: number) => { return x + y; }, 0));
