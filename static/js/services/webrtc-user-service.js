import { PLAYER_CONNECTED_EVENT } from "../constants/events-constants.js";
export class WebRTCUserService {
    token;
    peerConnection;
    iceCandidateQueue = [];
    reliableOrderedDataChannel = null;
    reliableUnorderedDataChannel = null;
    unreliableOrderedDataChannel = null;
    unreliableUnorderedDataChannel = null;
    constructor(token) {
        this.token = token;
        console.log(`WebRTCUser(token=${token})`);
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
        });
        this.createDataChannels();
        this.addEventListeners();
    }
    getQueuedIceCandidates() {
        return this.iceCandidateQueue;
    }
    addRemoteIceCandidate(iceCandidate) {
        this.addIceCandidate(iceCandidate, false);
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
        const sessionDescription = new RTCSessionDescription(answer);
        await this.peerConnection.setRemoteDescription(sessionDescription);
        // Process any queued ICE candidates now that the remote description is set
        this.iceCandidateQueue.forEach((candidate) => this.addIceCandidate(candidate, true));
        this.iceCandidateQueue = [];
    }
    createDataChannels() {
        this.peerConnection.createDataChannel("reliable-ordered", {
            ordered: true,
        });
        this.peerConnection.createDataChannel("reliable-unordered", {
            ordered: false,
        });
        this.peerConnection.createDataChannel("unreliable-ordered", {
            ordered: true,
            maxRetransmits: 0,
        });
        this.peerConnection.createDataChannel("unreliable-unordered", {
            ordered: false,
            maxRetransmits: 0,
        });
    }
    addEventListeners() {
        this.peerConnection.onconnectionstatechange = () => {
            this.handleConnectionStateChange();
        };
        this.addIceListeners();
    }
    handleConnectionStateChange() {
        console.log("Peer connection state: ", this.peerConnection.connectionState);
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
        console.log("Peer connection established");
        dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT));
    }
    handleDisconnection() {
        console.log("Peer connection closed", event);
    }
    addIceListeners() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.addOrQueueLocalIceCandidate(event.candidate.toJSON());
            }
        };
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", this.peerConnection.iceConnectionState);
        };
        this.peerConnection.onicegatheringstatechange = () => {
            console.log("ICE gathering state:", this.peerConnection.iceGatheringState);
        };
    }
    addOrQueueLocalIceCandidate(iceCandidate) {
        if (this.peerConnection.remoteDescription) {
            this.addIceCandidate(iceCandidate, true);
        }
        else {
            this.iceCandidateQueue.push(iceCandidate);
            console.log("Queued ICE candidate", iceCandidate);
        }
    }
    async addIceCandidate(iceCandidate, local) {
        const type = local ? "local" : "remote";
        try {
            await this.peerConnection.addIceCandidate(iceCandidate);
            console.log(`Added ${type} ICE candidate`, iceCandidate);
        }
        catch (error) {
            console.error(`Error adding ${type} ICE candidate`, error);
        }
    }
    handleMessage(message) {
        console.log("Received message from peer:", message);
    }
}
