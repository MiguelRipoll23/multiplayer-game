import {
  MATCH_ADVERTISED_EVENT,
  SERVER_TUNNEL_MESSAGE,
} from "../constants/events-constants.js";
import { GameController } from "../models/game-controller.js";
import { ApiService } from "./api-service.js";
import { AdvertiseMatchRequest } from "./interfaces/request/advertise-match-request.js";
import { FindMatchRequest as FindMatchesRequest } from "./interfaces/request/find-matches-request.js";
import { FindMatchesResponse } from "./interfaces/response/find-matches-response.js";
import { WebRTCService } from "./webrtc-service.js";

export class MatchmakingService {
  private apiService: ApiService;
  private webrtcService: WebRTCService;

  constructor(private readonly gameController: GameController) {
    this.apiService = gameController.getApiService();
    this.webrtcService = gameController.getWebRTCService();
    this.addEventListeners();
  }

  private addEventListeners(): void {
    window.addEventListener(SERVER_TUNNEL_MESSAGE, (event) => {
      this.handleServerTunnelMessage(event as CustomEvent<any>);
    });
  }

  public async findOrAdvertiseMatch(): Promise<void> {
    const matches = await this.findMatches();

    if (matches.length === 0) {
      console.log("No matches found");
      return this.advertiseMatch();
    }

    await this.joinMatches(matches);

    setTimeout(() => this.advertiseMatch(), 10_000);
  }

  private async findMatches(): Promise<FindMatchesResponse[]> {
    console.log("Finding matches...");

    const body: FindMatchesRequest = {
      version: "1.0.0",
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
      version: "1.0.0",
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

    const tokenBytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
    const offerBytes = new TextEncoder().encode(JSON.stringify(offer));
    const payload = new Uint8Array([...tokenBytes, ...offerBytes]);

    this.gameController.getWebSocketService().sendTunnelMessage(payload);
  }

  private handleServerTunnelMessage(event: CustomEvent<any>): void {
    const { originToken, webrtcDescription } = event.detail;

    if (this.gameController.getGameState().isHost()) {
      this.handleJoinRequest(originToken, webrtcDescription);
    } else {
      this.handleJoinResponse(originToken, webrtcDescription);
    }
  }

  private async handleJoinRequest(
    originToken: Uint8Array,
    rtcSessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    console.log("Join request", originToken, rtcSessionDescription);

    const answer = await this.webrtcService.createAnswer(rtcSessionDescription);
    const answerBytes = new TextEncoder().encode(JSON.stringify(answer));

    const payload = new Uint8Array([...originToken, ...answerBytes]);

    this.gameController.getWebSocketService().sendTunnelMessage(payload);
  }

  private async handleJoinResponse(
    originToken: Uint8Array,
    rtcSessionDescription: RTCSessionDescriptionInit
  ): Promise<void> {
    console.log("Join response", originToken, rtcSessionDescription);

    await this.webrtcService.connect(rtcSessionDescription);
  }
}
