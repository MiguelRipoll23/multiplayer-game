import { LoadingBackgroundObject } from "../objects/backgrounds/loading-background-object.js";
import { ProgressBarObject } from "../objects/progress-bar-object.js";
import { ConfigurationService } from "../services/configuration-service.js";
import { GameServerService } from "../services/game-server-service.js";
import { RegistrationService } from "../services/registration-service.js";
import { VersionService } from "../services/version-service.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { WorldScreen } from "./world-screen.js";
export class LoadingScreen extends BaseGameScreen {
    gameLoop;
    gameState;
    gameServer;
    screenManagerService;
    updateService;
    registrationService;
    configurationService;
    gameServerService;
    progressBarObject = null;
    constructor(gameLoop) {
        super(gameLoop);
        this.gameLoop = gameLoop;
        this.gameState = gameLoop.getGameState();
        this.gameServer = gameLoop.getGameState().getGameServer();
        this.screenManagerService = gameLoop.getScreenManager();
        this.updateService = new VersionService();
        this.registrationService = new RegistrationService(this.gameServer);
        this.configurationService = new ConfigurationService(this.gameServer);
        this.gameServerService = new GameServerService(this);
    }
    loadObjects() {
        this.createLoadingBackgroundObject();
        this.createProgressBarObject();
        super.loadObjects();
    }
    getGameState() {
        return this.gameState;
    }
    hasTransitionFinished() {
        this.checkForUpdates();
    }
    hasConnectedToServer() {
        this.downloadServerMessage();
    }
    createLoadingBackgroundObject() {
        const loadingBackground = new LoadingBackgroundObject(this.canvas);
        this.sceneObjects.push(loadingBackground);
    }
    createProgressBarObject() {
        this.progressBarObject = new ProgressBarObject(this.canvas);
        this.progressBarObject.setText("Checking for updates...");
        this.uiObjects.push(this.progressBarObject);
    }
    checkForUpdates() {
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
    registerUser() {
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
    downloadConfiguration() {
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
    connectToServer() {
        this.progressBarObject?.setText("Connecting to the server...");
        this.progressBarObject?.setProgress(0.6);
        this.gameServerService.connectToServer();
    }
    downloadServerMessage() {
        this.progressBarObject?.setText("Downloading server message...");
        this.progressBarObject?.setProgress(0.8);
        alert("Server message goes here");
        this.transitionToWorldScreen();
    }
    transitionToWorldScreen() {
        this.progressBarObject?.setText("Loading world screen...");
        this.progressBarObject?.setProgress(1);
        const worldScreen = new WorldScreen(this.gameLoop);
        worldScreen.loadObjects();
        this.screenManagerService.fadeOutAndIn(worldScreen, 1, 2);
    }
}
