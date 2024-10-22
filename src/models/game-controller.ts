import { ApiService } from "../services/api-service.js";
import { CryptoService } from "../services/crypto-service.js";
import { TransitionService } from "../services/transition-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { GameFrame } from "./game-frame.js";
import { GamePointer } from "./game-pointer.js";
import { GameState } from "./game-state.js";

export class GameController {
  private gameState: GameState;
  private gameFrame: GameFrame;
  private gamePointer: GamePointer;

  private readonly transitionService: TransitionService;
  private readonly apiService: ApiService;
  private readonly cryptoService: CryptoService;
  private readonly webSocketService: WebSocketService;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private debug = false,
  ) {
    this.gameState = new GameState();
    this.gameFrame = new GameFrame();
    this.gamePointer = new GamePointer();

    this.transitionService = new TransitionService(this.gameFrame);
    this.apiService = new ApiService();
    this.cryptoService = new CryptoService(this.gameState.getGameServer());
    this.webSocketService = new WebSocketService(this);
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

  public getTransitionService(): TransitionService {
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
}
