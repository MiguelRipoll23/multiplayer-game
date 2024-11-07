export class WebRTCService {
  private peerConnection: RTCPeerConnection;
  private dataChannel: RTCDataChannel;

  constructor() {
    this.peerConnection = new RTCPeerConnection();
    this.dataChannel = this.peerConnection.createDataChannel("dataChannel");
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

    this.dataChannel.onopen = () => {
      console.log("Data channel is open");
    };

    this.dataChannel.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  private handleMessage(message: string): void {
    console.log("Received message: ", message);
  }

  private handleConnection(): void {
    console.log("Peer connection established");
  }

  private handleDisconnection(): void {
    console.log("Peer connection closed");
  }
}
