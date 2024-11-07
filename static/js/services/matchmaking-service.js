import { MATCH_ADVERTISED_EVENT, SERVER_ICE_CANDIDATE_EVENT, SERVER_SESSION_DESCRIPTION_EVENT, } from "../constants/events-constants.js";
import { ICE_CANDIDATE_ID, SESSION_DESCRIPTION_ID, } from "../constants/webrtc-constants.js";
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
        window.addEventListener(SERVER_SESSION_DESCRIPTION_EVENT, (event) => {
            this.handleSessionDescriptionEvent(event);
        });
        window.addEventListener(SERVER_ICE_CANDIDATE_EVENT, (event) => {
            this.handleNewIceCandidate(event);
        });
    }
    handleNewIceCandidate(event) {
        const { originToken, iceCandidate } = event.detail;
        const user = this.webrtcService.getUser(originToken);
        if (user === null) {
            return console.warn("WebRTC user with token not found", originToken);
        }
        user.addRemoteIceCandidate(iceCandidate);
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
        matches.forEach((match) => this.joinMatch(match));
    }
    async joinMatch(match) {
        const { token } = match;
        const user = this.webrtcService.createUser(token);
        const offer = await user.createOffer();
        console.log("Sending join request...", token, offer);
        const tokenBytes = Uint8Array.from(atob(token), (c) => c.charCodeAt(0));
        const offerBytes = new TextEncoder().encode(JSON.stringify(offer));
        const payload = new Uint8Array([
            ...tokenBytes,
            SESSION_DESCRIPTION_ID,
            ...offerBytes,
        ]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
    handleSessionDescriptionEvent(event) {
        const { originToken, rtcSessionDescription } = event.detail;
        if (this.gameController.getGameState().isHost()) {
            this.handleJoinRequest(originToken, rtcSessionDescription);
        }
        else {
            this.handleJoinResponse(originToken, rtcSessionDescription);
        }
    }
    async handleJoinRequest(originToken, rtcSessionDescription) {
        console.log("Join request", originToken, rtcSessionDescription);
        const user = this.webrtcService.createUser(originToken);
        const answer = await user.createAnswer(rtcSessionDescription);
        console.log("Sending join response...", originToken, answer);
        const originTokenBytes = Uint8Array.from(atob(originToken), (c) => c.charCodeAt(0));
        const answerBytes = new TextEncoder().encode(JSON.stringify(answer));
        const payload = new Uint8Array([
            ...originTokenBytes,
            SESSION_DESCRIPTION_ID,
            ...answerBytes,
        ]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
    async handleJoinResponse(originToken, rtcSessionDescription) {
        console.log("Join response", originToken, rtcSessionDescription);
        if (this.findMatchesTimerService.hasFinished()) {
            return console.warn("Ignoring join response, timed out");
        }
        this.findMatchesTimerService.stop();
        const user = this.webrtcService.getUser(originToken);
        if (user === null) {
            return console.warn("WebRTC user with token not found", originToken);
        }
        user.getQueuedIceCandidates().forEach((iceCandidate) => {
            this.sendIceCandidate(originToken, iceCandidate);
        });
        await user.connect(rtcSessionDescription);
    }
    sendIceCandidate(originToken, iceCandidate) {
        console.log("Sending ICE candidate...", originToken, iceCandidate);
        const candidateBytes = new TextEncoder().encode(JSON.stringify(iceCandidate));
        const payload = new Uint8Array([
            ...Uint8Array.from(atob(originToken), (c) => c.charCodeAt(0)),
            ICE_CANDIDATE_ID,
            ...candidateBytes,
        ]);
        this.gameController.getWebSocketService().sendTunnelMessage(payload);
    }
}
