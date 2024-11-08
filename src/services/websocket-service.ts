import {
  API_BASE_URL,
  API_WS_PROTOCOL,
  WEBSOCKET_BASE_URL,
  WEBSOCKET_ENDPOINT,
} from "../constants/api-constants.js";
import {
  SERVER_CONNECTED_EVENT,
  SERVER_DISCONNECTED_EVENT,
  SERVER_ICE_CANDIDATE_EVENT,
  SERVER_NOTIFICATION_EVENT,
  SERVER_SESSION_DESCRIPTION_EVENT,
} from "../constants/events-constants.js";
import {
  NOTIFICATION_ID,
  TUNNEL_ID,
} from "../constants/websocket-constants.js";
import { GameState } from "../models/game-state.js";
import { GameController } from "../models/game-controller.js";
import {
  ICE_CANDIDATE_ID,
  SESSION_DESCRIPTION_ID,
} from "../constants/websocket-constants.js";

export class WebSocketService {
  private gameState: GameState;
  private webSocket: WebSocket | null = null;

  constructor(gameController: GameController) {
    this.gameState = gameController.getGameState();
  }

  public connectToServer(): void {
    const gameServer = this.gameState.getGameServer();
    const gameRegistration = gameServer.getGameRegistration();

    if (gameRegistration === null) {
      throw new Error("Game registration not found");
    }

    const authenticationToken = gameRegistration.getAuthenticationToken();

    this.webSocket = new WebSocket(
      WEBSOCKET_BASE_URL +
        WEBSOCKET_ENDPOINT +
        `?access_token=${authenticationToken}`
    );

    this.webSocket.binaryType = "arraybuffer";
    this.addEventListeners(this.webSocket);
  }

  public sendTunnelMessage(payload: Uint8Array) {
    const message = new Uint8Array([TUNNEL_ID, ...payload]);
    this.webSocket?.send(message);

    console.log("Sent tunnel message:", message);
  }

  private addEventListeners(webSocket: WebSocket): void {
    webSocket.addEventListener("open", () => {
      this.handleConnection();
    });

    webSocket.addEventListener("close", (event) => {
      this.handleDisconnection(event);
    });

    webSocket.addEventListener("error", (event) => {
      console.error("WebSocket error", event);
    });

    webSocket.addEventListener("message", (event) => {
      this.handleMessage(new Uint8Array(event.data));
    });
  }

  private handleConnection(): void {
    console.log("Connected to server");
    this.gameState.getGameServer().setConnected(true);
    dispatchEvent(new CustomEvent(SERVER_CONNECTED_EVENT));
  }

  private handleDisconnection(event: CloseEvent): void {
    console.log("Connection closed", event);

    dispatchEvent(
      new CustomEvent(SERVER_DISCONNECTED_EVENT, {
        detail: {
          connectionLost: this.gameState.getGameServer().isConnected(),
        },
      })
    );

    this.gameState.getGameServer().setConnected(false);
  }

  private handleMessage(data: Uint8Array) {
    console.log("Received message from server", data);

    const id = data[0];
    const payload = data.length > 1 ? data.slice(1) : null;

    switch (id) {
      case NOTIFICATION_ID:
        return this.handleNotification(payload);

      case TUNNEL_ID:
        return this.handleTunnelMessage(payload);

      default: {
        console.warn("Unknown websocket message identifier", id);
      }
    }
  }

  private handleNotification(payload: Uint8Array | null) {
    if (payload === null) {
      return console.warn("Received empty notification");
    }

    const text = new TextDecoder("utf-8").decode(payload);

    dispatchEvent(
      new CustomEvent(SERVER_NOTIFICATION_EVENT, { detail: { text } })
    );
  }

  private handleTunnelMessage(payload: Uint8Array | null) {
    if (payload === null) {
      return console.warn("Received empty tunnel message");
    } else if (payload.length < 33) {
      return console.warn("Invalid tunnel message length", payload);
    }

    const originTokenBytes = payload.slice(0, 32);
    const webrtcType = payload[32];
    const webrtcDataBytes = payload.slice(33);

    const originToken = btoa(String.fromCharCode(...originTokenBytes));

    const webrtcData = JSON.parse(
      new TextDecoder("utf-8").decode(webrtcDataBytes)
    );

    console.log("Tunnel message", originToken, webrtcType, webrtcData);

    this.handleWebRTCMessage(originToken, webrtcType, webrtcData);
  }

  private handleWebRTCMessage(
    originToken: string,
    type: number,
    webrtcData: any
  ) {
    switch (type) {
      case SESSION_DESCRIPTION_ID: {
        this.handleSessionDescriptionMessage(originToken, webrtcData);
        break;
      }

      case ICE_CANDIDATE_ID: {
        this.handleIceCandidateMessage(originToken, webrtcData);
        break;
      }

      default: {
        console.warn("Unknown WebRTC message type", type);
      }
    }
  }

  private handleSessionDescriptionMessage(
    originToken: string,
    rtcSessionDescription: RTCSessionDescriptionInit
  ) {
    dispatchEvent(
      new CustomEvent(SERVER_SESSION_DESCRIPTION_EVENT, {
        detail: { originToken, rtcSessionDescription },
      })
    );
  }

  private handleIceCandidateMessage(
    originToken: string,
    iceCandidate: RTCIceCandidateInit
  ) {
    console.log("Received ICE candidate...", originToken, iceCandidate);
    dispatchEvent(
      new CustomEvent(SERVER_ICE_CANDIDATE_EVENT, {
        detail: { originToken, iceCandidate },
      })
    );
  }
}
