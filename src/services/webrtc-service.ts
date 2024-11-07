export class WebRTCService {
  private peerConnection: RTCPeerConnection;
  private iceCandidateQueue: RTCIceCandidateInit[] = [];

  private reliableOrderedDataChannel: RTCDataChannel;
  private reliableUnorderedDataChannel: RTCDataChannel;
  private unreliableOrderedDataChannel: RTCDataChannel;
  private unreliableUnorderedDataChannel: RTCDataChannel;

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

  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  public async createAnswer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    await this.peerConnection.setRemoteDescription(offer);

    // Process any queued ICE candidates now that the remote description is set
    this.iceCandidateQueue.forEach((candidate) =>
      this.addIceCandidate(candidate)
    );

    this.iceCandidateQueue = [];

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  public getQueuedIceCandidates(): RTCIceCandidateInit[] {
    return this.iceCandidateQueue;
  }

  public async connect(answer: RTCSessionDescriptionInit): Promise<void> {
    console.log("Connecting to peer...", answer);

    const remoteDesc = new RTCSessionDescription(answer);
    await this.peerConnection.setRemoteDescription(remoteDesc);

    // Process any queued ICE candidates now that the remote description is set
    this.iceCandidateQueue.forEach((candidate) =>
      this.addIceCandidate(candidate)
    );

    this.iceCandidateQueue = [];
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
    this.peerConnection.onconnectionstatechange = () => {
      this.handleStateChange();
    };

    this.addIceListeners();
    this.addMessageListeners();
  }

  private addIceListeners(): void {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.addOrQueueIceCandidate(event.candidate.toJSON());
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(
        "ICE connection state:",
        this.peerConnection.iceConnectionState
      );
    };

    this.peerConnection.onicegatheringstatechange = () => {
      console.log(
        "ICE gathering state:",
        this.peerConnection.iceGatheringState
      );
    };
  }

  public addOrQueueIceCandidate(iceCandidate: RTCIceCandidateInit): void {
    if (this.peerConnection.remoteDescription) {
      // Add candidate immediately if remote description is set
      this.addIceCandidate(iceCandidate);
    } else {
      // Queue the candidate if remote description is not yet set
      this.iceCandidateQueue.push(iceCandidate);
      console.log("Queued ICE candidate", iceCandidate);
    }
  }

  private async addIceCandidate(
    iceCandidate: RTCIceCandidateInit
  ): Promise<void> {
    try {
      await this.peerConnection.addIceCandidate(iceCandidate);
      console.log("Added ICE candidate", iceCandidate);
    } catch (error) {
      console.error("Error adding ICE candidate", error);
    }
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

  private handleStateChange(): void {
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

  private handleConnection(): void {
    console.log("Peer connection established");
  }

  private handleDisconnection(): void {
    console.log("Peer connection closed", event);
  }

  private handleMessage(message: string): void {
    console.log("Received message", message);
  }
}
