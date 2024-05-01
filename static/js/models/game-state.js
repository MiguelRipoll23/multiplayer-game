import { GameServer } from "./game-server.js";
export class GameState {
    gameServer;
    constructor() {
        this.gameServer = new GameServer();
    }
    getGameServer() {
        return this.gameServer;
    }
}
