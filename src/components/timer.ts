export class Timer {

    private name: string;
    private startTimeMS: number;
    private splitTimeMS: number;
    
    constructor(name: string) {
	this.name = name;
	this.startTimeMS = performance.now();
	this.splitTimeMS = this.startTimeMS;
    }

    public start(): void {
	this.startTimeMS = performance.now();
	this.splitTimeMS = this.startTimeMS;
    }

    public split(location: string): void {
	let curr = performance.now();
	let elapsed = curr - this.splitTimeMS;
	console.log("timer: " + this.name + " @ " + location + " : = " + this.roundMe(elapsed) + " (total = " + this.roundMe(curr - this.startTimeMS) + ")");
	this.splitTimeMS = curr;
    }

    public elapsedTime() : number {
	return performance.now() - this.startTimeMS;
    }

    private roundMe(v: number) : number {
	return Math.round(v * 100)/100;
    }
}
