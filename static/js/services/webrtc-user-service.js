import { PLAYER_CONNECTED_EVENT } from "../constants/events-constants.js";
export class WebRTCPeerService {
    gameController;
    token;
    peerConnection;
    iceCandidateQueue = [];
    dataChannels = {};
    constructor(gameController, token) {
        this.gameController = gameController;
        this.token = token;
        console.log(`WebRTCPeer(token=${token})`);
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        this.initializeDataChannels();
        this.addEventListeners();
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
        console.log("Connecting to peer...", answer);
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        this.iceCandidateQueue.forEach((candidate) => this.processIceCandidate(candidate, true));
        this.iceCandidateQueue = [];
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
        this.peerConnection.onconnectionstatechange = () => this.handleConnectionStateChange();
        this.addIceListeners();
        this.addDataChannelListeners();
    }
    handleConnectionStateChange() {
        console.log("Peer connection state:", this.peerConnection.connectionState);
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
        console.log("Peer connection established", this.token);
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT));
    }
    handleDisconnection() {
        console.log("Peer connection closed", this.token);
        this.gameController.getWebRTCService().removePeer(this.token);
    }
    addIceListeners() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.queueOrProcessIceCandidate(event.candidate.toJSON());
            }
        };
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", this.peerConnection.iceConnectionState);
        };
        this.peerConnection.onicegatheringstatechange = () => {
            console.log("ICE gathering state:", this.peerConnection.iceGatheringState);
        };
    }
    addDataChannelListeners() {
        Object.values(this.dataChannels).forEach((channel) => {
            channel.onopen = () => this.handleDataChannelOpen();
            channel.onmessage = (event) => this.handleMessage(event.data);
        });
    }
    handleDataChannelOpen() {
        console.log("Data channel opened", this.token);
        if (this.areAllDataChannelsOpen()) {
            this.gameController.getMatchmakingService().hasConnected(this);
        }
    }
    areAllDataChannelsOpen() {
        return Object.values(this.dataChannels).every((channel) => channel.readyState === "open");
    }
    queueOrProcessIceCandidate(iceCandidate) {
        if (this.peerConnection.remoteDescription) {
            this.processIceCandidate(iceCandidate, true);
        }
        else {
            this.iceCandidateQueue.push(iceCandidate);
            console.log("Queued ICE candidate", iceCandidate);
        }
    }
    async processIceCandidate(iceCandidate, local) {
        const type = local ? "local" : "remote";
        try {
            await this.peerConnection.addIceCandidate(iceCandidate);
            console.log(`Added ${type} ICE candidate`, iceCandidate);
        }
        catch (error) {
            console.error(`Error adding ${type} ICE candidate`, error);
        }
    }
    sendMessage(channelKey, arrayBuffer) {
        const channel = this.dataChannels[channelKey];
        if (channel) {
            channel.send(arrayBuffer);
            console.debug(`Sent ${channelKey} message`, arrayBuffer);
        }
        else {
            console.warn(`Data channel not found for key: ${channelKey}`);
        }
    }
    handleMessage(message) {
        console.log("Received message from peer:", message);
    }
}