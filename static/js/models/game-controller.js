import { ApiService } from "../services/api-service.js";
import { CryptoService } from "../services/crypto-service.js";
import { ScreenTransitionService } from "../services/screen-transition-service.js";
import { TimerService } from "../services/timer-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { GameFrame } from "./game-frame.js";
import { GameKeyboard } from "./game-keyboard.js";
import { GamePointer } from "./game-pointer.js";
import { GameState } from "./game-state.js";
export class GameController {
    canvas;
    debug;
    gameState;
    gameFrame;
    gamePointer;
    gameKeyboard;
    timers = [];
    transitionService;
    apiService;
    cryptoService;
    webSocketService;
    constructor(canvas, debug = false) {
        this.canvas = canvas;
        this.debug = debug;
        this.gameState = new GameState();
        this.gameFrame = new GameFrame();
        this.gamePointer = new GamePointer();
        this.gameKeyboard = new GameKeyboard();
        this.transitionService = new ScreenTransitionService(this.gameFrame);
        this.apiService = new ApiService();
        this.cryptoService = new CryptoService(this.gameState.getGameServer());
        this.webSocketService = new WebSocketService(this);
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
    getGameKeyboard() {
        return this.gameKeyboard;
    }
    getTimers() {
        return this.timers;
    }
    addTimer(seconds) {
        const timerService = new TimerService(seconds);
        timerService.start();
        this.timers.push(timerService);
        return timerService;
    }
    removeTimer(timer) {
        const index = this.timers.indexOf(timer);
        if (index !== -1) {
            this.timers.splice(index, 1);
        }
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
