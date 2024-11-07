export class TimerService {
  private elapsedMilliseconds: number = 0;
  private durationMilliseconds: number = 0;
  private callback: () => void;

  constructor(durationSeconds: number, callback: () => void, private started: boolean = true) {
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

  public reset(): void {
    this.started = false;
    this.elapsedMilliseconds = 0;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.started) {
      this.elapsedMilliseconds += deltaTimeStamp;
      if (this.elapsedMilliseconds >= this.durationMilliseconds) {
        this.callback();
        this.reset();
      }
    }
  }
}
