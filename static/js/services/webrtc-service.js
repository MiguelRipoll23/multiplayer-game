export class WebRTCService {
    peerConnection;
    iceCandidateQueue = [];
    reliableOrderedDataChannel;
    reliableUnorderedDataChannel;
    unreliableOrderedDataChannel;
    unreliableUnorderedDataChannel;
    constructor() {
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.l.google.com:19302",
                },
            ],
        });
        this.reliableOrderedDataChannel =
            this.createReliableAndOrderedDataChannel();
        this.reliableUnorderedDataChannel =
            this.createReliableAndUnorderedDataChannel();
        this.unreliableOrderedDataChannel =
            this.createUnreliableAndOrderedDataChannel();
        this.unreliableUnorderedDataChannel =
            this.createUnreliableAndUnorderedDataChannel();
        this.addEventListeners();
    }
    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        return offer;
    }
    async createAnswer(offer) {
        await this.peerConnection.setRemoteDescription(offer);
        // Process any queued ICE candidates now that the remote description is set
        this.iceCandidateQueue.forEach((candidate) => this.addIceCandidate(candidate));
        this.iceCandidateQueue = [];
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        return answer;
    }
    getQueuedIceCandidates() {
        return this.iceCandidateQueue;
    }
    async connect(answer) {
        console.log("Connecting to peer...", answer);
        const remoteDesc = new RTCSessionDescription(answer);
        await this.peerConnection.setRemoteDescription(remoteDesc);
        // Process any queued ICE candidates now that the remote description is set
        this.iceCandidateQueue.forEach((candidate) => this.addIceCandidate(candidate));
        this.iceCandidateQueue = [];
    }
    createReliableAndOrderedDataChannel() {
        return this.peerConnection.createDataChannel("reliable-ordered", {
            ordered: true,
        });
    }
    createReliableAndUnorderedDataChannel() {
        return this.peerConnection.createDataChannel("reliable-unordered", {
            ordered: false,
        });
    }
    createUnreliableAndOrderedDataChannel() {
        return this.peerConnection.createDataChannel("unreliable-ordered", {
            ordered: true,
            maxRetransmits: 0,
        });
    }
    createUnreliableAndUnorderedDataChannel() {
        return this.peerConnection.createDataChannel("unreliable-unordered", {
            ordered: false,
            maxRetransmits: 0,
        });
    }
    addEventListeners() {
        this.peerConnection.onconnectionstatechange = () => {
            this.handleStateChange();
        };
        this.addIceListeners();
        this.addMessageListeners();
    }
    addIceListeners() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.addOrQueueIceCandidate(event.candidate.toJSON());
            }
        };
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", this.peerConnection.iceConnectionState);
        };
        this.peerConnection.onicegatheringstatechange = () => {
            console.log("ICE gathering state:", this.peerConnection.iceGatheringState);
        };
    }
    addOrQueueIceCandidate(iceCandidate) {
        if (this.peerConnection.remoteDescription) {
            // Add candidate immediately if remote description is set
            this.addIceCandidate(iceCandidate);
        }
        else {
            // Queue the candidate if remote description is not yet set
            this.iceCandidateQueue.push(iceCandidate);
            console.log("Queued ICE candidate", iceCandidate);
        }
    }
    async addIceCandidate(iceCandidate) {
        try {
            await this.peerConnection.addIceCandidate(iceCandidate);
            console.log("Added ICE candidate", iceCandidate);
        }
        catch (error) {
            console.error("Error adding ICE candidate", error);
        }
    }
    addMessageListeners() {
        this.reliableOrderedDataChannel.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        this.reliableUnorderedDataChannel.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        this.unreliableOrderedDataChannel.onmessage = (event) => {
            this.handleMessage(event.data);
        };
        this.unreliableUnorderedDataChannel.onmessage = (event) => {
            this.handleMessage(event.data);
        };
    }
    handleStateChange() {
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
    }
    handleDisconnection() {
        console.log("Peer connection closed", event);
    }
    handleMessage(message) {
        console.log("Received message", message);
    }
}
