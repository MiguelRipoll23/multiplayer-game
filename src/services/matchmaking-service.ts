import { HOST_DISCONNECTED_EVENT } from "../constants/events-constants.js";
import { GameController } from "../models/game-controller.js";
import { ApiService } from "./api-service.js";
import { AdvertiseMatchRequest } from "./interfaces/request/advertise-match-request.js";
import { FindMatchRequest as FindMatchesRequest } from "./interfaces/request/find-matches-request.js";
import { FindMatchesResponse } from "./interfaces/response/find-matches-response.js";
import { TimerService } from "./timer-service.js";
import { WebRTCService } from "./webrtc-service.js";
import {
  JOIN_REQUEST_ID,
  JOIN_RESPONSE_ID,
  SNAPSHOT_ID,
  PLAYER_ID,
  SNAPSHOT_ACK_ID,
} from "../constants/webrtc-constants.js";
import { GameMatch } from "../models/game-match.js";
import { MATCH_ATTRIBUTES } from "../constants/matchmaking-constants.js";
import { GamePlayer } from "../models/game-player.js";
import { GameState } from "../models/game-state.js";
import { ConnectionStateType } from "../types/connection-state-type.js";
import { WebRTCPeer } from "./interfaces/webrtc-peer.js";
import { SaveScoreRequest } from "../services/interfaces/request/save-score-request.js";
import { MatchStateType } from "../types/match-state-type.js";
import { EventType } from "../types/event-type.js";
import { LocalEvent } from "../models/local-event.js";
import { PlayerConnectedPayload } from "./interfaces/events/player-connected-payload.js";
import { PlayerDisconnectedPayload } from "./interfaces/events/player-disconnected-payload.js";

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

    this.findMatchesTimerService = this.gameController.addTimer(
      10,
      this.createAndAdvertiseMatch.bind(this)
    );
  }

  public hasPeerConnected(peer: WebRTCPeer): void {
    if (this.gameState.getGameMatch()?.isHost()) {
      return console.log("Peer connected", peer);
    }

    console.log("Connected to host", peer);

    this.sendJoinRequest(peer);
  }

  public hasPeerDisconnected(peer: WebRTCPeer): void {
    if (peer.hasJoined() === false) {
      return console.warn("Ignoring disconnecting from non-joined peer", peer);
    }

    const id = peer.getPlayer()?.getId() ?? null;

    if (id === null) {
      return console.warn("Unknown peer disconnected", peer);
    }

    if (this.gameState.getGameMatch()?.isHost()) {
      this.handlePlayerDisconnection(peer);
    } else {
      this.handleHostDisconnected(peer);
    }
  }

  public handleJoinRequest(
    peer: WebRTCPeer,
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
    peer: WebRTCPeer,
    payload: ArrayBuffer | null
  ): void {
    if (payload === null) {
      return console.warn("Received empty join response");
    }

    if (this.gameState.getGameMatch() !== null) {
      return this.handleAlreadyJoinedMatch(peer);
    }

    console.log("Received join response from", peer.getToken());

    // Data
    const dataView = new DataView(payload);
    const state = dataView.getUint8(0);
    const totalSlots = dataView.getUint8(1);

    // Create game match
    const gameMatch = new GameMatch(false, state, totalSlots, MATCH_ATTRIBUTES);
    this.gameState.setGameMatch(gameMatch);

    // Add local player
    const localGamePlayer = this.gameState.getGamePlayer();
    localGamePlayer.reset();

    gameMatch.addPlayer(localGamePlayer);
  }

  public handlePlayerConnection(
    peer: WebRTCPeer,
    payload: ArrayBuffer | null
  ): void {
    if (payload === null || payload.byteLength < 39) {
      return console.warn("Invalid player connection state payload", payload);
    }

    const dataView = new DataView(payload);

    const state = dataView.getUint8(0);
    const id = new TextDecoder().decode(payload.slice(1, 37));
    const host = dataView.getUint8(37) === 1;
    const score = dataView.getUint8(38);
    const nameBytes = payload.slice(39);

    const name = new TextDecoder().decode(nameBytes);

    if (state === ConnectionStateType.Disconnected) {
      return this.handlePlayerDisconnectedById(id);
    }

    const gamePlayer = new GamePlayer(id, host, name, score);
    this.gameState.getGameMatch()?.addPlayer(gamePlayer);

    if (host) {
      peer.setPlayer(gamePlayer);
    }
  }

  public handleSnapshot(peer: WebRTCPeer): void {
    console.log("Received snapshot from", peer.getName());

    this.findMatchesTimerService?.stop(false);
    peer.setJoined(true);

    const player = peer.getPlayer();

    if (player === null) {
      return console.warn("Player is null");
    }

    const localEvent = new LocalEvent<PlayerConnectedPayload>(
      EventType.PlayerConnected,
      { player, matchmaking: true }
    );

    this.gameController.getEventsProcessorService().addLocalEvent(localEvent);

    this.sentSnapshotACK(peer);
  }

  public handleSnapshotACK(peer: WebRTCPeer): void {
    console.log("Received snapshot ACK from", peer.getName());

    peer.setJoined(true);

    const player = peer.getPlayer();

    if (player === null) {
      return console.warn("Player is null");
    }

    this.webrtcService
      .getPeers()
      .filter((matchPeer) => matchPeer !== peer)
      .forEach((peer) => {
        console.log("Sending player connection to", peer.getName());
        this.sendPlayerConnection(
          peer,
          player,
          ConnectionStateType.Connected,
          false
        );
      });

    const localEvent = new LocalEvent<PlayerConnectedPayload>(
      EventType.PlayerConnected,
      { player, matchmaking: false }
    );

    this.gameController.getEventsProcessorService().addLocalEvent(localEvent);

    this.advertiseMatch();
  }

  public async savePlayerScore(): Promise<void> {
    const gamePlayer = this.gameState.getGamePlayer();
    const score = gamePlayer.getScore();
    const hash = crypto.randomUUID();

    const saveScoreRequest: SaveScoreRequest = { score, hash };
    await this.apiService.saveScore(saveScoreRequest);
  }

  public async handleGameOver(): Promise<void> {
    if (this.gameState.getGameMatch()?.isHost()) {
      this.webrtcService
        .getPeers()
        .forEach((peer) => peer.disconnectGracefully());

      await this.apiService.removeMatch();
    }

    this.gameController.getGameState().setGameMatch(null);
  }

  private handleAlreadyJoinedMatch(peer: WebRTCPeer): void {
    console.warn(
      "Already joined a match, disconnecting peer...",
      peer.getToken()
    );

    peer.disconnect();
  }

  private handlePlayerDisconnection(peer: WebRTCPeer): void {
    const player = peer.getPlayer();

    if (player === null) {
      return console.warn("Player is null");
    }

    console.log(`Player ${player.getName()} disconnected`);
    this.gameState.getGameMatch()?.removePlayer(player);

    this.webrtcService
      .getPeers()
      .filter((matchPeer) => matchPeer !== peer)
      .forEach((peer) => {
        this.sendPlayerConnection(
          peer,
          player,
          ConnectionStateType.Disconnected,
          false
        );
      });

    const playerDisconnectedEvent = new LocalEvent<PlayerDisconnectedPayload>(
      EventType.PlayerDisconnected,
      { player }
    );

    this.gameController
      .getEventsProcessorService()
      .addLocalEvent(playerDisconnectedEvent);

    this.advertiseMatch();
  }

  private handlePlayerDisconnectedById(playerId: string) {
    const gameMatch = this.gameState.getGameMatch();

    if (gameMatch === null) {
      return console.warn("Game match is null");
    }

    const player = gameMatch.getPlayer(playerId);

    if (player === null) {
      return console.warn("Player not found", playerId);
    }

    console.log(`Player ${player.getName()} disconnected`);
    gameMatch.removePlayer(player);

    const localEvent = new LocalEvent<PlayerDisconnectedPayload>(
      EventType.PlayerDisconnected,
      { player }
    );

    this.gameController.getEventsProcessorService().addLocalEvent(localEvent);
  }

  private handleHostDisconnected(peer: WebRTCPeer): void {
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
    // Create game match
    const gameMatch = new GameMatch(
      true,
      MatchStateType.WaitingPlayers,
      4,
      MATCH_ATTRIBUTES
    );

    this.gameState.setGameMatch(gameMatch);

    // Update local player
    const localGamePlayer = this.gameState.getGamePlayer();
    localGamePlayer.reset();
    localGamePlayer.setHost(true);

    gameMatch.addPlayer(localGamePlayer);

    // Advertise match
    await this.advertiseMatch();
  }

  private async advertiseMatch(): Promise<void> {
    const gameMatch = this.gameState.getGameMatch();

    if (gameMatch === null) {
      return console.warn("Game match is null");
    }

    const body: AdvertiseMatchRequest = {
      version: this.gameController.getVersion(),
      total_slots: gameMatch.getTotalSlots(),
      available_slots: gameMatch.getAvailableSlots(),
      attributes: gameMatch.getAttributes(),
    };

    console.log("Advertising match...");

    await this.apiService.advertiseMatch(body);

    const localEvent = new LocalEvent(EventType.MatchAdvertised, null);
    this.gameController.getEventsProcessorService().addLocalEvent(localEvent);
  }

  private async joinMatches(matches: FindMatchesResponse[]): Promise<void> {
    matches.forEach((match) => this.joinMatch(match));
  }

  private async joinMatch(match: FindMatchesResponse): Promise<void> {
    const { token } = match;
    this.webrtcService.sendOffer(token);
  }

  private sendJoinRequest(peer: WebRTCPeer): void {
    const playerId = this.gameState.getGamePlayer().getId();
    const playerName = this.gameState.getGamePlayer().getName();

    const playerIdBytes = new TextEncoder().encode(playerId);
    const playerNameBytes = new TextEncoder().encode(playerName);

    const payload = new Uint8Array([
      JOIN_REQUEST_ID,
      ...playerIdBytes,
      ...playerNameBytes,
    ]);

    peer.sendReliableOrderedMessage(payload, true);
  }

  private handleUnavailableSlots(peer: WebRTCPeer): void {
    console.log("Match is full, disconnecting peer...", peer.getToken());
    peer.disconnect();
  }

  private sendJoinResponse(peer: WebRTCPeer, gameMatch: GameMatch): void {
    const state = gameMatch.getState();
    const totalSlots = gameMatch.getTotalSlots();
    const payload = new Uint8Array([JOIN_RESPONSE_ID, state, totalSlots]);

    console.log("Sending join response to", peer.getName());
    peer.sendReliableOrderedMessage(payload, true);

    this.sendPlayerList(peer);
    this.sendSnapshot(peer);
  }

  private sendPlayerList(peer: WebRTCPeer): void {
    const gameMatch = this.gameState.getGameMatch();

    if (gameMatch === null) {
      return console.warn("Game match is null");
    }

    console.log("Sending player list to", peer.getName());

    const players = gameMatch.getPlayers();

    players
      .filter((matchPlayer) => matchPlayer !== peer.getPlayer())
      .forEach((player) => {
        this.sendPlayerConnection(
          peer,
          player,
          ConnectionStateType.Connected,
          true
        );
      });
  }

  private sendPlayerConnection(
    peer: WebRTCPeer,
    player: GamePlayer,
    connectionState: ConnectionStateType,
    skipQueue: boolean
  ): void {
    const id = player.getId();
    const host = player.isHost() ? 1 : 0;
    const score = player.getScore();
    const name = player.getName();

    const idBytes = new TextEncoder().encode(id);
    const nameBytes = new TextEncoder().encode(name);

    const payload = new Uint8Array([
      PLAYER_ID,
      connectionState,
      ...idBytes,
      host,
      score,
      ...nameBytes,
    ]);

    peer.sendReliableOrderedMessage(payload, skipQueue);
  }

  private sendSnapshot(peer: WebRTCPeer): void {
    console.log("Sending snapshot to", peer.getName());

    const payload = new Uint8Array([SNAPSHOT_ID]);
    peer.sendReliableOrderedMessage(payload, true);
  }

  private sentSnapshotACK(peer: WebRTCPeer): void {
    console.log("Sending snapshot ACK to", peer.getName());
    const payload = new Uint8Array([SNAPSHOT_ACK_ID]);
    peer.sendReliableOrderedMessage(payload, true);
  }
}
