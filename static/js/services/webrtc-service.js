export class WebRTCService {
    peerConnection;
    reliableOrderedDataChannel;
    reliableUnorderedDataChannel;
    unreliableOrderedDataChannel;
    unreliableUnorderedDataChannel;
    constructor() {
        this.peerConnection = new RTCPeerConnection();
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
    async connect(answer) {
        const remoteDesc = new RTCSessionDescription(answer);
        await this.peerConnection.setRemoteDescription(remoteDesc);
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log("New ICE candidate: ", event.candidate);
            }
        };
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
        this.addMessageListeners();
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
