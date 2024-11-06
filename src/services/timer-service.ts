export class TimerService {
  private elapsedMilliseconds: number = 0;
  private durationMilliseconds: number = 0;

  constructor(durationSeconds: number, private started: boolean = true) {
    console.log(
      `TimerService(durationSeconds=${durationSeconds},started=${started})`
    );

    this.durationMilliseconds = durationSeconds * 1000;
  }

  public hasFinished(): boolean {
    return this.elapsedMilliseconds >= this.durationMilliseconds;
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
    }
  }
}
