export class TimerService {
    started;
    elapsedMilliseconds = 0;
    durationMilliseconds = 0;
    completed = false;
    finished = false;
    callback;
    constructor(durationSeconds, callback, started = true) {
        this.started = started;
        console.log(`${this.constructor.name} created`, this);
        this.durationMilliseconds = durationSeconds * 1000;
        this.callback = callback;
    }
    start() {
        this.started = true;
    }
    pause() {
        this.started = false;
    }
    stop(finished) {
        this.finished = finished;
        if (this.finished) {
            console.log(`${this.constructor.name} finished`, this);
        }
        else {
            console.log(`${this.constructor.name} stopped`, this);
        }
        this.started = false;
        this.completed = true;
    }
    hasCompleted() {
        return this.completed;
    }
    update(deltaTimeStamp) {
        if (this.started) {
            this.elapsedMilliseconds += deltaTimeStamp;
            if (this.elapsedMilliseconds >= this.durationMilliseconds) {
                this.stop(true);
                this.callback();
            }
        }
    }
}
