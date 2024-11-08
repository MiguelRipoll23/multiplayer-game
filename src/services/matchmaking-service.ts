import {
  HOST_DISCONNECTED_EVENT,
  MATCH_ADVERTISED_EVENT,
  PLAYER_CONNECTED_EVENT,
  PLAYER_DISCONNECTED_EVENT,
} from "../constants/events-constants.js";
import { GameController } from "../models/game-controller.js";
import { ApiService } from "./api-service.js";
import { AdvertiseMatchRequest } from "./interfaces/request/advertise-match-request.js";
import { FindMatchRequest as FindMatchesRequest } from "./interfaces/request/find-matches-request.js";
import { FindMatchesResponse } from "./interfaces/response/find-matches-response.js";
import { TimerService } from "./timer-service.js";
import { WebRTCService } from "./webrtc-service.js";
import { WebRTCPeerService } from "./webrtc-peer-service.js";
import {
  JOIN_REQUEST_ID,
  JOIN_RESPONSE_ID,
} from "../constants/webrtc-constants.js";
import { GameMatch } from "../models/game-match.js";
import {
  MATCH_ATTRIBUTES,
  TOTAL_SLOTS,
} from "../constants/matchmaking-constants.js";
import { GamePlayer } from "../models/game-player.js";
import { GameState } from "../models/game-state.js";

export class MatchmakingService {
  private apiService: ApiService;
  private webrtcService: WebRTCService;

  private gameState: GameState;

  private findMatchesTimerService: TimerService | null = null;

  constructor(private gameController: GameController) {
    this.apiService = gameController.getApiService();
    this.webrtcService = gameController.getWebRTCService();
    this.gameState = gameController.getGameState();
  }

  public async findOrAdvertiseMatch(): Promise<void> {
    const matches = await this.findMatches();

    if (matches.length === 0) {
      console.log("No matches found");
      return this.createAndAdvertiseMatch();
    }

    await this.joinMatches(matches);

    this.findMatchesTimerService = this.gameController.addTimer(10, () => {
      this.createAndAdvertiseMatch();
    });
  }

  public hasPeerConnected(peer: WebRTCPeerService): void {
    if (this.gameState.getGameMatch()?.isHost()) {
      return console.log("Peer connected", peer);
    }

    console.log("Connected to host", peer);

    this.findMatchesTimerService?.stop(false);
    this.sendJoinRequest(peer);
  }

  public hasPeerDisconnected(peer: WebRTCPeerService): void {
    if (peer.getName() === null) {
      // Peer has not sent a join request
      return;
    }

    if (this.gameState.getGameMatch()?.isHost()) {
      this.handlePlayerDisconnected(peer);
    } else {
      this.handleHostDisconnected(peer);
    }

    dispatchEvent(
      new CustomEvent(PLAYER_DISCONNECTED_EVENT, { detail: { peer } })
    );
  }

  public handleJoinRequest(
    peer: WebRTCPeerService,
    payload: Uint8Array | null
  ): void {
    if (payload === null) {
      return console.warn("Received empty join request");
    }

    const gameMatch = this.gameState.getGameMatch();

    if (gameMatch === null) {
      return console.warn("Game match is null");
    }

    if (gameMatch?.getAvailableSlots() === 0) {
      return this.handleUnavailableSlots(peer);
    }

    const playerName = new TextDecoder().decode(payload);
    peer.setName(playerName);

    console.log("Received join request from", playerName);

    // Add player to game match
    const gamePlayer = new GamePlayer(playerName);
    gameMatch?.addPlayer(gamePlayer);

    dispatchEvent(
      new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { playerName } })
    );

    this.sendJoinResponse(peer, gameMatch);
  }

  public handleJoinResponse(
    peer: WebRTCPeerService,
    payload: Uint8Array | null
  ): void {
    if (payload === null) {
      return console.warn("Received empty join response");
    }

    if (this.gameState.getGameMatch() !== null) {
      this.handleAlreadyJoinedMatch(peer);
    }

    const totalSlots = payload[0];

    const playerNameBytes = payload.slice(1);
    const playerName = new TextDecoder().decode(playerNameBytes);
    peer.setName(playerName);

    console.log("Received join response from", playerName);

    const gameMatch = new GameMatch(false, totalSlots, MATCH_ATTRIBUTES);
    const gamePlayer = new GamePlayer(playerName);
    gameMatch.addPlayer(gamePlayer);

    this.gameState.setGameMatch(gameMatch);

    dispatchEvent(
      new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { playerName } })
    );
  }

  private handleAlreadyJoinedMatch(peer: WebRTCPeerService): void {
    console.warn("Already joined a match, disconnecting peer...");
    peer.disconnect();
  }

  private handlePlayerDisconnected(peer: WebRTCPeerService): void {
    const playerName = peer.getName();

    if (playerName === null) {
      return console.warn("Player unknown disconnected");
    }

    console.log(`Player ${playerName} disconnected`);
    this.gameState.getGameMatch()?.removePlayer(playerName);
  }

  private handleHostDisconnected(peer: WebRTCPeerService): void {
    console.log(`Host ${peer.getName()} disconnected`);

    this.gameState.setGameMatch(null);
    dispatchEvent(new CustomEvent(HOST_DISCONNECTED_EVENT));
  }

  private async findMatches(): Promise<FindMatchesResponse[]> {
    console.log("Finding matches...");

    const body: FindMatchesRequest = {
      version: this.gameController.getVersion(),
      total_slots: 1,
      attributes: MATCH_ATTRIBUTES,
    };

    return this.apiService.findMatches(body);
  }

  private async createAndAdvertiseMatch(): Promise<void> {
    const body: AdvertiseMatchRequest = {
      version: this.gameController.getVersion(),
      total_slots: TOTAL_SLOTS,
      available_slots: TOTAL_SLOTS - 1,
      attributes: MATCH_ATTRIBUTES,
    };

    // Create game match
    const gameMatch = new GameMatch(true, 4, body.attributes);
    this.gameState.setGameMatch(gameMatch);

    console.log("Advertising match...");
    await this.apiService.advertiseMatch(body);

    dispatchEvent(new CustomEvent(MATCH_ADVERTISED_EVENT));
  }

  private async joinMatches(matches: FindMatchesResponse[]): Promise<void> {
    matches.forEach((match) => this.joinMatch(match));
  }

  private async joinMatch(match: FindMatchesResponse): Promise<void> {
    const { token } = match;
    this.webrtcService.sendOffer(token);
  }

  private sendJoinRequest(peer: WebRTCPeerService): void {
    const playerName = this.gameState.getGamePlayer().getName();
    const playerNameBytes = new TextEncoder().encode(playerName);
    const payload = new Uint8Array([JOIN_REQUEST_ID, ...playerNameBytes]);

    peer.sendReliableUnorderedMessage(payload);
  }

  private handleUnavailableSlots(peer: WebRTCPeerService): void {
    console.log("Match is full, disconnecting peer...");
    peer.disconnect();
  }

  private sendJoinResponse(
    peer: WebRTCPeerService,
    gameMatch: GameMatch
  ): void {
    const totalSlots = gameMatch.getTotalSlots();

    const playerName = this.gameState.getGamePlayer().getName();
    const playerNameBytes = new TextEncoder().encode(playerName);

    const payload = new Uint8Array([
      JOIN_RESPONSE_ID,
      totalSlots,
      ...playerNameBytes,
    ]);

    console.log("Sending join response to", peer.getName());
    peer.sendUnreliableOrderedMessage(payload);
  }

  private sendPlayerList(peer: WebRTCPeerService): void {}
}
