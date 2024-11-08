import { GamePlayer } from "./game-player.js";
import { GameServer } from "./game-server.js";
export class GameState {
    version = "0.0.1-alpha";
    gamePlayer;
    gameServer;
    constructor() {
        this.gamePlayer = new GamePlayer();
        this.gameServer = new GameServer();
    }
    getVersion() {
        return this.version;
    }
    getGamePlayer() {
        return this.gamePlayer;
    }
    getGameServer() {
        return this.gameServer;
    }
}
