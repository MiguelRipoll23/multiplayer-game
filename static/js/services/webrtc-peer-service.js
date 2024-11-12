import { INITIAL_DATA_ACK_ID, INITIAL_DATA_END_ID, JOIN_REQUEST_ID, JOIN_RESPONSE_ID, OBJECT_DATA_ID, PLAYER_CONNECTION_STATE_ID, } from "../constants/webrtc-constants.js";
import { LoggerUtils } from "../utils/logger-utils.js";
export class WebRTCPeerService {
    gameController;
    token;
    peerConnection;
    iceCandidateQueue = [];
    dataChannels = {};
    logger;
    matchmakingService;
    objectOrchestrator;
    host = false;
    player = null;
    joined = false;
    constructor(gameController, token) {
        this.gameController = gameController;
        this.token = token;
        this.logger = new LoggerUtils(`WebRTC(${this.token})`);
        this.logger.info("WebRTCPeer initialized");
        this.matchmakingService = this.gameController.getMatchmakingService();
        this.objectOrchestrator = this.gameController.getObjectOrchestrator();
        this.host =
            this.gameController.getGameState().getGameMatch()?.isHost() ?? false;
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        if (this.host === false) {
            this.initializeDataChannels();
        }
        this.addEventListeners();
    }
    getToken() {
        return this.token;
    }
    getPlayer() {
        return this.player;
    }
    setPlayer(player) {
        this.player = player;
    }
    getId() {
        return this.player?.getId() ?? null;
    }
    getName() {
        return this.player?.getName() ?? this.token;
    }
    hasJoined() {
        return this.joined;
    }
    setJoined(joined) {
        this.joined = joined;
    }
    getQueuedIceCandidates() {
        return this.iceCandidateQueue;
    }
    addRemoteIceCandidate(iceCandidate) {
        this.processIceCandidate(iceCandidate, false);
    }
    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }
    async createAnswer(offer) {
        await this.peerConnection.setRemoteDescription(offer);
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }
    async connect(answer) {
        this.logger.info("Connecting to peer...", answer);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        this.iceCandidateQueue.forEach((candidate) => this.processIceCandidate(candidate, true));
        this.iceCandidateQueue = [];
    }
    disconnect() {
        this.peerConnection.close();
    }
    sendReliableOrderedMessage(arrayBuffer) {
        this.sendMessage("reliable-ordered", arrayBuffer);
    }
    sendReliableUnorderedMessage(arrayBuffer) {
        this.sendMessage("reliable-unordered", arrayBuffer);
    }
    sendUnreliableOrderedMessage(arrayBuffer) {
        this.sendMessage("unreliable-ordered", arrayBuffer);
    }
    sendUnreliableUnorderedMessage(arrayBuffer) {
        this.sendMessage("unreliable-unordered", arrayBuffer);
    }
    initializeDataChannels() {
        this.dataChannels = {
            "reliable-ordered": this.peerConnection.createDataChannel("reliable-ordered", { ordered: true }),
            "reliable-unordered": this.peerConnection.createDataChannel("reliable-unordered", { ordered: false }),
            "unreliable-ordered": this.peerConnection.createDataChannel("unreliable-ordered", { ordered: true, maxRetransmits: 0 }),
            "unreliable-unordered": this.peerConnection.createDataChannel("unreliable-unordered", { ordered: false, maxRetransmits: 0 }),
        };
    }
    addEventListeners() {
        this.addConnectionListeners();
        this.addIceListeners();
        this.addDataChannelListeners();
    }
    addConnectionListeners() {
        this.peerConnection.onconnectionstatechange = () => this.handleConnectionStateChange();
    }
    handleConnectionStateChange() {
        this.logger.info("Peer connection state:", this.peerConnection.connectionState);
        switch (this.peerConnection.connectionState) {
            case "connected":
                this.handleConnection();
                break;
            case "disconnected":
            case "failed":
            case "closed":
                this.handleDisconnection();
                break;
        }
    }
    handleConnection() {
        this.logger.info("Peer connection established");
    }
    handleDisconnection() {
        this.logger.info("Peer connection closed");
        this.matchmakingService.hasPeerDisconnected(this);
        this.gameController.getWebRTCService().removePeer(this.token);
    }
    addIceListeners() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.queueOrProcessIceCandidate(event.candidate.toJSON());
            }
        };
        this.peerConnection.oniceconnectionstatechange = () => {
            this.logger.info("ICE connection state:", this.peerConnection.iceConnectionState);
        };
        this.peerConnection.onicegatheringstatechange = () => {
            this.logger.info("ICE gathering state:", this.peerConnection.iceGatheringState);
        };
        this.peerConnection.onicecandidateerror = (event) => {
            this.logger.error("ICE candidate error", event);
        };
    }
    addDataChannelListeners() {
        if (this.host) {
            // If the instance is not the host, listen for the data channels from the host
            this.peerConnection.ondatachannel = (event) => {
                const channel = event.channel;
                this.dataChannels[channel.label] = channel;
                this.setupDataChannelListeners(channel);
            };
        }
        else {
            // For the non-host, set up listeners for already created channels
            Object.values(this.dataChannels).forEach((channel) => {
                this.setupDataChannelListeners(channel);
            });
        }
    }
    setupDataChannelListeners(channel) {
        channel.binaryType = "arraybuffer";
        channel.onopen = () => this.handleDataChannelOpen(channel.label);
        channel.onerror = (error) => this.handleDataChannelError(channel.label, error);
        channel.onmessage = (event) => this.handleMessage(event.data);
    }
    handleDataChannelOpen(label) {
        this.logger.info(`Data channel ${label} opened`);
        if (this.host === false && this.areAllDataChannelsOpen()) {
            this.matchmakingService.hasPeerConnected(this);
        }
    }
    areAllDataChannelsOpen() {
        return Object.values(this.dataChannels).every((channel) => channel.readyState === "open");
    }
    handleDataChannelError(label, error) {
        this.logger.error(`Data channel ${label} error`, error);
    }
    queueOrProcessIceCandidate(iceCandidate) {
        if (this.peerConnection.remoteDescription) {
            this.processIceCandidate(iceCandidate, true);
        }
        else {
            this.iceCandidateQueue.push(iceCandidate);
            this.logger.info("Queued ICE candidate", iceCandidate);
        }
    }
    async processIceCandidate(iceCandidate, local) {
        const type = local ? "local" : "remote";
        try {
            await this.peerConnection.addIceCandidate(iceCandidate);
            this.logger.info(`Added ${type} ICE candidate`, iceCandidate);
        }
        catch (error) {
            this.logger.error(`Error adding ${type} ICE candidate`, error);
        }
    }
    sendMessage(channelKey, arrayBuffer) {
        const channel = this.dataChannels[channelKey];
        if (channel === undefined) {
            return this.logger.warn(`Data channel not found for key: ${channelKey}`);
        }
        channel.send(arrayBuffer);
        //this.logger.debug(`Sent ${channelKey} message`, arrayBuffer);
    }
    handleMessage(arrayBuffer) {
        //this.logger.info("Received message from peer", new Uint8Array(arrayBuffer));
        //this.logger.info(new TextDecoder().decode(arrayBuffer));
        const dataView = new DataView(arrayBuffer);
        const id = dataView.getUint8(0);
        const payload = dataView.buffer.byteLength > 1 ? arrayBuffer.slice(1) : null;
        if (this.isInvalidStateForId(id)) {
            return console.warn("Invalid player state for message", id);
        }
        switch (id) {
            case JOIN_REQUEST_ID:
                return this.matchmakingService.handleJoinRequest(this, payload);
            case JOIN_RESPONSE_ID:
                return this.matchmakingService.handleJoinResponse(this, payload);
            case PLAYER_CONNECTION_STATE_ID:
                return this.matchmakingService.handlePlayerConnection(this, payload);
            case INITIAL_DATA_END_ID:
                return this.matchmakingService.handleInitialDataEnd(this);
            case INITIAL_DATA_ACK_ID:
                return this.matchmakingService.handleInitialDataACK(this);
            case OBJECT_DATA_ID:
                return this.objectOrchestrator.handleRemoteData(this, payload);
            default: {
                this.logger.warn("Unknown message identifier", id);
            }
        }
    }
    isInvalidStateForId(id) {
        if (this.joined) {
            return false;
        }
        return id > INITIAL_DATA_ACK_ID;
    }
}
