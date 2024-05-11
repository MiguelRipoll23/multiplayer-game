import { API_SERVER, API_WS_PROTOCOL, WEBSOCKET_ENDPOINT, } from "../constants/api-constants.js";
export class WebSocketService {
    gameState;
    webSocket = null;
    loadingScreen = null;
    constructor(loadingScreen) {
        this.loadingScreen = loadingScreen;
        this.gameState = loadingScreen.getGameState();
    }
    connectToServer() {
        const gameServer = this.gameState.getGameServer();
        const gameRegistration = gameServer.getGameRegistration();
        if (gameRegistration === null) {
            throw new Error("Game registration not found");
        }
        const authenticationToken = gameRegistration.getAuthenticationToken();
        this.webSocket = new WebSocket(API_WS_PROTOCOL + API_SERVER + WEBSOCKET_ENDPOINT +
            `?access_token=${authenticationToken}`);
        this.webSocket.binaryType = "arraybuffer";
        this.addEventListeners(this.webSocket);
    }
    addEventListeners(webSocket) {
        webSocket.addEventListener("open", (event) => {
            console.log("Connected to server");
            this.gameState.getGameServer().setConnected(true);
            this.informLoadingScreen();
        });
        webSocket.addEventListener("close", (event) => {
            console.log("Connection closed", event);
            if (this.gameState.getGameServer().isConnected()) {
                alert("Connection to server was lost");
            }
            else {
                alert("Failed to connect to server");
            }
            this.gameState.getGameServer().setConnected(false);
        });
        webSocket.addEventListener("error", (event) => {
            console.error("WebSocket error", event);
        });
        webSocket.addEventListener("message", (event) => {
            // TODO
        });
    }
    informLoadingScreen() {
        this.loadingScreen?.hasConnectedToServer();
        this.loadingScreen = null;
    }
}
