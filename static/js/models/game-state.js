import { GamePlayer } from "./game-player.js";
import { GameServer } from "./game-server.js";
export class GameState {
    gamePlayer;
    gameServer;
    gameMatch = null;
    constructor() {
        this.gamePlayer = new GamePlayer();
        this.gameServer = new GameServer();
    }
    getGamePlayer() {
        return this.gamePlayer;
    }
    getGameServer() {
        return this.gameServer;
    }
    getGameMatch() {
        return this.gameMatch;
    }
    setGameMatch(gameMatch) {
        this.gameMatch = gameMatch;
        if (gameMatch === null) {
            return console.log("Game match deleted");
        }
        if (gameMatch.isHost()) {
            console.log("Game match created", gameMatch);
        }
        else {
            console.log("Game match set", gameMatch);
        }
    }
}
