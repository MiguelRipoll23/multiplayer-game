import { BaseGameObject } from "./base/base-game-object.js";

export class PlayerObject extends BaseGameObject {
  protected name: string;
  protected score: number = 0;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public getName(): string {
    return this.name;
  }

  public getScore(): number {
    return this.score;
  }

  public setScore(score: number): void {
    this.score = score;
  }

  public sumScore(score: number): void {
    this.score += score;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {}

  public render(context: CanvasRenderingContext2D): void {}
}
