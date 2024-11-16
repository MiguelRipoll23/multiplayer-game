import { GamePlayer } from "../models/game-player.js";
import { BaseGameObject } from "./base/base-game-object.js";

export class PlayerObject extends BaseGameObject {
  protected gamePlayer: GamePlayer;
  protected score: number = 0;

  constructor(gamePlayer: GamePlayer) {
    super();
    this.gamePlayer = gamePlayer;
  }

  public getName(): string {
    return this.gamePlayer.getName();
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
