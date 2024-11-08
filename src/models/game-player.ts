import { Team } from "./game-teams.js";

export class GamePlayer {
  private name: string;
  protected team: Team;
  private score: number;

  constructor(name = "Unknown", team = Team.Blue, score = 0) {
    this.name = name;
    this.team = team;
    this.score = score;
  }

  public getName(): string {
    return this.name;
  }

  public getTeam(): Team {
    return this.team;
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
