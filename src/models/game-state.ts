import { GamePlayer } from "./game-player.js";
import { GameServer } from "./game-server.js";

export class GameState {
  private version: string = "0.0.1-alpha";
  private gamePlayer: GamePlayer;
  private gameServer: GameServer;

  constructor() {
    this.gamePlayer = new GamePlayer();
    this.gameServer = new GameServer();
  }

  public getVersion(): string {
    return this.version;
  }

  public getGamePlayer(): GamePlayer {
    return this.gamePlayer;
  }

  public getGameServer(): GameServer {
    return this.gameServer;
  }
}
