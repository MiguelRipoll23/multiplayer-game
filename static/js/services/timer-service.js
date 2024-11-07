export class TimerService {
    started;
    elapsedMilliseconds = 0;
    durationMilliseconds = 0;
    finished = false;
    callback;
    constructor(durationSeconds, callback, started = true) {
        this.started = started;
        console.log(`TimerService(durationSeconds=${durationSeconds},started=${started})`);
        this.durationMilliseconds = durationSeconds * 1000;
        this.callback = callback;
    }
    start() {
        this.started = true;
    }
    stop() {
        this.started = false;
    }
    hasFinished() {
        return this.finished;
    }
    update(deltaTimeStamp) {
        if (this.started) {
            this.elapsedMilliseconds += deltaTimeStamp;
            if (this.elapsedMilliseconds >= this.durationMilliseconds) {
                this.end();
            }
        }
    }
    end() {
        this.started = false;
        this.finished = true;
        this.elapsedMilliseconds = 0;
        this.callback();
    }
}
