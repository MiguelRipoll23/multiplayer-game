export class WebRTCService {
  private peerConnection: RTCPeerConnection;

  private reliableOrderedDataChannel: RTCDataChannel;
  private reliableUnorderedDataChannel: RTCDataChannel;
  private unreliableOrderedDataChannel: RTCDataChannel;
  private unreliableUnorderedDataChannel: RTCDataChannel;

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

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  public async connect(answer: RTCSessionDescriptionInit): Promise<void> {
    const remoteDesc = new RTCSessionDescription(answer);
    await this.peerConnection.setRemoteDescription(remoteDesc);

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate: ", event.candidate);
      }
    };
  }

  private createReliableAndOrderedDataChannel(): RTCDataChannel {
    return this.peerConnection.createDataChannel("reliable-ordered", {
      ordered: true,
    });
  }

  private createReliableAndUnorderedDataChannel(): RTCDataChannel {
    return this.peerConnection.createDataChannel("reliable-unordered", {
      ordered: false,
    });
  }

  private createUnreliableAndOrderedDataChannel(): RTCDataChannel {
    return this.peerConnection.createDataChannel("unreliable-ordered", {
      ordered: true,
      maxRetransmits: 0,
    });
  }

  private createUnreliableAndUnorderedDataChannel(): RTCDataChannel {
    return this.peerConnection.createDataChannel("unreliable-unordered", {
      ordered: false,
      maxRetransmits: 0,
    });
  }

  private addEventListeners(): void {
    this.peerConnection.ondatachannel = () => {
      this.handleConnection();
    };

    this.peerConnection.onconnectionstatechange = () => {
      this.handleStateChange();
    };

    this.addMessageListeners();
  }

  private addMessageListeners(): void {
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

  private handleConnection(): void {
    console.log("Peer connection established");
  }

  private handleStateChange(): void {
    console.log("Peer connection state: ", this.peerConnection.connectionState);

    if (this.peerConnection.connectionState === "disconnected") {
      console.log("Peer connection closed");
    }
  }

  private handleMessage(message: string): void {
    console.log("Received message: ", message);
  }
}
