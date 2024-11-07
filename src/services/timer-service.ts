export class TimerService {
  private elapsedMilliseconds: number = 0;
  private durationMilliseconds: number = 0;
  private finished: boolean = false;

  private callback: () => void;

  constructor(
    durationSeconds: number,
    callback: () => void,
    private started: boolean = true
  ) {
    console.log(
      `TimerService(durationSeconds=${durationSeconds},started=${started})`
    );

    this.durationMilliseconds = durationSeconds * 1000;
    this.callback = callback;
  }

  public start(): void {
    this.started = true;
  }

  public stop(): void {
    this.started = false;
  }

  public hasFinished(): boolean {
    return this.finished;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.started) {
      this.elapsedMilliseconds += deltaTimeStamp;

      if (this.elapsedMilliseconds >= this.durationMilliseconds) {
        this.end();
      }
    }
  }

  private end(): void {
    this.started = false;
    this.finished = true;
    this.elapsedMilliseconds = 0;

    this.callback();
  }
}
