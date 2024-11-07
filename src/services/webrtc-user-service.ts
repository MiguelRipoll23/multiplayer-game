import { PLAYER_CONNECTED_EVENT } from "../constants/events-constants.js";

export class WebRTCUserService {
  public peerConnection: RTCPeerConnection;
  public iceCandidateQueue: RTCIceCandidateInit[] = [];

  public reliableOrderedDataChannel: RTCDataChannel | null = null;
  public reliableUnorderedDataChannel: RTCDataChannel | null = null;
  public unreliableOrderedDataChannel: RTCDataChannel | null = null;
  public unreliableUnorderedDataChannel: RTCDataChannel | null = null;

  constructor(private token: string) {
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

  public getQueuedIceCandidates(): RTCIceCandidateInit[] {
    return this.iceCandidateQueue;
  }

  public addRemoteIceCandidate(iceCandidate: RTCIceCandidateInit): void {
    this.addIceCandidate(iceCandidate, false);
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

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  public async connect(answer: RTCSessionDescriptionInit): Promise<void> {
    console.log("Connecting to peer...", answer);

    const sessionDescription = new RTCSessionDescription(answer);
    await this.peerConnection.setRemoteDescription(sessionDescription);

    // Process any queued ICE candidates now that the remote description is set
    this.iceCandidateQueue.forEach((candidate) =>
      this.addIceCandidate(candidate, true)
    );

    this.iceCandidateQueue = [];
  }

  private createDataChannels(): void {
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

  private addEventListeners(): void {
    this.peerConnection.onconnectionstatechange = () => {
      this.handleConnectionStateChange();
    };

    this.addIceListeners();
  }

  private handleConnectionStateChange(): void {
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
    dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT));
  }

  private handleDisconnection(): void {
    console.log("Peer connection closed", event);
  }

  private addIceListeners(): void {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.addOrQueueLocalIceCandidate(event.candidate.toJSON());
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

  private addOrQueueLocalIceCandidate(iceCandidate: RTCIceCandidateInit): void {
    if (this.peerConnection.remoteDescription) {
      this.addIceCandidate(iceCandidate, true);
    } else {
      this.iceCandidateQueue.push(iceCandidate);
      console.log("Queued ICE candidate", iceCandidate);
    }
  }

  private async addIceCandidate(
    iceCandidate: RTCIceCandidateInit,
    local: boolean
  ): Promise<void> {
    const type = local ? "local" : "remote";

    try {
      await this.peerConnection.addIceCandidate(iceCandidate);
      console.log(`Added ${type} ICE candidate`, iceCandidate);
    } catch (error) {
      console.error(`Error adding ${type} ICE candidate`, error);
    }
  }

  public handleMessage(message: string): void {
    console.log("Received message from peer:", message);
  }
}
