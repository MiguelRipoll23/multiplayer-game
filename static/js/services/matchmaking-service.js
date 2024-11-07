import { MATCH_ADVERTISED_EVENT, SERVER_TUNNEL_MESSAGE, } from "../constants/events-constants.js";
export class MatchmakingService {
    gameController;
    apiService;
    webrtcService;
    findMatchesTimerService;
    constructor(gameController) {
        this.gameController = gameController;
        this.apiService = gameController.getApiService();
        this.webrtcService = gameController.getWebRTCService();
        this.findMatchesTimerService = this.gameController.addTimer(10, false);
        this.addEventListeners();
    }
    handleTimers() {
        if (this.findMatchesTimerService.hasFinished()) {
            this.findMatchesTimerService.reset();
            this.advertiseMatch();
        }
    }
    addEventListeners() {
        window.addEventListener(SERVER_TUNNEL_MESSAGE, (event) => {
            this.handleServerTunnelMessage(event);
        });
    }
    async findOrAdvertiseMatch() {
        const matches = await this.findMatches();
        if (matches.length === 0) {
            console.log("No matches found");
            return this.advertiseMatch();
        }
        await this.joinMatches(matches);
        this.findMatchesTimerService.start();
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
        const offer = await this.webrtcService.createOffer();
        matches.forEach((match) => this.joinMatch(match, offer));
    }
    joinMatch(match, offer) {
        const { token } = match;
        console.log("Sending join request...", token, offer);
        const tokenBytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
        const offerBytes = new TextEncoder().encode(JSON.stringify(offer));
        const payload = new Uint8Array([...tokenBytes, ...offerBytes]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
    handleServerTunnelMessage(event) {
        const { originToken, webrtcDescription } = event.detail;
        if (this.gameController.getGameState().isHost()) {
            this.handleJoinRequest(originToken, webrtcDescription);
        }
        else {
            this.handleJoinResponse(originToken, webrtcDescription);
        }
    }
    async handleJoinRequest(originToken, rtcSessionDescription) {
        console.log("Join request", originToken, rtcSessionDescription);
        const answer = await this.webrtcService.createAnswer(rtcSessionDescription);
        const originTokenBytes = Uint8Array.from(atob(originToken), (c) => c.charCodeAt(0));
        const answerBytes = new TextEncoder().encode(JSON.stringify(answer));
        const payload = new Uint8Array([...originTokenBytes, ...answerBytes]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
    async handleJoinResponse(originToken, rtcSessionDescription) {
        console.log("Join response", originToken, rtcSessionDescription);
        this.findMatchesTimerService.stop();
        await this.webrtcService.connect(rtcSessionDescription);
    }
}
