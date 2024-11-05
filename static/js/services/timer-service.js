export class TimerService {
    started = false;
    elapsedMilliseconds = 0;
    durationMilliseconds = 0;
    constructor(durationSeconds) {
        console.log(`TimerService(durationSeconds=${durationSeconds})`);
        this.durationMilliseconds = durationSeconds * 1000;
    }
    isComplete() {
        return this.elapsedMilliseconds >= this.durationMilliseconds;
    }
    start() {
        this.started = true;
    }
    stop() {
        this.started = false;
    }
    reset() {
        this.started = false;
        this.elapsedMilliseconds = 0;
    }
    update(deltaTimeMilliseconds) {
        if (this.started) {
            this.elapsedMilliseconds += deltaTimeMilliseconds;
        }
    }
}
