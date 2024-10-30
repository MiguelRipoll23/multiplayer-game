import { MessageObject } from "../../objects/common/message-object.js";
import { CryptoService } from "../../services/crypto-service.js";
import { WebSocketService } from "../../services/websocket-service.js";
import { ApiService } from "../../services/api-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { RegistrationResponse } from "../../services/interfaces/registration-response.js";
import { GameRegistration } from "../../models/game-registration.js";
import { MainMenuScreen } from "./main-menu-screen.js";
import { GameController } from "../../models/game-controller.js";
import { CloseableMessageObject } from "../../objects/common/closeable-message-object.js";
import { GameState } from "../../models/game-state.js";
import {
  SERVER_CONNECTED_EVENT,
  SERVER_DISCONNECTED_EVENT,
} from "../../constants/events-constants.js";

export class LoginScreen extends BaseGameScreen {
  private gameState: GameState;
  private apiService: ApiService;
  private cryptoService: CryptoService;
  private webSocketService: WebSocketService;

  private messageObject: MessageObject | null = null;
  private errorCloseableMessageObject: CloseableMessageObject | null = null;

  constructor(gameController: GameController) {
    super(gameController);

    this.gameState = gameController.getGameState();
    this.apiService = gameController.getApiService();
    this.cryptoService = gameController.getCryptoService();
    this.webSocketService = gameController.getWebSocketService();

    this.addCustomEventListeners();
  }

  public override loadObjects(): void {
    this.loadMessageObject();
    this.loadCloseableMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.checkForUpdates();
  }

  private addCustomEventListeners(): void {
    window.addEventListener(SERVER_CONNECTED_EVENT, () => {
      this.handleServerConnectedEvent();
    });

    window.addEventListener(SERVER_DISCONNECTED_EVENT, () => {
      this.handleServerDisconnectedEvent();
    });
  }

  private handleServerConnectedEvent(): void {
    console.log(`Event ${SERVER_CONNECTED_EVENT} handled`);
    this.messageObject?.hide();
    this.transitionToMatchmakingScreen();
  }

  private handleServerDisconnectedEvent(): void {
    this.showError("Couldn't connect to the server");
  }

  private loadMessageObject(): void {
    this.messageObject = new MessageObject(this.canvas);
    this.uiObjects.push(this.messageObject);
  }

  public loadCloseableMessageObject(): void {
    this.errorCloseableMessageObject = new CloseableMessageObject(this.canvas);
    this.uiObjects.push(this.errorCloseableMessageObject);
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.handleErrorCloseableMessageObject();
    super.update(deltaTimeStamp);
  }

  private showError(message: string): void {
    this.messageObject?.setOpacity(0);
    this.errorCloseableMessageObject?.show(message);
  }

  private handleErrorCloseableMessageObject(): void {
    if (this.errorCloseableMessageObject?.isPressed()) {
      window.location.reload();
    }
  }

  private checkForUpdates(): void {
    this.messageObject?.show("Checking for updates...");

    this.apiService
      .checkForUpdates()
      .then((requiresUpdate) => {
        if (requiresUpdate) {
          return this.showError("An update is required to play the game");
        }

        this.messageObject?.hide();
        this.registerUser();
      })
      .catch((error) => {
        console.error(error);
        this.showError("An error occurred while checking for updates");
      });
  }

  private registerUser(): void {
    const name = prompt("Player name:", "player1");

    if (name === null) {
      return this.registerUser();
    }

    this.apiService
      .registerUser(name)
      .then((registrationResponse: RegistrationResponse) => {
        this.gameState.getGamePlayer().setName(name);

        this.gameState
          .getGameServer()
          .setGameRegistration(new GameRegistration(registrationResponse));

        this.downloadConfiguration();
      })
      .catch((error) => {
        console.error(error);
        this.showError("An error occurred while registering to the server");
      });
  }

  private downloadConfiguration(): void {
    this.messageObject?.show("Downloading configuration...");

    this.apiService
      .getConfiguration()
      .then(async (configurationResponse: ArrayBuffer) => {
        await this.applyConfiguration(configurationResponse);
      })
      .catch((error) => {
        console.error(error);
        this.showError("An error occurred while downloading configuration");
      });
  }

  private async applyConfiguration(
    configurationResponse: ArrayBuffer
  ): Promise<void> {
    const decryptedResponse = await this.cryptoService.decryptResponse(
      configurationResponse
    );

    const configuration = JSON.parse(decryptedResponse);
    this.gameState.getGameServer().setConfiguration(configuration);

    console.log("Configuration response (decrypted)", configuration);

    this.connectToServer();
  }

  private connectToServer(): void {
    this.messageObject?.show("Connecting to the server...");
    this.webSocketService.connectToServer();
  }

  private transitionToMatchmakingScreen(): void {
    const mainMenuScreen = new MainMenuScreen(this.gameController);
    mainMenuScreen.loadObjects();

    this.screenManagerService
      ?.getTransitionService()
      .crossfade(mainMenuScreen, 0.2);
  }
}
