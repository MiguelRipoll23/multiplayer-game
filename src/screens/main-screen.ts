import { GameServer } from "../models/game-server.js";
import { GameState } from "../models/game-state.js";
import { LoadingBackgroundObject } from "../objects/backgrounds/loading-background-object.js";
import { DialogObject } from "../objects/dialog-object.js";
import { ConfigurationService } from "../services/configuration-service.js";
import { GameLoopService } from "../services/game-loop-service.js";
import { GameServerService } from "../services/game-server-service.js";
import { RegistrationService } from "../services/registration-service.js";
import { ScreenManagerService } from "../services/screen-manager-service.js";
import { VersionService } from "../services/version-service.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { WorldScreen } from "./world-screen.js";

export class MainScreen extends BaseGameScreen {
  private gameState: GameState;
  private gameServer: GameServer;

  private screenManagerService: ScreenManagerService;

  private updateService: VersionService;
  private registrationService: RegistrationService;
  private configurationService: ConfigurationService;
  private gameServerService: GameServerService;

  private dialogObject: DialogObject | null = null;

  constructor(private readonly gameLoop: GameLoopService) {
    super(gameLoop);

    this.gameState = gameLoop.getGameState();
    this.gameServer = gameLoop.getGameState().getGameServer();
    this.screenManagerService = gameLoop.getScreenManager();

    this.updateService = new VersionService();
    this.registrationService = new RegistrationService(this.gameServer);
    this.configurationService = new ConfigurationService(this.gameServer);
    this.gameServerService = new GameServerService(this);
  }

  public override loadObjects(): void {
    this.createLoadingBackgroundObject();
    this.createdialogObject();
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
    const loadingBackground = new LoadingBackgroundObject(this.canvas);
    this.sceneObjects.push(loadingBackground);
  }

  private createdialogObject(): void {
    this.dialogObject = new DialogObject(this.canvas);
    this.uiObjects.push(this.dialogObject);
  }

  private checkForUpdates(): void {
    this.dialogObject?.setText("Checking for updates...");
    this.dialogObject?.setActive(true);

    this.updateService.checkForUpdates().then((requiresUpdate) => {
      if (requiresUpdate) {
        return this.updateService.applyUpdate();
      }

      this.registerUser();
    }).catch((error) => {
      console.error(error);
      alert("An error occurred while checking for updates");
    });
  }

  private registerUser(): void {
    this.dialogObject?.setText("Registering to the server...");

    this.registrationService.registerUser()
      .then(() => {
        this.downloadConfiguration();
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while registering to the server");
      });
  }

  private downloadConfiguration(): void {
    this.dialogObject?.setText("Downloading server configuration...");

    this.configurationService.downloadFromServer()
      .then(() => {
        this.connectToServer();
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while downloading server configuration");
      });
  }

  private connectToServer(): void {
    this.dialogObject?.setText("Connecting to the server...");

    this.gameServerService.connectToServer();
  }

  private downloadServerMessage(): void {
    this.dialogObject?.setActive(true);
    this.dialogObject?.setText("Downloading server message...");

    setTimeout(() => {
      alert("Server message goes here");

      this.transitionToWorldScreen();
    }, 100);
  }

  private transitionToWorldScreen(): void {
    this.dialogObject?.setActive(false);

    const worldScreen = new WorldScreen(this.gameLoop);
    worldScreen.loadObjects();

    this.screenManagerService.fadeOutAndIn(worldScreen, 1, 2);
  }
}
