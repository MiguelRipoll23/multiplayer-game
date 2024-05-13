import { ApiService } from "../services/api-service.js";
import { CryptoService } from "../services/crypto-service.js";
import { TransitionService } from "../services/transition-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { GameFrame } from "./game-frame.js";
import { GameState } from "./game-state.js";

export class GameController {
  private canvas: HTMLCanvasElement;
  private gameState: GameState;
  private gameFrame: GameFrame;

  private transitionService: TransitionService;

  private apiService: ApiService;
  private cryptoService: CryptoService;
  private webSocketService: WebSocketService;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gameState = new GameState();
    this.gameFrame = new GameFrame();

    this.transitionService = new TransitionService(this.gameFrame);
    this.apiService = new ApiService();
    this.cryptoService = new CryptoService(this.gameState.getGameServer());
    this.webSocketService = new WebSocketService(this);
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public getGameFrame(): GameFrame {
    return this.gameFrame;
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
