import { GAME_VERSION } from "../constants/game-constants.js";
import { ApiService } from "../services/api-service.js";
import { CryptoService } from "../services/crypto-service.js";
import { MatchmakingService } from "../services/matchmaking-service.js";
import { ScreenTransitionService } from "../services/screen-transition-service.js";
import { TimerService } from "../services/timer-service.js";
import { WebRTCService } from "../services/webrtc-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { GameFrame } from "./game-frame.js";
import { GameKeyboard } from "./game-keyboard.js";
import { GamePointer } from "./game-pointer.js";
import { GameState } from "./game-state.js";

export class GameController {
  private gameState: GameState;
  private gameFrame: GameFrame;
  private gamePointer: GamePointer;
  private gameKeyboard: GameKeyboard;

  private timers: TimerService[] = [];

  private readonly transitionService: ScreenTransitionService;
  private readonly apiService: ApiService;
  private readonly cryptoService: CryptoService;
  private readonly webSocketService: WebSocketService;
  private readonly matchMakingService: MatchmakingService;
  private webRTCService: WebRTCService;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private debug = false
  ) {
    this.gameState = new GameState();
    this.gameFrame = new GameFrame();
    this.gamePointer = new GamePointer();
    this.gameKeyboard = new GameKeyboard();

    this.transitionService = new ScreenTransitionService(this.gameFrame);
    this.apiService = new ApiService();
    this.cryptoService = new CryptoService(this.gameState.getGameServer());
    this.webSocketService = new WebSocketService(this);
    this.webRTCService = new WebRTCService(this);
    this.matchMakingService = new MatchmakingService(this);
  }

  public getVersion(): string {
    return GAME_VERSION;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public isDebugging(): boolean {
    return this.debug;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getGameFrame(): GameFrame {
    return this.gameFrame;
  }

  public getGamePointer(): GamePointer {
    return this.gamePointer;
  }

  public getGameKeyboard(): GameKeyboard {
    return this.gameKeyboard;
  }

  public getTimers(): TimerService[] {
    return this.timers;
  }

  public addTimer(
    seconds: number,
    callback: () => void,
    start = true
  ): TimerService {
    const timerService = new TimerService(seconds, callback, start);
    this.timers.push(timerService);

    console.log("Added timer, updated timers count", this.timers.length);

    return timerService;
  }

  public removeTimer(timer: TimerService): void {
    const index = this.timers.indexOf(timer);

    if (index !== -1) {
      this.timers.splice(index, 1);
    }

    console.log("Removed timer, updated timers count", this.timers.length);
  }

  public getTransitionService(): ScreenTransitionService {
    return this.transitionService;
  }

  public getApiService(): ApiService {
    return this.apiService;
  }

  public getCryptoService(): CryptoService {
    return this.cryptoService;
  }

  public getWebSocketService(): WebSocketService {
    return this.webSocketService;
  }

  public getMatchmakingService(): MatchmakingService {
    return this.matchMakingService;
  }

  public getWebRTCService(): WebRTCService {
    return this.webRTCService;
  }
}
