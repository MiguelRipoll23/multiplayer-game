import { GameServer } from "../../models/game-server.js";
import { GameState } from "../../models/game-state.js";
import { MainBackgroundObject } from "../../objects/backgrounds/main-background-object.js";
import { MessageObject } from "../../objects/message-object.js";
import { CryptoService } from "../../services/crypto-service.js";
import { GameLoopService } from "../../services/game-loop-service.js";
import { WebSocketService } from "../../services/websocket-service.js";
import { ApiService } from "../../services/api-service.js";
import { TransitionService } from "../../services/transition-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { RegistrationResponse } from "../../services/interfaces/registration-response.js";
import { GameRegistration } from "../../models/game-registration.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";

export class LoginScreen extends BaseGameScreen {
  private gameState: GameState;
  private gameServer: GameServer;
  private apiService: ApiService;
  private cryptoService: CryptoService;
  private webSocketService: WebSocketService;

  private messageObject: MessageObject | null = null;

  constructor(private readonly gameLoop: GameLoopService) {
    super(gameLoop);

    this.gameState = gameLoop.getGameState();
    this.gameServer = gameLoop.getGameState().getGameServer();

    this.apiService = new ApiService();
    this.cryptoService = new CryptoService(this.gameServer);
    this.webSocketService = new WebSocketService(this);
  }

  public override loadObjects(): void {
    this.createMessageObject();
    super.loadObjects();
  }

  public getGameState(): GameState {
    return this.gameState;
  }

  public hasTransitionFinished(): void {
    this.checkForUpdates();
  }

  public hasConnectedToServer(): void {
    this.transitionToMatchmakingScreen();
  }

  private createMessageObject(): void {
    this.messageObject = new MessageObject(this.canvas);
    this.uiObjects.push(this.messageObject);
  }

  private checkForUpdates(): void {
    this.messageObject?.setText("Checking for updates...");
    this.messageObject?.setActive(true);

    this.apiService.checkForUpdates().then((requiresUpdate) => {
      if (requiresUpdate) {
        return alert("An update is required to play the game");
      }

      this.registerUser();
    }).catch((error) => {
      console.error(error);
      alert("An error occurred while checking for updates");
    });
  }

  private registerUser(): void {
    const name = prompt("Please enter your player handle:", "player1");

    if (name === null) {
      return this.registerUser();
    }

    this.apiService.registerUser(name)
      .then((registrationResponse: RegistrationResponse) => {
        this.gameServer.setGameRegistration(
          new GameRegistration(registrationResponse),
        );

        this.downloadConfiguration();
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while registering to the server");
      });
  }

  private downloadConfiguration(): void {
    this.messageObject?.setText("Downloading configuration...");

    this.apiService.getConfiguration()
      .then(async (configurationResponse: ArrayBuffer) => {
        await this.applyConfiguration(configurationResponse);
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while downloading configuration");
      });
  }

  private async applyConfiguration(
    configurationResponse: ArrayBuffer,
  ): Promise<void> {
    const decryptedResponse = await this.cryptoService.decryptResponse(
      configurationResponse,
    );

    const configuration = JSON.parse(decryptedResponse);
    this.gameServer.setConfiguration(configuration);

    console.log("Configuration response", configuration);

    this.connectToServer();
  }

  private connectToServer(): void {
    this.messageObject?.setText("Connecting to the server...");
    this.webSocketService.connectToServer();
  }

  private transitionToMatchmakingScreen(): void {
    this.messageObject?.setActive(false);

    const matchmakingScreen = new MatchmakingScreen(this.gameLoop);
    matchmakingScreen.loadObjects();

    this.screenManagerService?.getTransitionService().crossfade(
      matchmakingScreen,
      1,
    );
  }
}
