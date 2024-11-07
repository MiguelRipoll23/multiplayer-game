import { GamePlayer } from "./game-player.js";
import { GameServer } from "./game-server.js";
export class GameState {
    version = "1.0.0";
    host = false;
    gamePlayer;
    gameServer;
    constructor() {
        this.gamePlayer = new GamePlayer();
        this.gameServer = new GameServer();
    }
    getVersion() {
        return this.version;
    }
    isHost() {
        return this.host;
    }
    setHost(host) {
        this.host = host;
    }
    getGamePlayer() {
        return this.gamePlayer;
    }
    getGameServer() {
        return this.gameServer;
    }
}
