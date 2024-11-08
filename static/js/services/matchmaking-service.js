import { HOST_DISCONNECTED_EVENT, MATCH_ADVERTISED_EVENT, PLAYER_CONNECTED_EVENT, PLAYER_DISCONNECTED_EVENT, } from "../constants/events-constants.js";
import { JOIN_REQUEST_ID, JOIN_RESPONSE_ID, } from "../constants/webrtc-constants.js";
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
        if (peer.getName() === null) {
            // Peer has not sent a join request
            return;
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
        const playerName = new TextDecoder().decode(payload);
        peer.setName(playerName);
        console.log("Received join request from", playerName);
        // Add player to game match
        const gamePlayer = new GamePlayer(playerName);
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
        const totalSlots = payload[0];
        const playerNameBytes = payload.slice(1);
        const playerName = new TextDecoder().decode(playerNameBytes);
        peer.setName(playerName);
        console.log("Received join response from", playerName);
        const gameMatch = new GameMatch(false, totalSlots, MATCH_ATTRIBUTES);
        const gamePlayer = new GamePlayer(playerName);
        gameMatch.addPlayer(gamePlayer);
        this.gameState.setGameMatch(gameMatch);
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { playerName } }));
    }
    handleAlreadyJoinedMatch(peer) {
        console.warn("Already joined a match, disconnecting peer...");
        peer.disconnect();
    }
    handlePlayerDisconnected(peer) {
        const playerName = peer.getName();
        if (playerName === null) {
            return console.warn("Player unknown disconnected");
        }
        console.log(`Player ${playerName} disconnected`);
        this.gameState.getGameMatch()?.removePlayer(playerName);
    }
    handleHostDisconnected(peer) {
        console.log(`Host ${peer.getName()} disconnected`);
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
        const playerName = this.gameState.getGamePlayer().getName();
        const playerNameBytes = new TextEncoder().encode(playerName);
        const payload = new Uint8Array([JOIN_REQUEST_ID, ...playerNameBytes]);
        peer.sendReliableUnorderedMessage(payload);
    }
    handleUnavailableSlots(peer) {
        console.log("Match is full, disconnecting peer...");
        peer.disconnect();
    }
    sendJoinResponse(peer, gameMatch) {
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
    sendPlayerList(peer) { }
}
