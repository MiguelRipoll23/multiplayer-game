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
    this.webrtcService.sendOffer(token);
  }
}
