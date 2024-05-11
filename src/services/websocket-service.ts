import {
  API_SERVER,
  API_WS_PROTOCOL,
  WEBSOCKET_ENDPOINT,
} from "../constants/api.js";
import { GameState } from "../models/game-state.js";
import { MainScreen } from "../screens/main-screen.js";

export class WebSocketService {
  private gameState: GameState;

  private webSocket: WebSocket | null = null;
  private loadingScreen: MainScreen | null = null;

  constructor(
    loadingScreen: MainScreen,
  ) {
    this.loadingScreen = loadingScreen;
    this.gameState = loadingScreen.getGameState();
  }

  public connectToServer(): void {
    const gameServer = this.gameState.getGameServer();
    const gameRegistration = gameServer.getGameRegistration();

    if (gameRegistration === null) {
      throw new Error("Game registration not found");
    }

    const authenticationToken = gameRegistration.getAuthenticationToken();

    this.webSocket = new WebSocket(
      API_WS_PROTOCOL + API_SERVER + WEBSOCKET_ENDPOINT +
        `?access_token=${authenticationToken}`,
    );

    this.webSocket.binaryType = "arraybuffer";
    this.addEventListeners(this.webSocket);
  }

  private addEventListeners(webSocket: WebSocket): void {
    webSocket.addEventListener("open", (event) => {
      console.log("Connected to server");
      this.gameState.getGameServer().setConnected(true);
      this.informLoadingScreen();
    });

    webSocket.addEventListener("close", (event) => {
      console.log("Connection closed", event);

      if (this.gameState.getGameServer().isConnected()) {
        alert("Connection to server was lost");
      } else {
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

  private informLoadingScreen(): void {
    this.loadingScreen?.hasConnectedToServer();
    this.loadingScreen = null;
  }
}
