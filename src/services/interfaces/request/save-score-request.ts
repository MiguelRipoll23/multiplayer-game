export class SaveScoreRequest {
  private score: number;
  private hash: string;

  constructor(score: number, hash: string) {
    this.score = score;
    this.hash = hash;
  }

  public getScore(): number {
    return this.score;
  }

  public setScore(score: number): void {
    this.score = score;
  }

  public getHash(): string {
    return this.hash;
  }

  public setHash(hash: string): void {
    this.hash = hash;
  }
}
