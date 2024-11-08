import { PLAYER_CONNECTED_EVENT } from "../constants/events-constants.js";
import { GameController } from "../models/game-controller.js";
import { LoggerUtils } from "../utils/logger-utils.js";

export class WebRTCPeerService {
  public peerConnection: RTCPeerConnection;
  public iceCandidateQueue: RTCIceCandidateInit[] = [];
  public dataChannels: Record<string, RTCDataChannel> = {};

  private logger: LoggerUtils;

  constructor(private gameController: GameController, private token: string) {
    this.logger = new LoggerUtils(`WebRTC peer (${this.token})`);
    this.logger.info("WebRTCPeer initialized");

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    this.initializeDataChannels();
    this.addEventListeners();
  }

  public getQueuedIceCandidates(): RTCIceCandidateInit[] {
    return this.iceCandidateQueue;
  }

  public addRemoteIceCandidate(iceCandidate: RTCIceCandidateInit): void {
    this.processIceCandidate(iceCandidate, false);
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
    this.logger.info("Connecting to peer...", answer);
    await this.peerConnection.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
    this.iceCandidateQueue.forEach((candidate) =>
      this.processIceCandidate(candidate, true)
    );
    this.iceCandidateQueue = [];
  }

  public sendReliableOrderedMessage(arrayBuffer: ArrayBuffer): void {
    this.sendMessage("reliable-ordered", arrayBuffer);
  }

  public sendReliableUnorderedMessage(arrayBuffer: ArrayBuffer): void {
    this.sendMessage("reliable-unordered", arrayBuffer);
  }

  public sendUnreliableOrderedMessage(arrayBuffer: ArrayBuffer): void {
    this.sendMessage("unreliable-ordered", arrayBuffer);
  }

  public sendUnreliableUnorderedMessage(arrayBuffer: ArrayBuffer): void {
    this.sendMessage("unreliable-unordered", arrayBuffer);
  }

  private initializeDataChannels(): void {
    this.dataChannels = {
      "reliable-ordered": this.peerConnection.createDataChannel(
        "reliable-ordered",
        { ordered: true }
      ),
      "reliable-unordered": this.peerConnection.createDataChannel(
        "reliable-unordered",
        { ordered: false }
      ),
      "unreliable-ordered": this.peerConnection.createDataChannel(
        "unreliable-ordered",
        { ordered: true, maxRetransmits: 0 }
      ),
      "unreliable-unordered": this.peerConnection.createDataChannel(
        "unreliable-unordered",
        { ordered: false, maxRetransmits: 0 }
      ),
    };
  }

  private addEventListeners(): void {
    this.peerConnection.onconnectionstatechange = () =>
      this.handleConnectionStateChange();
    this.addIceListeners();
    this.addDataChannelListeners();
  }

  private handleConnectionStateChange(): void {
    this.logger.info(
      "Peer connection state:",
      this.peerConnection.connectionState
    );
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
    this.logger.info("Peer connection established");
    dispatchEvent(new CustomEvent(PLAYER_CONNECTED_EVENT));
  }

  private handleDisconnection(): void {
    this.logger.info("Peer connection closed");
    this.gameController.getWebRTCService().removePeer(this.token);
  }

  private addIceListeners(): void {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.queueOrProcessIceCandidate(event.candidate.toJSON());
      }
    };
    this.peerConnection.oniceconnectionstatechange = () => {
      this.logger.info(
        "ICE connection state:",
        this.peerConnection.iceConnectionState
      );
    };
    this.peerConnection.onicegatheringstatechange = () => {
      this.logger.info(
        "ICE gathering state:",
        this.peerConnection.iceGatheringState
      );
    };
  }

  private addDataChannelListeners(): void {
    Object.values(this.dataChannels).forEach((channel) => {
      channel.onopen = () => this.handleDataChannelOpen();
      channel.onmessage = (event) => this.handleMessage(event.data);
    });
  }

  private handleDataChannelOpen(): void {
    this.logger.info("Data channel opened");
    if (this.areAllDataChannelsOpen()) {
      this.gameController.getMatchmakingService().hasPeerConnected(this);
    }
  }

  private areAllDataChannelsOpen(): boolean {
    return Object.values(this.dataChannels).every(
      (channel) => channel.readyState === "open"
    );
  }

  private queueOrProcessIceCandidate(iceCandidate: RTCIceCandidateInit): void {
    if (this.peerConnection.remoteDescription) {
      this.processIceCandidate(iceCandidate, true);
    } else {
      this.iceCandidateQueue.push(iceCandidate);
      this.logger.info("Queued ICE candidate", iceCandidate);
    }
  }

  private async processIceCandidate(
    iceCandidate: RTCIceCandidateInit,
    local: boolean
  ): Promise<void> {
    const type = local ? "local" : "remote";
    try {
      await this.peerConnection.addIceCandidate(iceCandidate);
      this.logger.info(`Added ${type} ICE candidate`, iceCandidate);
    } catch (error) {
      this.logger.error(`Error adding ${type} ICE candidate`, error);
    }
  }

  private sendMessage(channelKey: string, arrayBuffer: ArrayBuffer): void {
    const channel = this.dataChannels[channelKey];

    if (channel === undefined) {
      return this.logger.warn(`Data channel not found for key: ${channelKey}`);
    }

    channel.send(arrayBuffer);
    this.logger.debug(`Sent ${channelKey} message`, arrayBuffer);
  }

  private handleMessage(message: string): void {
    this.logger.debug("Received message from peer", message);
  }
}
