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
        console.log("Added WebRTC peer, updated peers count", this.peers.size);
        return peer;
    }
    removePeer(token) {
        this.peers.delete(token);
        console.log("Removed WebRTC peer, updated peers count", this.peers.size);
    }
}
