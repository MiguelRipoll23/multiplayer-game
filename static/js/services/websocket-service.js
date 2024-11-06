import { WEBSOCKET_BASE_URL, WEBSOCKET_ENDPOINT, } from "../constants/api-constants.js";
import { SERVER_CONNECTED_EVENT, SERVER_DISCONNECTED_EVENT, SERVER_NOTIFICATION_EVENT, } from "../constants/events-constants.js";
import { NOTIFICATION_ID, TUNNEL_ID, } from "../constants/websocket-constants.js";
export class WebSocketService {
    gameState;
    webSocket = null;
    constructor(gameController) {
        this.gameState = gameController.getGameState();
    }
    connectToServer() {
        const gameServer = this.gameState.getGameServer();
        const gameRegistration = gameServer.getGameRegistration();
        if (gameRegistration === null) {
            throw new Error("Game registration not found");
        }
        const authenticationToken = gameRegistration.getAuthenticationToken();
        this.webSocket = new WebSocket(WEBSOCKET_BASE_URL +
            WEBSOCKET_ENDPOINT +
            `?access_token=${authenticationToken}`);
        this.webSocket.binaryType = "arraybuffer";
        this.addEventListeners(this.webSocket);
    }
    sendTunnelMessage(token) {
        const message = new Uint8Array([TUNNEL_ID, ...token]);
        this.webSocket?.send(message);
        console.log("Sent tunnel message:", message);
    }
    addEventListeners(webSocket) {
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
    handleConnection() {
        console.log("Connected to server");
        this.gameState.getGameServer().setConnected(true);
        dispatchEvent(new CustomEvent(SERVER_CONNECTED_EVENT));
    }
    handleDisconnection(event) {
        console.log("Connection closed", event);
        dispatchEvent(new CustomEvent(SERVER_DISCONNECTED_EVENT, {
            detail: {
                connectionLost: this.gameState.getGameServer().isConnected(),
            },
        }));
        this.gameState.getGameServer().setConnected(false);
    }
    handleMessage(data) {
        console.log("Received message from server", data);
        const id = data[0];
        const payload = data.slice(1);
        switch (id) {
            case NOTIFICATION_ID: {
                this.handleNotification(payload);
                break;
            }
            case TUNNEL_ID: {
                this.handleTunnelMessage(payload);
                break;
            }
            default: {
                console.warn("Unknown websocket message identifier", id);
            }
        }
    }
    handleNotification(payload) {
        const text = new TextDecoder("utf-8").decode(payload);
        dispatchEvent(new CustomEvent(SERVER_NOTIFICATION_EVENT, { detail: { text } }));
    }
    handleTunnelMessage(payload) {
        const originTokenBytes = payload.slice(0, 32);
        const networkInformationBytes = payload.slice(32);
        const originToken = btoa(String.fromCharCode(...originTokenBytes));
        const networkInformation = new TextDecoder("utf-8").decode(networkInformationBytes);
        console.log("Tunnel message", originToken, networkInformation);
    }
}
