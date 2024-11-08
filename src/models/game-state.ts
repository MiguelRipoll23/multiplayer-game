import { GameMatch } from "./game-match.js";
import { GamePlayer } from "./game-player.js";
import { GameServer } from "./game-server.js";

export class GameState {
  private gamePlayer: GamePlayer;
  private gameServer: GameServer;
  private gameMatch: GameMatch | null = null;

  constructor() {
    this.gamePlayer = new GamePlayer();
    this.gameServer = new GameServer();
  }

  public getGamePlayer(): GamePlayer {
    return this.gamePlayer;
  }

  public getGameServer(): GameServer {
    return this.gameServer;
  }

  public getGameMatch(): GameMatch | null {
    return this.gameMatch;
  }

  public setGameMatch(gameMatch: GameMatch | null): void {
    this.gameMatch = gameMatch;

    if (gameMatch === null) {
      return console.log("Game match deleted");
    }

    if (gameMatch.isHost()) {
      console.log("Game match created", gameMatch);
    } else {
      console.log("Game match set", gameMatch);
    }
  }
}
