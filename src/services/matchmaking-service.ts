import {
  MATCH_ADVERTISED_EVENT,
  SERVER_ICE_CANDIDATE_EVENT,
  SERVER_SESSION_DESCRIPTION_EVENT,
} from "../constants/events-constants.js";
import {
  ICE_CANDIDATE_ID,
  SESSION_DESCRIPTION_ID,
} from "../constants/webrtc-constants.js";
import { GameController } from "../models/game-controller.js";
import { ApiService } from "./api-service.js";
import { AdvertiseMatchRequest } from "./interfaces/request/advertise-match-request.js";
import { FindMatchRequest as FindMatchesRequest } from "./interfaces/request/find-matches-request.js";
import { FindMatchesResponse } from "./interfaces/response/find-matches-response.js";
import { TimerService } from "./timer-service.js";
import { WebRTCService } from "./webrtc-service.js";
import { WebRTCPeerService } from "./webrtc-peer-service.js";

export class MatchmakingService {
  private apiService: ApiService;
  private webrtcService: WebRTCService;

  private findMatchesTimerService: TimerService | null = null;

  constructor(private gameController: GameController) {
    this.apiService = gameController.getApiService();
    this.webrtcService = gameController.getWebRTCService();
    this.addEventListeners();
  }

  public async findOrAdvertiseMatch(): Promise<void> {
    const matches = await this.findMatches();

    if (matches.length === 0) {
      console.log("No matches found");
      return this.advertiseMatch();
    }

    await this.joinMatches(matches);

    this.findMatchesTimerService = this.gameController.addTimer(10, () => {
      this.advertiseMatch();
    });
  }

  public hasPeerConnected(peer: WebRTCPeerService): void {
    if (this.gameController.getGameState().isHost()) {
      return console.log("Player joined", peer);
    }

    console.log("Joined to host", peer);

    this.findMatchesTimerService?.stop(false);
    this.sendPlayerData(peer);
  }

  private sendPlayerData(peer: WebRTCPeerService): void {
    const playerName = this.gameController
      .getGameState()
      .getGamePlayer()
      .getName();

    const playerNameBytes = new TextEncoder().encode(playerName);
    peer.sendReliableUnorderedMessage(playerNameBytes);
  }

  private addEventListeners(): void {
    window.addEventListener(SERVER_SESSION_DESCRIPTION_EVENT, (event) => {
      this.handleSessionDescriptionEvent(event as CustomEvent<any>);
    });

    window.addEventListener(SERVER_ICE_CANDIDATE_EVENT, (event) => {
      this.handleNewIceCandidate(event as CustomEvent<any>);
    });
  }

  private handleNewIceCandidate(event: CustomEvent<any>): void {
    const { originToken, iceCandidate } = event.detail;
    const peer = this.webrtcService.getPeer(originToken);

    if (peer === null) {
      return console.warn("WebRTC peer with token not found", originToken);
    }

    peer.addRemoteIceCandidate(iceCandidate);
  }

  private async findMatches(): Promise<FindMatchesResponse[]> {
    console.log("Finding matches...");

    const body: FindMatchesRequest = {
      version: this.gameController.getGameState().getVersion(),
      total_slots: 1,
      attributes: {
        mode: "battle",
      },
    };

    return this.apiService.findMatches(body);
  }

  private async advertiseMatch(): Promise<void> {
    console.log("Advertising match...");

    const body: AdvertiseMatchRequest = {
      version: this.gameController.getGameState().getVersion(),
      total_slots: 4,
      available_slots: 3,
      attributes: {
        mode: "battle",
      },
    };

    await this.apiService.advertiseMatch(body);

    // Update game state to host
    this.gameController.getGameState().setHost(true);

    dispatchEvent(new CustomEvent(MATCH_ADVERTISED_EVENT));
  }

  private async joinMatches(matches: FindMatchesResponse[]): Promise<void> {
    // Update game state to client
    this.gameController.getGameState().setHost(false);

    matches.forEach((match) => this.joinMatch(match));
  }

  private async joinMatch(match: FindMatchesResponse): Promise<void> {
    const { token } = match;

    const peer = this.webrtcService.addPeer(token);
    const offer = await peer.createOffer();

    console.log("Sending join request...", token, offer);

    const tokenBytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
    const offerBytes = new TextEncoder().encode(JSON.stringify(offer));

    const payload = new Uint8Array([
      ...tokenBytes,
      SESSION_DESCRIPTION_ID,
      ...offerBytes,
    ]);

    this.gameController.getWebSocketService().sendTunnelMessage(payload);
  }

  private handleSessionDescriptionEvent(event: CustomEvent<any>): void {
    const { originToken, rtcSessionDescription } = event.detail;

    if (this.gameController.getGameState().isHost()) {
      this.handleJoinRequest(originToken, rtcSessionDescription);
    } else {
      this.handleJoinResponse(originToken, rtcSessionDescription);
    }
  }

  private async handleJoinRequest(
    originToken: string,
    rtcSessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    console.log("Join request", originToken, rtcSessionDescription);

    const peer = this.webrtcService.addPeer(originToken);
    const answer = await peer.createAnswer(rtcSessionDescription);

    console.log("Sending join response...", originToken, answer);

    const originTokenBytes = Uint8Array.from(atob(originToken), (c) =>
      c.charCodeAt(0)
    );

    const answerBytes = new TextEncoder().encode(JSON.stringify(answer));

    const payload = new Uint8Array([
      ...originTokenBytes,
      SESSION_DESCRIPTION_ID,
      ...answerBytes,
    ]);

    this.gameController.getWebSocketService().sendTunnelMessage(payload);
  }

  private async handleJoinResponse(
    originToken: string,
    rtcSessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    console.log("Join response", originToken, rtcSessionDescription);

    const peer = this.webrtcService.getPeer(originToken);

    if (peer === null) {
      return console.warn("WebRTC peer with token not found", originToken);
    }

    peer.getQueuedIceCandidates().forEach((iceCandidate) => {
      this.sendIceCandidate(originToken, iceCandidate);
    });

    await peer.connect(rtcSessionDescription);
  }

  private sendIceCandidate(
    originToken: string,
    iceCandidate: RTCIceCandidateInit
  ): void {
    console.log("Sending ICE candidate...", originToken, iceCandidate);

    const candidateBytes = new TextEncoder().encode(
      JSON.stringify(iceCandidate)
    );

    const payload = new Uint8Array([
      ...Uint8Array.from(atob(originToken), (c) => c.charCodeAt(0)),
      ICE_CANDIDATE_ID,
      ...candidateBytes,
    ]);

    this.gameController.getWebSocketService().sendTunnelMessage(payload);
  }
}
