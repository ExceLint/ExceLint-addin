import { Colorize } from './colorize';

let palette = Colorize.palette; // ["#ecaaae", "#74aff3", "#d8e9b2", "#deb1e0", "#9ec991", "#adbce9", "#e9c59a", "#71cdeb", "#bfbb8a", "#94d9df", "#91c7a8", "#b4efd3", "#80b6aa", "#9bd1c6"];
let prologue = '<svg width="300" height="20">'
console.log(prologue);
const limitWidth = 50;
//let barWidth = Math.round(limitWidth / palette.length);
let barWidth = limitWidth / palette.length;
let xPos = 0;
for (let p of palette) {
    let str = `<rect x="${xPos}" y="0" width="${barWidth}" height="20" fill="${p}" />`;
    xPos += barWidth;
    console.log(str);
//    console.log(p);
}
let epilogue = '<text x="55" y="13">formulas (pastel colors)</text></svg>';
console.log(epilogue);

