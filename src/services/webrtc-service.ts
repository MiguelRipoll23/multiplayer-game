import {
  SERVER_SESSION_DESCRIPTION_EVENT,
  SERVER_ICE_CANDIDATE_EVENT,
} from "../constants/events-constants.js";
import {
  ICE_CANDIDATE_ID,
  SESSION_DESCRIPTION_ID,
} from "../constants/webrtc-constants.js";
import { GameController } from "../models/game-controller.js";
import { WebRTCPeerService } from "./webrtc-peer-service.js";

export class WebRTCService {
  private peers: Map<string, WebRTCPeerService> = new Map();

  constructor(private gameController: GameController) {
    this.addEventListeners();
  }

  public async sendOffer(token: string): Promise<void> {
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

  public removePeer(token: string): void {
    this.peers.delete(token);

    console.log("Removed WebRTC peer, updated peers count", this.peers.size);
  }

  private addEventListeners(): void {
    window.addEventListener(SERVER_SESSION_DESCRIPTION_EVENT, (event) => {
      this.handleSessionDescriptionEvent(event as CustomEvent<any>);
    });

    window.addEventListener(SERVER_ICE_CANDIDATE_EVENT, (event) => {
      this.handleNewIceCandidate(event as CustomEvent<any>);
    });
  }

  private addPeer(token: string): WebRTCPeerService {
    const peer = new WebRTCPeerService(this.gameController, token);
    this.peers.set(token, peer);

    console.log("Added WebRTC peer, updated peers count", this.peers.size);

    return peer;
  }

  private async handlePeerOffer(
    token: string,
    offer: RTCSessionDescriptionInit
  ): Promise<void> {
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

  private async handlePeerAnswer(
    token: string,
    rtcSessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
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

  private getPeer(token: string): WebRTCPeerService | null {
    return this.peers.get(token) ?? null;
  }

  private handleSessionDescriptionEvent(event: CustomEvent<any>): void {
    const { originToken, rtcSessionDescription } = event.detail;

    if (this.gameController.getGameState().isHost()) {
      this.handlePeerOffer(originToken, rtcSessionDescription);
    } else {
      this.handlePeerAnswer(originToken, rtcSessionDescription);
    }
  }

  private handleNewIceCandidate(event: CustomEvent<any>): void {
    const { originToken, iceCandidate } = event.detail;
    const peer = this.getPeer(originToken);

    if (peer === null) {
      return console.warn("WebRTC peer with token not found", originToken);
    }

    peer.addRemoteIceCandidate(iceCandidate);
  }

  private sendIceCandidate(
    token: string,
    iceCandidate: RTCIceCandidateInit
  ): void {
    console.log("Sending ICE candidate...", token, iceCandidate);

    const candidateBytes = new TextEncoder().encode(
      JSON.stringify(iceCandidate)
    );

    const payload = new Uint8Array([
      ...Uint8Array.from(atob(token), (c) => c.charCodeAt(0)),
      ICE_CANDIDATE_ID,
      ...candidateBytes,
    ]);

    this.gameController.getWebSocketService().sendTunnelMessage(payload);
  }
}
