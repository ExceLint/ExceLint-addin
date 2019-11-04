export class Timer {

    private name: string;
    private perf: any;
    private startTimeMS: number;
    private splitTimeMS: number;

    constructor(name: string) {
        this.name = name;
        this.perf = null;
        if (typeof window === 'undefined') {
            this.perf = {
                now: function () {
                    let [secs, nanosecs] = process.hrtime()
                    return ((secs * 1e9) + nanosecs) / 1e3;
                }
            }
        } else {
            this.perf = performance;
        }
        this.startTimeMS = this.perf.now();
        this.splitTimeMS = this.startTimeMS;
    }

    public start(): void {
        this.startTimeMS = this.perf.now();
        this.splitTimeMS = this.startTimeMS;
    }

    public split(location: string): void {
        let curr = this.perf.now();
        let elapsed = curr - this.splitTimeMS;
        console.warn("timer: " + this.name + " @ " + location + " : = " + this.roundMe(elapsed) + " (total = " + this.roundMe(curr - this.startTimeMS) + ")");
        this.splitTimeMS = curr;
    }

    public elapsedTime(): number {
        return this.perf.now() - this.startTimeMS;
    }

    private roundMe(v: number): number {
        return Math.round(v * 100) / 100;
    }
}
