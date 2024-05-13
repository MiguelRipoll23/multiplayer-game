import {
  API_SERVER,
  API_WS_PROTOCOL,
  WEBSOCKET_ENDPOINT,
} from "../constants/api-constants.js";
import { NOTIFICATION_EVENT_NAME } from "../constants/events-contants.js";
import { NOTIFICATION_ID } from "../constants/websocket-constants.js";
import { GameState } from "../models/game-state.js";
import { LoginScreen } from "../screens/main-screen/login-screen.js";
import { MainScreen } from "../screens/main-screen.js";

export class WebSocketService {
  private gameState: GameState;

  private webSocket: WebSocket | null = null;
  private loginScreen: LoginScreen | null = null;

  constructor(loadingScreen: LoginScreen) {
    this.loginScreen = loadingScreen;
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
      this.handleMessage(new Uint8Array(event.data));
    });
  }

  private informLoadingScreen(): void {
    this.loginScreen?.hasConnectedToServer();
    this.loginScreen = null;
  }

  private handleMessage(data: Uint8Array) {
    console.log("Received message from server", data);

    const id = data[0];
    const payload = data.slice(1);

    switch (id) {
      case NOTIFICATION_ID: {
        this.handleNotification(payload);
        break;
      }
    }
  }

  private handleNotification(payload: Uint8Array) {
    const text = new TextDecoder("utf-8").decode(payload);

    dispatchEvent(
      new CustomEvent(NOTIFICATION_EVENT_NAME, { detail: { text } }),
    );
  }
}
