"use strict";
exports.__esModule = true;
var Timer = /** @class */ (function () {
    function Timer(name) {
        this.name = name;
        this.startTimeMS = performance.now();
        this.splitTimeMS = this.startTimeMS;
    }
    Timer.prototype.start = function () {
        this.startTimeMS = performance.now();
        this.splitTimeMS = this.startTimeMS;
    };
    Timer.prototype.split = function (location) {
        var curr = performance.now();
        var elapsed = curr - this.splitTimeMS;
        console.log("timer: " + this.name + " @ " + location + " : = " + this.roundMe(elapsed) + " (total = " + this.roundMe(curr - this.startTimeMS) + ")");
        this.splitTimeMS = curr;
    };
    Timer.prototype.elapsedTime = function () {
        return performance.now() - this.startTimeMS;
    };
    Timer.prototype.roundMe = function (v) {
        return Math.round(v * 100) / 100;
    };
    return Timer;
}());
exports.Timer = Timer;
