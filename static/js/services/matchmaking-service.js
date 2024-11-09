import { HOST_DISCONNECTED_EVENT, MATCH_ADVERTISED_EVENT, PLAYER_CONNECTED_EVENT, PLAYER_DISCONNECTED_EVENT, } from "../constants/events-constants.js";
import { JOIN_REQUEST_ID, JOIN_RESPONSE_ID, PLAYER_LIST_ID, } from "../constants/webrtc-constants.js";
import { GameMatch } from "../models/game-match.js";
import { MATCH_ATTRIBUTES, TOTAL_SLOTS, } from "../constants/matchmaking-constants.js";
import { GamePlayer } from "../models/game-player.js";
export class MatchmakingService {
    gameController;
    apiService;
    webrtcService;
    gameState;
    findMatchesTimerService = null;
    constructor(gameController) {
        this.gameController = gameController;
        this.apiService = gameController.getApiService();
        this.webrtcService = gameController.getWebRTCService();
        this.gameState = gameController.getGameState();
    }
    async findOrAdvertiseMatch() {
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
    hasPeerConnected(peer) {
        if (this.gameState.getGameMatch()?.isHost()) {
            return console.log("Peer connected", peer);
        }
        console.log("Connected to host", peer);
        this.findMatchesTimerService?.stop(false);
        this.sendJoinRequest(peer);
    }
    hasPeerDisconnected(peer) {
        if (peer.hasJoined() === false) {
            return console.warn("Non-joined peer disconnected", peer);
        }
        if (this.gameState.getGameMatch()?.isHost()) {
            this.handlePlayerDisconnected(peer);
        }
        else {
            this.handleHostDisconnected(peer);
        }
        dispatchEvent(new CustomEvent(PLAYER_DISCONNECTED_EVENT, { detail: { peer } }));
    }
    handleJoinRequest(peer, payload) {
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
        // Add peer identifier
        peer.setId(playerId);
        // Add player to game match
        const gamePlayer = new GamePlayer(playerId, false, playerName);
        gameMatch?.addPlayer(gamePlayer);
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { playerName } }));
        this.sendJoinResponse(peer, gameMatch);
    }
    handleJoinResponse(peer, payload) {
        if (payload === null) {
            return console.warn("Received empty join response");
        }
        if (this.gameState.getGameMatch() !== null) {
            this.handleAlreadyJoinedMatch(peer);
        }
        console.log("Received join response from", peer.getToken());
        // Data
        const totalSlots = payload[0];
        // Create game match
        const gameMatch = new GameMatch(false, totalSlots, MATCH_ATTRIBUTES);
        this.gameState.setGameMatch(gameMatch);
        // Add local player
        const localGamePlayer = this.gameState.getGamePlayer();
        gameMatch.addPlayer(localGamePlayer);
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT));
    }
    handlePlayerList(payload) {
        if (payload === null) {
            return console.warn("Received empty player list");
        }
        const id = new TextDecoder().decode(payload.slice(0, 36));
        const host = payload[36] === 1;
        const team = payload[37];
        const score = payload[38];
        const nameBytes = payload.slice(39);
        const name = new TextDecoder().decode(nameBytes);
        const gamePlayer = new GamePlayer(id, host, name, team, score);
        this.gameState.getGameMatch()?.addPlayer(gamePlayer);
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { name } }));
    }
    handleAlreadyJoinedMatch(peer) {
        console.warn("Already joined a match, disconnecting peer...", peer.getToken());
        peer.disconnect();
    }
    handlePlayerDisconnected(peer) {
        const id = peer.getId();
        if (id === null) {
            return console.warn("Player unknown disconnected");
        }
        this.gameState.getGameMatch()?.removePlayer(id);
        const playerName = this.gameState.getGameMatch()?.getPlayer(id)?.getName();
        console.log(`Player ${playerName} disconnected`);
    }
    handleHostDisconnected(peer) {
        const id = peer.getId();
        if (id === null) {
            return console.warn("Player unknown disconnected");
        }
        const playerName = this.gameState.getGameMatch()?.getPlayer(id)?.getName();
        console.log(`Host ${playerName} disconnected`);
        this.gameState.setGameMatch(null);
        dispatchEvent(new CustomEvent(HOST_DISCONNECTED_EVENT));
    }
    async findMatches() {
        console.log("Finding matches...");
        const body = {
            version: this.gameController.getVersion(),
            total_slots: 1,
            attributes: MATCH_ATTRIBUTES,
        };
        return this.apiService.findMatches(body);
    }
    async createAndAdvertiseMatch() {
        const body = {
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
    async joinMatches(matches) {
        matches.forEach((match) => this.joinMatch(match));
    }
    async joinMatch(match) {
        const { token } = match;
        this.webrtcService.sendOffer(token);
    }
    sendJoinRequest(peer) {
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
    handleUnavailableSlots(peer) {
        console.log("Match is full, disconnecting peer...");
        peer.disconnect();
    }
    sendJoinResponse(peer, gameMatch) {
        const totalSlots = gameMatch.getTotalSlots();
        const payload = new Uint8Array([JOIN_RESPONSE_ID, totalSlots]);
        const playerId = peer.getId();
        const playerName = gameMatch.getPlayerName(playerId);
        console.log("Sending join response to", playerName);
        peer.sendReliableOrderedMessage(payload);
        this.sendPlayerList(peer);
    }
    sendPlayerList(peer) {
        const gameMatch = this.gameState.getGameMatch();
        if (gameMatch === null) {
            return console.warn("Game match is null");
        }
        const playerId = peer.getId();
        const playerName = gameMatch.getPlayerName(playerId);
        console.log("Sending player list to", playerName);
        const players = gameMatch.getPlayers();
        players.forEach((player) => {
            this.sendPlayer(peer, player);
        });
    }
    sendPlayer(peer, player) {
        if (player.getId() === peer.getId()) {
            return;
        }
        const id = player.getId();
        const host = player.isHost() ? 1 : 0;
        const team = player.getTeam();
        const score = player.getScore();
        const name = player.getName();
        const idBytes = new TextEncoder().encode(id);
        const nameBytes = new TextEncoder().encode(name);
        const payload = new Uint8Array([
            PLAYER_LIST_ID,
            ...idBytes,
            host,
            team,
            score,
            ...nameBytes,
        ]);
        peer.sendReliableOrderedMessage(payload);
    }
}
