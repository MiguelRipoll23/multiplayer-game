import { MainBackgroundObject } from "../objects/backgrounds/main-background-object.js";
import { DialogObject } from "../objects/dialog-object.js";
import { CryptoService } from "../services/crypto-service.js";
import { WebSocketService } from "../services/websocket-service.js";
import { ApiService } from "../services/api-service.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { WorldScreen } from "./world-screen.js";
import { GameRegistration } from "../models/game-registration.js";
export class MainScreen extends BaseGameScreen {
    gameLoop;
    gameState;
    gameServer;
    screenManagerService;
    apiService;
    cryptoService;
    gameServerService;
    dialogObject = null;
    constructor(gameLoop) {
        super(gameLoop);
        this.gameLoop = gameLoop;
        this.gameState = gameLoop.getGameState();
        this.gameServer = gameLoop.getGameState().getGameServer();
        this.screenManagerService = gameLoop.getScreenManager();
        this.apiService = new ApiService(this.gameServer);
        this.cryptoService = new CryptoService(this.gameServer);
        this.gameServerService = new WebSocketService(this);
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
        const loadingBackground = new MainBackgroundObject(this.canvas);
        this.sceneObjects.push(loadingBackground);
    }
    createdialogObject() {
        this.dialogObject = new DialogObject(this.canvas);
        this.uiObjects.push(this.dialogObject);
    }
    checkForUpdates() {
        this.dialogObject?.setText("Checking for updates...");
        this.dialogObject?.setActive(true);
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
    registerUser() {
        const name = prompt("Please enter your player handle", "player1");
        if (name === null) {
            return this.registerUser();
        }
        this.apiService.registerUser(name)
            .then((registrationResponse) => {
            this.gameServer.setGameRegistration(new GameRegistration(registrationResponse));
            this.downloadConfiguration();
        })
            .catch((error) => {
            console.error(error);
            alert("An error occurred while registering to the server");
        });
    }
    downloadConfiguration() {
        this.dialogObject?.setText("Downloading server configuration...");
        this.apiService.getConfiguration()
            .then(async (configurationResponse) => {
            await this.applyConfiguration(configurationResponse);
        })
            .catch((error) => {
            console.error(error);
            alert("An error occurred while downloading server configuration");
        });
    }
    async applyConfiguration(configurationResponse) {
        const decryptedResponse = await this.cryptoService.decryptResponse(configurationResponse);
        const configuration = JSON.parse(decryptedResponse);
        this.gameServer.setConfiguration(configuration);
        console.log("Configuration response", configuration);
        this.connectToServer();
    }
    connectToServer() {
        this.dialogObject?.setText("Connecting to the server...");
        this.gameServerService.connectToServer();
    }
    downloadServerMessage() {
        this.dialogObject?.setActive(true);
        this.dialogObject?.setText("Downloading server message...");
        this.apiService.getServerMessage().then((message) => {
            this.dialogObject?.setActive(false);
            alert(message);
            this.transitionToWorldScreen();
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
