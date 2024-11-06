import { MATCH_ADVERTISED_EVENT } from "../constants/events-constants.js";
export class MatchmakingService {
    gameController;
    apiService;
    constructor(gameController) {
        this.gameController = gameController;
        this.apiService = gameController.getApiService();
    }
    async findOrAdvertiseMatch() {
        const matches = await this.findMatches();
        if (matches.length === 0) {
            console.log("No matches found");
            return this.advertiseMatch();
        }
        matches.forEach((match) => this.joinMatch(match));
        setTimeout(() => this.advertiseMatch(), 10_000);
    }
    async findMatches() {
        console.log("Finding matches...");
        const body = {
            version: "1.0.0",
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
            version: "1.0.0",
            total_slots: 4,
            available_slots: 3,
            attributes: {
                mode: "battle",
            },
        };
        await this.apiService.advertiseMatch(body);
        dispatchEvent(new CustomEvent(MATCH_ADVERTISED_EVENT));
    }
    joinMatch(match) {
        const { token } = match;
        // Decode the base64 token to a byte array
        const decodedToken = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
        // Send the decoded token as the payload
        this.gameController.getWebSocketService().sendTunnelMessage(decodedToken);
    }
}
