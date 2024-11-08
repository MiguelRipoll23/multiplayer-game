import { HOST_DISCONNECTED_EVENT, MATCH_ADVERTISED_EVENT, PLAYER_CONNECTED_EVENT, PLAYER_DISCONNECTED_EVENT, } from "../constants/events-constants.js";
import { JOIN_REQUEST_ID, JOIN_RESPONSE_ID, } from "../constants/webrtc-constants.js";
import { GameMatch } from "../models/game-match.js";
import { ATTRIBUTE_MODE, TOTAL_SLOTS, } from "../constants/matchmaking-constants.js";
export class MatchmakingService {
    gameController;
    apiService;
    webrtcService;
    findMatchesTimerService = null;
    constructor(gameController) {
        this.gameController = gameController;
        this.apiService = gameController.getApiService();
        this.webrtcService = gameController.getWebRTCService();
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
        if (this.gameController.getGameMatch()?.isHost()) {
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
        if (this.gameController.getGameMatch()?.isHost()) {
            console.log(`Player ${peer.getName()} disconnected`);
            this.gameController.getGameMatch()?.incrementAvailableSlots();
        }
        else {
            console.log(`Host ${peer.getName()} disconnected`);
            this.gameController.setGameMatch(null);
            dispatchEvent(new CustomEvent(HOST_DISCONNECTED_EVENT));
        }
        dispatchEvent(new CustomEvent(PLAYER_DISCONNECTED_EVENT, { detail: { peer } }));
    }
    handleJoinRequest(peer, payload) {
        if (payload === null) {
            return console.warn("Received empty join request");
        }
        const gameMatch = this.gameController.getGameMatch();
        if (gameMatch === null) {
            return console.warn("Game match is null");
        }
        if (gameMatch?.getAvailableSlots() === 0) {
            return this.handleUnavailableSlots(peer);
        }
        const playerName = new TextDecoder().decode(payload);
        peer.setName(playerName);
        console.log("Received join request from", playerName);
        // Update available slots
        gameMatch?.decrementAvailableSlots();
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { playerName } }));
        this.sendJoinResponse(peer, gameMatch);
    }
    handleJoinResponse(peer, payload) {
        if (payload === null) {
            return console.warn("Received empty join response");
        }
        const totalSlots = payload[0];
        const playerNameBytes = payload.slice(1);
        const playerName = new TextDecoder().decode(playerNameBytes);
        peer.setName(playerName);
        console.log("Received join response from", playerName);
        const gameMatch = new GameMatch(false, totalSlots, {});
        this.gameController.setGameMatch(gameMatch);
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT, { detail: { playerName } }));
    }
    async findMatches() {
        console.log("Finding matches...");
        const body = {
            version: this.gameController.getGameState().getVersion(),
            total_slots: 1,
            attributes: {
                mode: ATTRIBUTE_MODE,
            },
        };
        return this.apiService.findMatches(body);
    }
    async createAndAdvertiseMatch() {
        const body = {
            version: this.gameController.getGameState().getVersion(),
            total_slots: TOTAL_SLOTS,
            available_slots: TOTAL_SLOTS - 1,
            attributes: {
                mode: ATTRIBUTE_MODE,
            },
        };
        // Create game match
        const gameMatch = new GameMatch(true, 4, body.attributes);
        this.gameController.setGameMatch(gameMatch);
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
        const playerName = this.gameController
            .getGameState()
            .getGamePlayer()
            .getName();
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
        const playerName = this.gameController
            .getGameState()
            .getGamePlayer()
            .getName();
        const playerNameBytes = new TextEncoder().encode(playerName);
        const payload = new Uint8Array([
            JOIN_RESPONSE_ID,
            totalSlots,
            ...playerNameBytes,
        ]);
        console.log("Sending join response to", peer.getName());
        peer.sendReliableUnorderedMessage(payload);
    }
}
