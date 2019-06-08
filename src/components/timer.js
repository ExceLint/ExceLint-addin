"use strict";
exports.__esModule = true;
var Timer = /** @class */ (function () {
    function Timer(name) {
        this.name = name;
        this.startTimeMS = performance.now();
    }
    Timer.prototype.start = function () {
        this.startTimeMS = performance.now();
    };
    Timer.prototype.split = function (location) {
        var elapsed = this.elapsedTime();
        console.log(this.name + " @ " + location + " : time elapsed (ms) = " + elapsed);
    };
    Timer.prototype.elapsedTime = function () {
        return performance.now() - this.startTimeMS;
    };
    return Timer;
}());
exports.Timer = Timer;
