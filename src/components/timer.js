"use strict";
exports.__esModule = true;
var Timer = /** @class */ (function () {
    function Timer(name) {
        this.name = name;
        this.perf = null;
        if (typeof window === 'undefined') {
            this.perf = {
                now: function () {
                    var _a = process.hrtime(), secs = _a[0], nanosecs = _a[1];
                    return ((secs * 1e9) + nanosecs) / 1e3;
                }
            };
        }
        else {
            this.perf = performance;
        }
        this.startTimeMS = this.perf.now();
        this.splitTimeMS = this.startTimeMS;
    }
    Timer.prototype.start = function () {
        this.startTimeMS = this.perf.now();
        this.splitTimeMS = this.startTimeMS;
    };
    Timer.prototype.split = function (location) {
        var curr = this.perf.now();
        var elapsed = curr - this.splitTimeMS;
        console.warn("timer: " + this.name + " @ " + location + " : = " + this.roundMe(elapsed) + " (total = " + this.roundMe(curr - this.startTimeMS) + ")");
        this.splitTimeMS = curr;
    };
    Timer.prototype.elapsedTime = function () {
        return this.perf.now() - this.startTimeMS;
    };
    Timer.prototype.roundMe = function (v) {
        return Math.round(v * 100) / 100;
    };
    return Timer;
}());
exports.Timer = Timer;
