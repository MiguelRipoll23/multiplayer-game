import { MATCH_ADVERTISED_EVENT, SERVER_ICE_CANDIDATE_EVENT, SERVER_SESSION_DESCRIPTION_EVENT, } from "../constants/events-constants.js";
import { ICE_CANDIDATE_ID, SESSION_DESCRIPTION_ID, } from "../constants/webrtc-constants.js";
export class MatchmakingService {
    gameController;
    apiService;
    webrtcService;
    findMatchesTimerService = null;
    constructor(gameController) {
        this.gameController = gameController;
        this.apiService = gameController.getApiService();
        this.webrtcService = gameController.getWebRTCService();
        this.addEventListeners();
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
        const peer = this.webrtcService.getPeer(originToken);
        if (peer === null) {
            return console.warn("WebRTC peer with token not found", originToken);
        }
        peer.addRemoteIceCandidate(iceCandidate);
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
        const peer = this.webrtcService.addPeer(token);
        const offer = await peer.createOffer();
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
        const peer = this.webrtcService.addPeer(originToken);
        const answer = await peer.createAnswer(rtcSessionDescription);
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
        const peer = this.webrtcService.getPeer(originToken);
        if (peer === null) {
            return console.warn("WebRTC peer with token not found", originToken);
        }
        peer.getQueuedIceCandidates().forEach((iceCandidate) => {
            this.sendIceCandidate(originToken, iceCandidate);
        });
        await peer.connect(rtcSessionDescription);
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
