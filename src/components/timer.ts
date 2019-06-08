export class Timer {

    private name: string;
    private startTimeMS: number;
    
    constructor(name: string) {
	this.name = name;
	this.startTimeMS = performance.now();
    }

    public start(): void {
	this.startTimeMS = performance.now();
    }

    public split(location: string): void {
	let elapsed = this.elapsedTime();
	console.log(this.name+ " @ " + location + " : time elapsed (ms) = " + elapsed);
    }

    public elapsedTime() : number {
	return performance.now() - this.startTimeMS;
    }
}
