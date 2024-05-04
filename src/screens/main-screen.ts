import { GameServer } from "../models/game-server.js";
import { GameState } from "../models/game-state.js";
import { MainBackgroundObject } from "../objects/backgrounds/main-background-object.js";
import { MessageObject } from "../objects/message-object.js";
import { CryptoService } from "../services/crypto-service.js";
import { GameLoopService } from "../services/game-loop-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { ApiService } from "../services/api-service.js";
import { ScreenManagerService } from "../services/screen-manager-service.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { WorldScreen } from "./world-screen.js";
import { RegistrationResponse } from "../services/interfaces/registration-response.js";
import { GameRegistration } from "../models/game-registration.js";

export class MainScreen extends BaseGameScreen {
  private gameState: GameState;
  private gameServer: GameServer;

  private screenManagerService: ScreenManagerService;

  private apiService: ApiService;
  private cryptoService: CryptoService;
  private gameServerService: WebSocketService;

  private messageObject: MessageObject | null = null;

  constructor(private readonly gameLoop: GameLoopService) {
    super(gameLoop);

    this.gameState = gameLoop.getGameState();
    this.gameServer = gameLoop.getGameState().getGameServer();
    this.screenManagerService = gameLoop.getScreenManager();

    this.apiService = new ApiService(this.gameServer);
    this.cryptoService = new CryptoService(this.gameServer);
    this.gameServerService = new WebSocketService(this);
  }

  public override loadObjects(): void {
    this.createLoadingBackgroundObject();
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
    this.downloadServerMessage();
  }

  private createLoadingBackgroundObject() {
    const loadingBackground = new MainBackgroundObject(this.canvas);
    this.sceneObjects.push(loadingBackground);
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
    const name = prompt("Please enter your player handle", "player1");

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
    this.messageObject?.setText("Downloading server configuration...");

    this.apiService.getConfiguration()
      .then(async (configurationResponse: ArrayBuffer) => {
        await this.applyConfiguration(configurationResponse);
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while downloading server configuration");
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
    this.gameServerService.connectToServer();
  }

  private downloadServerMessage(): void {
    this.messageObject?.setActive(true);
    this.messageObject?.setText("Downloading server message...");

    this.apiService.getServerMessage().then((message) => {
      this.messageObject?.setActive(false);
      alert(message);
      this.transitionToWorldScreen();
    }).catch((error) => {
      console.error(error);
      alert("An error occurred while downloading server message");
    });
  }

  private transitionToWorldScreen(): void {
    this.messageObject?.setActive(false);

    const worldScreen = new WorldScreen(this.gameLoop);
    worldScreen.loadObjects();

    this.screenManagerService.fadeOutAndIn(worldScreen, 1, 2);
  }
}
