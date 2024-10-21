import { ApiService } from "../services/api-service.js";
import { CryptoService } from "../services/crypto-service.js";
import { TransitionService } from "../services/transition-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { GameFrame } from "./game-frame.js";
import { GamePointer } from "./game-pointer.js";
import { GameState } from "./game-state.js";

export class GameController {
  private gameState!: GameState;
  private gameFrame!: GameFrame;
  private gamePointer!: GamePointer;

  private transitionService!: TransitionService;
  private apiService!: ApiService;
  private cryptoService!: CryptoService;
  private webSocketService!: WebSocketService;

  constructor(private canvas: HTMLCanvasElement, private debug: boolean) {
    this.canvas = canvas;

    this.createModels();
    this.createServices();
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

  private createModels(): void {
    this.gameState = new GameState();
    this.gameFrame = new GameFrame();
    this.gamePointer = new GamePointer();
  }

  private createServices(): void {
    this.transitionService = new TransitionService(this.gameFrame);
    this.apiService = new ApiService();
    this.cryptoService = new CryptoService(this.gameState.getGameServer());
    this.webSocketService = new WebSocketService(this);
  }
}
