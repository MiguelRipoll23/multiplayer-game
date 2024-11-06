export class GamePlayer {
  private name: string = "Unknown";
  private score: number = 0;

  public getName(): string {
    return this.name;
  }

  public getScore(): number {
    return this.score;
  }

  public setName(name: string): void {
    this.name = name;
  }

  public sumScore(score: number): void {
    this.score += score;
  }

  public setScore(score: number): void {
    this.score = score;
  }
}
