import { GameServer } from "../models/game-server.js";
import { GameState } from "../models/game-state.js";
import { LoadingBackgroundObject } from "../objects/backgrounds/loading-background-object.js";
import { ProgressBarObject } from "../objects/progress-bar-object.js";
import { ConfigurationService } from "../services/configuration-service.js";
import { GameLoopService } from "../services/game-loop-service.js";
import { GameServerService } from "../services/game-server-service.js";
import { RegistrationService } from "../services/registration-service.js";
import { ScreenManagerService } from "../services/screen-manager-service.js";
import { VersionService } from "../services/version-service.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { WorldScreen } from "./world-screen.js";

export class LoadingScreen extends BaseGameScreen {
  private gameState: GameState;
  private gameServer: GameServer;

  private screenManagerService: ScreenManagerService;

  private updateService: VersionService;
  private registrationService: RegistrationService;
  private configurationService: ConfigurationService;
  private gameServerService: GameServerService;

  private progressBarObject: ProgressBarObject | null = null;

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
    this.createProgressBarObject();
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

  private createProgressBarObject(): void {
    this.progressBarObject = new ProgressBarObject(this.canvas);
    this.progressBarObject.setText("Checking for updates...");
    this.uiObjects.push(this.progressBarObject);
  }

  private checkForUpdates(): void {
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
    this.progressBarObject?.setText("Registering to the server...");
    this.progressBarObject?.setProgress(0.2);

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
    this.progressBarObject?.setText("Downloading server configuration...");
    this.progressBarObject?.setProgress(0.4);

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
    this.progressBarObject?.setText("Connecting to the server...");
    this.progressBarObject?.setProgress(0.6);

    this.gameServerService.connectToServer();
  }

  private downloadServerMessage(): void {
    this.progressBarObject?.setText("Downloading server message...");
    this.progressBarObject?.setProgress(0.8);

    alert("Server message goes here");

    this.transitionToWorldScreen();
  }

  private transitionToWorldScreen(): void {
    this.progressBarObject?.setText("Loading world screen...");
    this.progressBarObject?.setProgress(1);

    const worldScreen = new WorldScreen(this.gameLoop);
    worldScreen.loadObjects();

    this.screenManagerService.fadeOutAndIn(worldScreen, 1, 2);
  }
}
