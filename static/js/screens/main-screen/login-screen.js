import { MessageObject } from "../../objects/message-object.js";
import { CryptoService } from "../../services/crypto-service.js";
import { WebSocketService } from "../../services/websocket-service.js";
import { ApiService } from "../../services/api-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { GameRegistration } from "../../models/game-registration.js";
import { MatchmakingScreen } from "./matchmaking-screen.js";
export class LoginScreen extends BaseGameScreen {
    gameLoop;
    gameState;
    gameServer;
    apiService;
    cryptoService;
    webSocketService;
    messageObject = null;
    constructor(gameLoop) {
        super(gameLoop);
        this.gameLoop = gameLoop;
        this.gameState = gameLoop.getGameState();
        this.gameServer = gameLoop.getGameState().getGameServer();
        this.apiService = new ApiService();
        this.cryptoService = new CryptoService(this.gameServer);
        this.webSocketService = new WebSocketService(this);
    }
    loadObjects() {
        this.createMessageObject();
        super.loadObjects();
    }
    getGameState() {
        return this.gameState;
    }
    hasTransitionFinished() {
        this.checkForUpdates();
    }
    hasConnectedToServer() {
        this.messageObject?.hide();
        this.transitionToMatchmakingScreen();
    }
    createMessageObject() {
        this.messageObject = new MessageObject(this.canvas);
        this.uiObjects.push(this.messageObject);
    }
    checkForUpdates() {
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
    registerUser() {
        const name = prompt("Please enter your player handle:", "player1");
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
        this.messageObject?.show("Downloading configuration...");
        this.apiService.getConfiguration()
            .then(async (configurationResponse) => {
            await this.applyConfiguration(configurationResponse);
        })
            .catch((error) => {
            console.error(error);
            alert("An error occurred while downloading configuration");
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
        this.messageObject?.show("Connecting to the server...");
        this.webSocketService.connectToServer();
    }
    transitionToMatchmakingScreen() {
        const matchmakingScreen = new MatchmakingScreen(this.gameLoop);
        matchmakingScreen.loadObjects();
        this.screenManagerService?.getTransitionService().crossfade(matchmakingScreen, 1);
    }
}
