import { MATCH_ADVERTISED_EVENT, } from "../constants/events-constants.js";
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
            return this.advertiseMatch();
        }
        await this.joinMatches(matches);
        this.findMatchesTimerService = this.gameController.addTimer(10, () => {
            this.advertiseMatch();
        });
    }
    hasPeerConnected(peer) {
        if (this.gameController.getGameState().isHost()) {
            return console.log("Player joined", peer);
        }
        console.log("Joined to host", peer);
        this.findMatchesTimerService?.stop(false);
        this.sendPlayerData(peer);
    }
    sendPlayerData(peer) {
        const playerName = this.gameController
            .getGameState()
            .getGamePlayer()
            .getName();
        const playerNameBytes = new TextEncoder().encode(playerName);
        peer.sendReliableUnorderedMessage(playerNameBytes);
    }
    async findMatches() {
        console.log("Finding matches...");
        const body = {
            version: this.gameController.getGameState().getVersion(),
            total_slots: 1,
            attributes: {
                mode: "battle",
            },
        };
        return this.apiService.findMatches(body);
    }
    async advertiseMatch() {
        console.log("Advertising match...");
        const body = {
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
    async joinMatches(matches) {
        // Update game state to client
        this.gameController.getGameState().setHost(false);
        matches.forEach((match) => this.joinMatch(match));
    }
    async joinMatch(match) {
        const { token } = match;
        this.webrtcService.sendOffer(token);
    }
}
