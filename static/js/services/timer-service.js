export class TimerService {
    started;
    elapsedMilliseconds = 0;
    durationMilliseconds = 0;
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

    reset() {
        this.started = false;
        this.elapsedMilliseconds = 0;
    }

    update(deltaTimeStamp) {
        if (this.started) {
            this.elapsedMilliseconds += deltaTimeStamp;
            if (this.elapsedMilliseconds >= this.durationMilliseconds) {
                this.callback();
                this.reset();
            }
        }
    }
}
