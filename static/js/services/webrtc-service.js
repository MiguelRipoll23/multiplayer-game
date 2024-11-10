import { SERVER_SESSION_DESCRIPTION_EVENT, SERVER_ICE_CANDIDATE_EVENT, } from "../constants/events-constants.js";
import { ICE_CANDIDATE_ID, SESSION_DESCRIPTION_ID, } from "../constants/websocket-constants.js";
import { WebRTCPeerService } from "./webrtc-peer-service.js";
export class WebRTCService {
    gameController;
    peers = new Map();
    constructor(gameController) {
        this.gameController = gameController;
        this.addEventListeners();
    }
    async sendOffer(token) {
        const peer = this.addPeer(token);
        const offer = await peer.createOffer();
        console.log("Sending WebRTC offer...", token, offer);
        const tokenBytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
        const offerBytes = new TextEncoder().encode(JSON.stringify(offer));
        const payload = new Uint8Array([
            ...tokenBytes,
            SESSION_DESCRIPTION_ID,
            ...offerBytes,
        ]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
    getPeers() {
        return Array.from(this.peers.values());
    }
    removePeer(token) {
        this.peers.delete(token);
        console.log("Removed WebRTC peer, updated peers count", this.peers.size);
    }
    addEventListeners() {
        window.addEventListener(SERVER_SESSION_DESCRIPTION_EVENT, (event) => {
            this.handleSessionDescriptionEvent(event);
        });
        window.addEventListener(SERVER_ICE_CANDIDATE_EVENT, (event) => {
            this.handleNewIceCandidate(event);
        });
    }
    addPeer(token) {
        const peer = new WebRTCPeerService(this.gameController, token);
        this.peers.set(token, peer);
        console.log("Added WebRTC peer, updated peers count", this.peers.size);
        return peer;
    }
    async handlePeerOffer(token, offer) {
        console.log("Received WebRTC offer", token, offer);
        const peer = this.addPeer(token);
        const answer = await peer.createAnswer(offer);
        console.log("Sending WebRTC answer...", token, answer);
        const tokenBytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
        const answerBytes = new TextEncoder().encode(JSON.stringify(answer));
        const payload = new Uint8Array([
            ...tokenBytes,
            SESSION_DESCRIPTION_ID,
            ...answerBytes,
        ]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
    async handlePeerAnswer(token, rtcSessionDescription) {
        console.log("Received WebRTC answer", token, rtcSessionDescription);
        const peer = this.getPeer(token);
        if (peer === null) {
            return console.warn("WebRTC peer with token not found", token);
        }
        peer.getQueuedIceCandidates().forEach((iceCandidate) => {
            this.sendIceCandidate(token, iceCandidate);
        });
        await peer.connect(rtcSessionDescription);
    }
    getPeer(token) {
        return this.peers.get(token) ?? null;
    }
    handleSessionDescriptionEvent(event) {
        const { originToken, rtcSessionDescription } = event.detail;
        if (this.gameController.getGameState().getGameMatch()?.isHost()) {
            this.handlePeerOffer(originToken, rtcSessionDescription);
        }
        else {
            this.handlePeerAnswer(originToken, rtcSessionDescription);
        }
    }
    handleNewIceCandidate(event) {
        const { originToken, iceCandidate } = event.detail;
        const peer = this.getPeer(originToken);
        if (peer === null) {
            return console.warn("WebRTC peer with token not found", originToken);
        }
        peer.addRemoteIceCandidate(iceCandidate);
    }
    sendIceCandidate(token, iceCandidate) {
        console.log("Sending ICE candidate...", token, iceCandidate);
        const candidateBytes = new TextEncoder().encode(JSON.stringify(iceCandidate));
        const payload = new Uint8Array([
            ...Uint8Array.from(atob(token), (c) => c.charCodeAt(0)),
            ICE_CANDIDATE_ID,
            ...candidateBytes,
        ]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
}
