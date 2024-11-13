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
  INITIAL_DATA_END_ID,
  PLAYER_CONNECTION_STATE_ID,
  INITIAL_DATA_ACK_ID,
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
    if (peer.hasJoined() === false) {
      return console.warn("Ignoring disconnecting from non-joined peer", peer);
    }

    const id = peer.getId();

    if (id === null) {
      return console.warn("Unknown peer disconnected", peer);
    }

    if (this.gameState.getGameMatch()?.isHost()) {
      this.handlePlayerDisconnected(peer, id);
    } else {
      this.handleHostDisconnected(peer);
    }
  }

  public handleJoinRequest(
    peer: WebRTCPeerService,
    payload: ArrayBuffer | null
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

    const playerId = new TextDecoder().decode(payload.slice(0, 36));
    const playerName = new TextDecoder().decode(payload.slice(36));

    console.log("Received join request from", playerName);

    // Add player to game match
    const gamePlayer = new GamePlayer(playerId, false, playerName);
    peer.setPlayer(gamePlayer);

    gameMatch?.addPlayer(gamePlayer);

    this.sendJoinResponse(peer, gameMatch);
  }

  public handleJoinResponse(
    peer: WebRTCPeerService,
    payload: ArrayBuffer | null
  ): void {
    if (payload === null) {
      return console.warn("Received empty join response");
    }

    if (this.gameState.getGameMatch() !== null) {
      this.handleAlreadyJoinedMatch(peer);
    }

    console.log("Received join response from", peer.getToken());

    // Data
    const dataView = new DataView(payload);
    const totalSlots = dataView.getUint8(0);

    // Create game match
    const gameMatch = new GameMatch(false, totalSlots, MATCH_ATTRIBUTES);
    this.gameState.setGameMatch(gameMatch);

    // Add local player
    const localGamePlayer = this.gameState.getGamePlayer();
    gameMatch.addPlayer(localGamePlayer);
  }

  public handlePlayerConnection(
    peer: WebRTCPeerService,
    payload: ArrayBuffer | null
  ): void {
    if (payload === null || payload.byteLength < 40) {
      return console.warn("Invalid player connection state payload", payload);
    }

    const dataView = new DataView(payload);

    const connected = dataView.getUint8(1);
    const id = new TextDecoder().decode(payload.slice(1, 37));
    const host = dataView.getUint8(37) === 1;
    const team = dataView.getUint8(38);
    const score = dataView.getUint8(39);
    const nameBytes = payload.slice(40);

    const name = new TextDecoder().decode(nameBytes);

    if (connected === 0) {
      // TODO
      return console.warn("Player disconnected", name);
    }

    const gamePlayer = new GamePlayer(id, host, name, team, score);
    this.gameState.getGameMatch()?.addPlayer(gamePlayer);

    if (host) {
      peer.setPlayer(gamePlayer);
    }
  }

  public handleInitialDataEnd(peer: WebRTCPeerService): void {
    const playerName = peer.getName();
    console.log("Received end of initial data from", playerName);

    peer.setJoined(true);

    dispatchEvent(
      new CustomEvent(PLAYER_CONNECTED_EVENT, {
        detail: { player: peer.getPlayer() },
      })
    );

    this.sendInitialDataAck(peer);
  }

  public handleInitialDataACK(peer: WebRTCPeerService): void {
    const playerName = peer.getName();
    console.log("Received initial data ACK from", playerName);

    peer.setJoined(true);

    dispatchEvent(
      new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { playerName } })
    );
  }

  private handleAlreadyJoinedMatch(peer: WebRTCPeerService): void {
    console.warn(
      "Already joined a match, disconnecting peer...",
      peer.getToken()
    );

    peer.disconnect();
  }

  private handlePlayerDisconnected(
    peer: WebRTCPeerService,
    peerId: string
  ): void {
    console.log(`Player ${peer.getName()} disconnected`);
    this.gameState.getGameMatch()?.removePlayer(peerId);

    dispatchEvent(
      new CustomEvent(PLAYER_DISCONNECTED_EVENT, {
        detail: { player: peer.getPlayer() },
      })
    );
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

    // Update local player
    const gamePlayer = this.gameState.getGamePlayer();
    gamePlayer.setHost(true);

    gameMatch.addPlayer(gamePlayer);

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
    const playerId = this.gameState.getGamePlayer().getId();
    const playerName = this.gameState.getGamePlayer().getName();

    const playerIdBytes = new TextEncoder().encode(playerId);
    const playerNameBytes = new TextEncoder().encode(playerName);

    const payload = new Uint8Array([
      JOIN_REQUEST_ID,
      ...playerIdBytes,
      ...playerNameBytes,
    ]);

    peer.sendReliableUnorderedMessage(payload);
  }

  private handleUnavailableSlots(peer: WebRTCPeerService): void {
    console.log("Match is full, disconnecting peer...", peer.getToken());
    peer.disconnect();
  }

  private sendJoinResponse(
    peer: WebRTCPeerService,
    gameMatch: GameMatch
  ): void {
    const totalSlots = gameMatch.getTotalSlots();
    const payload = new Uint8Array([JOIN_RESPONSE_ID, totalSlots]);

    console.log("Sending join response to", peer.getName());
    peer.sendReliableOrderedMessage(payload);

    this.sendPlayerList(peer);
    this.sendEndOfInitialData(peer);
  }

  private sendPlayerList(peer: WebRTCPeerService): void {
    const gameMatch = this.gameState.getGameMatch();

    if (gameMatch === null) {
      return console.warn("Game match is null");
    }

    console.log("Sending player list to", peer.getName());

    const players = gameMatch.getPlayers();

    players.forEach((player) => {
      this.sendPlayerConnectionState(peer, player);
    });
  }

  private sendPlayerConnectionState(
    peer: WebRTCPeerService,
    player: GamePlayer
  ): void {
    if (player.getId() === peer.getId()) {
      return;
    }

    const connected = 1;
    const id = player.getId();
    const host = player.isHost() ? 1 : 0;
    const team = player.getTeam();
    const score = player.getScore();
    const name = player.getName();

    const idBytes = new TextEncoder().encode(id);
    const nameBytes = new TextEncoder().encode(name);

    const payload = new Uint8Array([
      PLAYER_CONNECTION_STATE_ID,
      connected,
      ...idBytes,
      host,
      team,
      score,
      ...nameBytes,
    ]);

    peer.sendReliableOrderedMessage(payload);
  }

  private sendEndOfInitialData(peer: WebRTCPeerService): void {
    console.log("Sending end of initial data to", peer.getName());

    const payload = new Uint8Array([INITIAL_DATA_END_ID]);
    peer.sendReliableOrderedMessage(payload);
  }

  private sendInitialDataAck(peer: WebRTCPeerService): void {
    console.log("Sending initial data ACK to", peer.getName());
    const payload = new Uint8Array([INITIAL_DATA_ACK_ID]);
    peer.sendReliableOrderedMessage(payload);
  }
}
