import { WebRTCPeerService } from "./webrtc-peer-service.js";
export class WebRTCService {
    gameController;
    peers = new Map();
    constructor(gameController) {
        this.gameController = gameController;
    }
    getPeer(token) {
        return this.peers.get(token) ?? null;
    }
    addPeer(token) {
        const peer = new WebRTCPeerService(this.gameController, token);
        this.peers.set(token, peer);
        return peer;
    }
    removePeer(token) {
        this.peers.delete(token);
    }
}
