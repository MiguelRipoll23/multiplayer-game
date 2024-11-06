import { Team } from "../models/game-teams.js";
import { BaseGameObject } from "./base/base-game-object.js";

export class PlayerObject extends BaseGameObject {
  protected name: string;
  protected team: Team = Team.Blue;
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

  public getTeam(): Team {
    return this.team;
  }

  public setTeam(team: Team): void {
    this.team = team;
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
