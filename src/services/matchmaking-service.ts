import {
  MATCH_ADVERTISED_EVENT,
  SERVER_ICE_CANDIDATE_MESSAGE,
  SERVER_SESSION_DESCRIPTION_MESSAGE,
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

export class MatchmakingService {
  private apiService: ApiService;
  private webrtcService: WebRTCService;

  private findMatchesTimerService: TimerService;

  constructor(private readonly gameController: GameController) {
    this.apiService = gameController.getApiService();
    this.webrtcService = gameController.getWebRTCService();
    this.findMatchesTimerService = this.gameController.addTimer(10, false);
    this.addEventListeners();
  }

  public handleTimers(): void {
    if (this.findMatchesTimerService.hasFinished()) {
      this.findMatchesTimerService.reset();
      this.advertiseMatch();
    }
  }

  private addEventListeners(): void {
    window.addEventListener(SERVER_SESSION_DESCRIPTION_MESSAGE, (event) => {
      this.handleSessionDescriptionEvent(event as CustomEvent<any>);
    });

    window.addEventListener(SERVER_ICE_CANDIDATE_MESSAGE, (event) => {
      this.handleNewIceCandidate(event as CustomEvent<any>);
    });
  }

  private handleNewIceCandidate(event: CustomEvent<any>): void {
    const { iceCandidate } = event.detail;

    this.webrtcService.addOrQueueIceCandidate(iceCandidate);
  }

  public async findOrAdvertiseMatch(): Promise<void> {
    const matches = await this.findMatches();

    if (matches.length === 0) {
      console.log("No matches found");
      return this.advertiseMatch();
    }

    await this.joinMatches(matches);

    this.findMatchesTimerService.start();
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

    const offer = await this.webrtcService.createOffer();

    matches.forEach((match) => this.joinMatch(match, offer));
  }

  private joinMatch(
    match: FindMatchesResponse,
    offer: RTCSessionDescriptionInit
  ): void {
    const { token } = match;

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

    const answer = await this.webrtcService.createAnswer(rtcSessionDescription);
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

    this.findMatchesTimerService.stop();

    this.webrtcService.getQueuedIceCandidates().forEach((iceCandidate) => {
      this.sendIceCandidate(originToken, iceCandidate);
    });

    await this.webrtcService.connect(rtcSessionDescription);
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
