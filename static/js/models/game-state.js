import { GamePlayer } from "./game-player.js";
import { GameServer } from "./game-server.js";
export class GameState {
    gamePlayer;
    gameServer;
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
}
