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
        this.peerConnection.ondatachannel = () => {
            this.handleConnection();
        };
        this.peerConnection.onconnectionstatechange = () => {
            this.handleStateChange();
        };
        this.addIceListeners();
        this.addMessageListeners();
    }
    addIceListeners() {
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.handleNewIceCandidate(event.candidate.toJSON());
            }
        };
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE connection state:", this.peerConnection.iceConnectionState);
        };
        this.peerConnection.onicegatheringstatechange = () => {
            console.log("ICE gathering state:", this.peerConnection.iceGatheringState);
        };
    }
    handleNewIceCandidate(candidate) {
        console.log("ICE Candidate", candidate);
        if (this.peerConnection.remoteDescription) {
            // Add candidate immediately if remote description is set
            this.addIceCandidate(candidate);
        }
        else {
            // Queue the candidate if remote description is not yet set
            this.iceCandidateQueue.push(candidate);
        }
    }
    async addIceCandidate(candidate) {
        try {
            await this.peerConnection.addIceCandidate(candidate);
            console.log("ICE candidate added successfully");
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
    handleConnection() {
        console.log("Peer connection established");
    }
    handleStateChange() {
        console.log("Peer connection state: ", this.peerConnection.connectionState);
        if (this.peerConnection.connectionState === "disconnected") {
            console.log("Peer connection closed");
        }
    }
    handleMessage(message) {
        console.log("Received message: ", message);
    }
}
