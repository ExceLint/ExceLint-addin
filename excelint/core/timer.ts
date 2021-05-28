declare var window: any;
declare var performance: any;
declare var process: any;

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
          // returns a time in microseconds
          const [secs, nanosecs] = process.hrtime();
          return (secs * 1e9 + nanosecs) / 1e3;
        },
      };
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
    const curr = this.perf.now();
    const elapsed = curr - this.splitTimeMS;
    console.warn(
      'timer: ' +
        this.name +
        ' @ ' +
        location +
        ' : = ' +
        Timer.round(elapsed) +
        ' (total = ' +
        Timer.round(curr - this.startTimeMS) +
        ' μs)'
    );
    this.splitTimeMS = curr;
  }

  public elapsedTime(): number {
    return this.perf.now() - this.startTimeMS;
  }

  public static round(v: number): number {
    return Math.round(v * 100) / 100;
  }
}
