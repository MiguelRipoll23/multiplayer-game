export class TimerService {
  private started: boolean = false;

  private elapsedMilliseconds: number = 0;
  private durationMilliseconds: number = 0;

  constructor(durationSeconds: number) {
    console.log(`TimerService(durationSeconds=${durationSeconds})`);
    this.durationMilliseconds = durationSeconds * 1000;
  }

  public isComplete(): boolean {
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

  public update(deltaTimeMilliseconds: DOMHighResTimeStamp): void {
    if (this.started) {
      this.elapsedMilliseconds += deltaTimeMilliseconds;
    }
  }
}
