import { WEBSOCKET_BASE_URL, WEBSOCKET_ENDPOINT, } from "../constants/api-constants.js";
import { SERVER_CONNECTED_EVENT, SERVER_DISCONNECTED_EVENT, SERVER_ICE_CANDIDATE_EVENT, SERVER_NOTIFICATION_EVENT, SERVER_SESSION_DESCRIPTION_EVENT, } from "../constants/events-constants.js";
import { NOTIFICATION_ID, TUNNEL_ID, } from "../constants/websocket-constants.js";
import { ICE_CANDIDATE_ID, SESSION_DESCRIPTION_ID, } from "../constants/websocket-constants.js";
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
    sendTunnelMessage(payload) {
        const message = new Uint8Array([TUNNEL_ID, ...payload]);
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
    handleNotification(payload) {
        if (payload === null) {
            return console.warn("Received empty notification");
        }
        const text = new TextDecoder("utf-8").decode(payload);
        dispatchEvent(new CustomEvent(SERVER_NOTIFICATION_EVENT, { detail: { text } }));
    }
    handleTunnelMessage(payload) {
        if (payload === null) {
            return console.warn("Received empty tunnel message");
        }
        else if (payload.length < 33) {
            return console.warn("Invalid tunnel message length", payload);
        }
        const originTokenBytes = payload.slice(0, 32);
        const webrtcType = payload[32];
        const webrtcDataBytes = payload.slice(33);
        const originToken = btoa(String.fromCharCode(...originTokenBytes));
        const webrtcData = JSON.parse(new TextDecoder("utf-8").decode(webrtcDataBytes));
        console.log("Tunnel message", originToken, webrtcType, webrtcData);
        this.handleWebRTCMessage(originToken, webrtcType, webrtcData);
    }
    handleWebRTCMessage(originToken, type, webrtcData) {
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
    handleSessionDescriptionMessage(originToken, rtcSessionDescription) {
        dispatchEvent(new CustomEvent(SERVER_SESSION_DESCRIPTION_EVENT, {
            detail: { originToken, rtcSessionDescription },
        }));
    }
    handleIceCandidateMessage(originToken, iceCandidate) {
        console.log("Received ICE candidate...", originToken, iceCandidate);
        dispatchEvent(new CustomEvent(SERVER_ICE_CANDIDATE_EVENT, {
            detail: { originToken, iceCandidate },
        }));
    }
}
