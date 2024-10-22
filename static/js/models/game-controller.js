import { ApiService } from "../services/api-service.js";
import { CryptoService } from "../services/crypto-service.js";
import { TransitionService } from "../services/transition-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { GameFrame } from "./game-frame.js";
import { GamePointer } from "./game-pointer.js";
import { GameState } from "./game-state.js";
export class GameController {
    canvas;
    debug;
    gameState;
    gameFrame;
    gamePointer;
    transitionService;
    apiService;
    cryptoService;
    webSocketService;
    constructor(canvas, debug = false) {
        this.canvas = canvas;
        this.debug = debug;
        this.canvas = canvas;
        this.createModels();
        this.createServices();
    }
    getCanvas() {
        return this.canvas;
    }
    isDebugging() {
        return this.debug;
    }
    getGameState() {
        return this.gameState;
    }
    getGameFrame() {
        return this.gameFrame;
    }
    getGamePointer() {
        return this.gamePointer;
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
    createModels() {
        this.gameState = new GameState();
        this.gameFrame = new GameFrame();
        this.gamePointer = new GamePointer();
    }
    createServices() {
        this.transitionService = new TransitionService(this.gameFrame);
        this.apiService = new ApiService();
        this.cryptoService = new CryptoService(this.gameState.getGameServer());
        this.webSocketService = new WebSocketService(this);
    }
}
