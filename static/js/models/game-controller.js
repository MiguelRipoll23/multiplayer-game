import { ApiService } from "../services/api-service.js";
import { CryptoService } from "../services/crypto-service.js";
import { TransitionService } from "../services/transition-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { GameFrame } from "./game-frame.js";
import { GameState } from "./game-state.js";
export class GameController {
    canvas;
    gameState;
    gameFrame;
    transitionService;
    apiService;
    cryptoService;
    webSocketService;
    constructor(canvas) {
        this.canvas = canvas;
        this.gameState = new GameState();
        this.gameFrame = new GameFrame();
        this.transitionService = new TransitionService(this.gameFrame);
        this.apiService = new ApiService();
        this.cryptoService = new CryptoService(this.gameState.getGameServer());
        this.webSocketService = new WebSocketService(this);
    }
    getCanvas() {
        return this.canvas;
    }
    getGameState() {
        return this.gameState;
    }
    getGameFrame() {
        return this.gameFrame;
    }
    getTransitionService() {
        return this.transitionService;
    }
    getApiService() {
        return this.apiService;
    }
    getCryptoService() {
        return this.cryptoService;
    }
    getWebSocketService() {
        return this.webSocketService;
    }
}
