import { MatchAttributes } from "../services/interfaces/match-attributes.js";
import { GamePlayer } from "./game-player.js";

export class GameMatch {
  private host: boolean;
  private totalSlots: number;
  private attributes: MatchAttributes;

  private players: Map<string, GamePlayer> = new Map();

  constructor(host: boolean, totalSlots: number, attributes: MatchAttributes) {
    this.host = host;
    this.totalSlots = totalSlots;
    this.attributes = attributes;
  }

  public isHost(): boolean {
    return this.host;
  }

  public getTotalSlots(): number {
    return this.totalSlots;
  }

  public getAvailableSlots(): number {
    return this.totalSlots - this.players.size;
  }

  public getAttributes(): MatchAttributes {
    return this.attributes;
  }

  public addPlayer(player: GamePlayer): void {
    this.players.set(player.getName(), player);

    console.log(
      `Added player ${player.getName()} to match, total players`,
      this.players.size
    );
  }

  public removePlayer(playerName: string): void {
    this.players.delete(playerName);

    console.log(
      `Removed player ${playerName} from match, total players`,
      this.players.size
    );
  }
}
