import { GameServer } from "./game-server.js";

export class GameState {
  private gameServer: GameServer;

  constructor() {
    this.gameServer = new GameServer();
  }

  public getGameServer(): GameServer {
    return this.gameServer;
  }
}
