import { LoadingBackgroundObject } from "../objects/backgrounds/loading-background-object.js";
import { DialogObject } from "../objects/dialog-object.js";
import { ConfigurationService } from "../services/configuration-service.js";
import { GameServerService } from "../services/game-server-service.js";
import { MatchmakingService } from "../services/matchmaking-service.js";
import { RegistrationService } from "../services/registration-service.js";
import { VersionService } from "../services/version-service.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { WorldScreen } from "./world-screen.js";
export class MainScreen extends BaseGameScreen {
    gameLoop;
    gameState;
    gameServer;
    screenManagerService;
    updateService;
    registrationService;
    configurationService;
    matchmakingService;
    gameServerService;
    dialogObject = null;
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
        this.matchmakingService = new MatchmakingService();
    }
    loadObjects() {
        this.createLoadingBackgroundObject();
        this.createdialogObject();
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
    createdialogObject() {
        this.dialogObject = new DialogObject(this.canvas);
        this.uiObjects.push(this.dialogObject);
    }
    checkForUpdates() {
        this.dialogObject?.setText("Checking for updates...");
        this.dialogObject?.setActive(true);
        this.updateService.checkForUpdates().then((requiresUpdate) => {
            if (requiresUpdate) {
                return this.updateService.applyUpdate();
            }
            this.dialogObject?.setActive(false);
            setTimeout(() => this.registerUser(), 200);
        }).catch((error) => {
            console.error(error);
            alert("An error occurred while checking for updates");
        });
    }
    registerUser() {
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
    connectToServer() {
        this.dialogObject?.setText("Connecting to the server...");
        this.gameServerService.connectToServer();
    }
    downloadServerMessage() {
        this.dialogObject?.setActive(true);
        this.dialogObject?.setText("Downloading server message...");
        this.matchmakingService.getServerMessage().then((message) => {
            this.dialogObject?.setActive(false);
            setTimeout(() => {
                alert(message);
                this.transitionToWorldScreen();
            }, 200);
        }).catch((error) => {
            console.error(error);
            alert("An error occurred while downloading server message");
        });
    }
    transitionToWorldScreen() {
        this.dialogObject?.setActive(false);
        const worldScreen = new WorldScreen(this.gameLoop);
        worldScreen.loadObjects();
        this.screenManagerService.fadeOutAndIn(worldScreen, 1, 2);
    }
}
