import { GameController } from "../models/game-controller.js";
import { WebRTCPeerService } from "./webrtc-peer-service.js";

export class WebRTCService {
  private peers: Map<string, WebRTCPeerService> = new Map();

  constructor(private gameController: GameController) {}

  public getPeer(token: string): WebRTCPeerService | null {
    return this.peers.get(token) ?? null;
  }

  public addPeer(token: string): WebRTCPeerService {
    const peer = new WebRTCPeerService(this.gameController, token);
    this.peers.set(token, peer);

    return peer;
  }

  public removePeer(token: string): void {
    this.peers.delete(token);
  }
}
