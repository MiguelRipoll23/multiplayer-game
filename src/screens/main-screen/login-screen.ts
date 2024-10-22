import { GameServer } from "../../models/game-server.js";
import { MessageObject } from "../../objects/common/message-object.js";
import { CryptoService } from "../../services/crypto-service.js";
import { WebSocketService } from "../../services/websocket-service.js";
import { ApiService } from "../../services/api-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { RegistrationResponse } from "../../services/interfaces/registration-response.js";
import { GameRegistration } from "../../models/game-registration.js";
import { MainMenuScreen } from "./main-menu-screen.js";
import { GameController } from "../../models/game-controller.js";
import { SERVER_CONNECTED_EVENT } from "../../constants/events-contants.js";

export class LoginScreen extends BaseGameScreen {
  private gameServer: GameServer;
  private apiService: ApiService;
  private cryptoService: CryptoService;
  private webSocketService: WebSocketService;

  private messageObject: MessageObject | null = null;

  constructor(gameController: GameController) {
    super(gameController);

    this.gameServer = gameController.getGameState().getGameServer();
    this.apiService = gameController.getApiService();
    this.cryptoService = gameController.getCryptoService();
    this.webSocketService = gameController.getWebSocketService();

    this.addCustomEventListeners();
  }

  public override loadObjects(): void {
    this.loadMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.checkForUpdates();
  }

  public hasConnectedToServer(): void {
    this.messageObject?.hide();
    this.transitionToMatchmakingScreen();
  }

  private addCustomEventListeners(): void {
    window.addEventListener(SERVER_CONNECTED_EVENT, () => {
      this.hasConnectedToServer();
    });
  }

  private loadMessageObject(): void {
    this.messageObject = new MessageObject(this.canvas);
    this.uiObjects.push(this.messageObject);
  }

  private checkForUpdates(): void {
    this.messageObject?.show("Checking for updates...");

    this.apiService.checkForUpdates().then((requiresUpdate) => {
      if (requiresUpdate) {
        return alert("An update is required to play the game");
      }

      this.messageObject?.hide();
      this.registerUser();
    }).catch((error) => {
      console.error(error);
      alert("An error occurred while checking for updates");
    });
  }

  private registerUser(): void {
    const name = prompt("Player name:", "player1");

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
    this.messageObject?.show("Downloading configuration...");

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

    this.screenManagerService?.getTransitionService().crossfade(
      mainMenuScreen,
      0.2,
    );
  }
}
