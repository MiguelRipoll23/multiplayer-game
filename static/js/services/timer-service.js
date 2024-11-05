export class TimerService {
    started;
    elapsedMilliseconds = 0;
    durationMilliseconds = 0;
    constructor(durationSeconds, started = true) {
        this.started = started;
        console.log(`TimerService(durationSeconds=${durationSeconds},started=${started})`);
        this.durationMilliseconds = durationSeconds * 1000;
    }
    hasFinished() {
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
