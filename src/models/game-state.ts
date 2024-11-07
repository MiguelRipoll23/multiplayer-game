import { GamePlayer } from "./game-player.js";
import { GameServer } from "./game-server.js";

export class GameState {
  private host: boolean = false;
  private gamePlayer: GamePlayer;
  private gameServer: GameServer;

  constructor() {
    this.gamePlayer = new GamePlayer();
    this.gameServer = new GameServer();
  }

  public isHost(): boolean {
    return this.host;
  }

  public setHost(host: boolean): void {
    this.host = host;
  }

  public getGamePlayer(): GamePlayer {
    return this.gamePlayer;
  }

  public getGameServer(): GameServer {
    return this.gameServer;
  }
}
