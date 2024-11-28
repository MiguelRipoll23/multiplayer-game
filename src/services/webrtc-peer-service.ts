import {
  SNAPSHOT_ACK_ID,
  SNAPSHOT_ID,
  JOIN_REQUEST_ID,
  JOIN_RESPONSE_ID,
  OBJECT_ID,
  PLAYER_ID,
  EVENT_ID,
  DISCONNECT_ID,
} from "../constants/webrtc-constants.js";
import { GameController } from "../models/game-controller.js";
import { GamePlayer } from "../models/game-player.js";
import { ConnectionStateType } from "../types/connection-state-type.js";
import { LoggerUtils } from "../utils/logger-utils.js";
import { MatchmakingService } from "./matchmaking-service.js";
import { ObjectOrchestrator } from "./object-orchestrator-service.js";
import { EventProcessorService } from "./events-processor-service.js";

export class WebRTCPeerService {
  private logger: LoggerUtils;
  private matchmakingService: MatchmakingService;
  private objectOrchestrator: ObjectOrchestrator;
  private eventsProcessorService: EventProcessorService;

  private peerConnection: RTCPeerConnection;
  private iceCandidateQueue: RTCIceCandidateInit[] = [];
  private dataChannels: Record<string, RTCDataChannel> = {};

  private connectionState: ConnectionStateType =
    ConnectionStateType.Disconnected;

  private messageQueue: Array<{
    channelKey: string;
    arrayBuffer: ArrayBuffer;
  }> = [];

  private host: boolean = false;
  private player: GamePlayer | null = null;
  private joined: boolean = false;

  constructor(private gameController: GameController, private token: string) {
    this.logger = new LoggerUtils(`WebRTC(${this.token})`);

    this.matchmakingService = this.gameController.getMatchmakingService();
    this.objectOrchestrator = this.gameController.getObjectOrchestrator();
    this.eventsProcessorService =
      this.gameController.getEventProcessorService();

    this.host =
      this.gameController.getGameState().getGameMatch()?.isHost() ?? false;

    this.peerConnection = new RTCPeerConnection({
      iceServers: this.gameController
        ?.getGameState()
        ?.getGameServer()
        ?.getGameRegistration()
        ?.getIceServers(),
    });

    if (this.host === false) {
      this.initializeDataChannels();
    }

    this.addEventListeners();
  }

  public getConnectionState(): ConnectionStateType {
    return this.connectionState;
  }

  public getToken(): string {
    return this.token;
  }

  public getName(): string {
    return this.player?.getName() ?? this.token;
  }

  public getPlayer(): GamePlayer | null {
    return this.player;
  }

  public setPlayer(player: GamePlayer): void {
    this.player = player;
  }

  public hasJoined() {
    return this.joined;
  }

  public setJoined(joined: boolean) {
    this.joined = joined;
    if (joined) {
      this.sendQueuedMessages();
    }
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

  public disconnectGracefully(): void {
    this.connectionState = ConnectionStateType.Disconnected;
    this.sendDisconnectMessage();
  }

  public disconnect(): void {
    this.peerConnection.close();
  }

  public sendReliableOrderedMessage(
    arrayBuffer: ArrayBuffer,
    skipQueue = false
  ): void {
    this.sendMessage("reliable-ordered", arrayBuffer, skipQueue);
  }

  public sendReliableUnorderedMessage(
    arrayBuffer: ArrayBuffer,
    skipQueue = false
  ): void {
    this.sendMessage("reliable-unordered", arrayBuffer, skipQueue);
  }

  public sendUnreliableOrderedMessage(arrayBuffer: ArrayBuffer): void {
    if (this.joined === false) {
      return;
    }

    this.sendMessage("unreliable-ordered", arrayBuffer, true);
  }

  public sendUnreliableUnorderedMessage(arrayBuffer: ArrayBuffer): void {
    if (this.joined === false) {
      return;
    }

    this.sendMessage("unreliable-unordered", arrayBuffer, true);
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
    this.addConnectionListeners();
    this.addIceListeners();
    this.addDataChannelListeners();
  }

  private addConnectionListeners(): void {
    this.peerConnection.onconnectionstatechange = () =>
      this.handleConnectionStateChange();
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
    this.connectionState = ConnectionStateType.Connected;
  }

  private handleDisconnection(): void {
    if (this.connectionState === ConnectionStateType.Disconnected) {
      return;
    }

    this.logger.info("Peer connection closed");
    this.connectionState = ConnectionStateType.Disconnected;
    this.gameController.getWebRTCService().removePeer(this.token);
    this.matchmakingService.hasPeerDisconnected(this);
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

    this.peerConnection.onicecandidateerror = (event) => {
      this.logger.error("ICE candidate error", event);
    };
  }

  private addDataChannelListeners(): void {
    if (this.host) {
      // If the instance is not the host, listen for the data channels from the host
      this.peerConnection.ondatachannel = (event) => {
        const channel = event.channel;
        this.dataChannels[channel.label] = channel;
        this.setupDataChannelListeners(channel);
      };
    } else {
      // For the non-host, set up listeners for already created channels
      Object.values(this.dataChannels).forEach((channel) => {
        this.setupDataChannelListeners(channel);
      });
    }
  }

  private setupDataChannelListeners(channel: RTCDataChannel): void {
    channel.binaryType = "arraybuffer";

    channel.onopen = () => this.handleDataChannelOpen(channel.label);
    channel.onerror = (error) =>
      this.handleDataChannelError(channel.label, error);
    channel.onmessage = (event) => this.handleMessage(event.data);
  }

  private handleDataChannelOpen(label: string): void {
    this.logger.info(`Data channel ${label} opened`);

    if (this.host === false && this.areAllDataChannelsOpen()) {
      this.matchmakingService.hasPeerConnected(this);
    }
  }

  private areAllDataChannelsOpen(): boolean {
    return Object.values(this.dataChannels).every(
      (channel) => channel.readyState === "open"
    );
  }

  private handleDataChannelError(label: string, error: Event): void {
    this.logger.error(`Data channel ${label} error`, error);
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

  private sendMessage(
    channelKey: string,
    arrayBuffer: ArrayBuffer,
    skipQueue = false
  ): void {
    if (this.joined === false && skipQueue === false) {
      this.messageQueue.push({ channelKey, arrayBuffer });
      console.log("Queued message", channelKey, new Uint8Array(arrayBuffer));
      return;
    }

    const channel = this.dataChannels[channelKey];

    if (channel === undefined) {
      return this.logger.warn(`Data channel not found for key: ${channelKey}`);
    }

    if (channel.readyState !== "open") {
      return;
    }

    try {
      channel.send(arrayBuffer);

      if (channel.label.startsWith("reliable")) {
        this.logger.info("Sent message", new Uint8Array(arrayBuffer));
      }
    } catch (error) {
      this.logger.error(`Error sending ${channelKey} message`, error);
    }
  }

  private sendQueuedMessages(): void {
    while (this.messageQueue.length > 0) {
      const { channelKey, arrayBuffer } = this.messageQueue.shift()!;
      this.sendMessage(channelKey, arrayBuffer, true);
    }
  }

  private handleMessage(arrayBuffer: ArrayBuffer): void {
    //this.logger.info("Received message from peer", new Uint8Array(arrayBuffer));
    //this.logger.info(new TextDecoder().decode(arrayBuffer));

    const dataView = new DataView(arrayBuffer);
    const id = dataView.getInt8(0);
    const payload =
      dataView.buffer.byteLength > 1 ? arrayBuffer.slice(1) : null;

    if (this.isInvalidStateForId(id)) {
      return console.warn("Invalid player state for message", id);
    }

    switch (id) {
      case JOIN_REQUEST_ID:
        return this.matchmakingService.handleJoinRequest(this, payload);

      case JOIN_RESPONSE_ID:
        return this.matchmakingService.handleJoinResponse(this, payload);

      case PLAYER_ID:
        return this.matchmakingService.handlePlayerConnection(this, payload);

      case SNAPSHOT_ID:
        return this.matchmakingService.handleSnapshot(this);

      case SNAPSHOT_ACK_ID:
        return this.matchmakingService.handleSnapshotACK(this);

      case OBJECT_ID:
        return this.objectOrchestrator.handleRemoteData(this, payload);

      case EVENT_ID:
        return this.eventsProcessorService.handleRemoteEvent(this, payload);

      case DISCONNECT_ID:
        return this.handleGracefulDisconnect();

      default: {
        this.logger.warn("Unknown message identifier", id);
      }
    }
  }

  private isInvalidStateForId(id: number): boolean {
    if (this.joined) {
      return false;
    }

    return id > SNAPSHOT_ACK_ID;
  }

  private sendDisconnectMessage(): void {
    const arrayBuffer = new ArrayBuffer(1);

    const dataView = new DataView(arrayBuffer);
    dataView.setInt8(0, DISCONNECT_ID);

    this.sendReliableOrderedMessage(arrayBuffer);
    console.log("Disconnect message sent");
  }

  private handleGracefulDisconnect(): void {
    console.log("Received graceful disconnect message");
    this.connectionState = ConnectionStateType.Disconnected;
    this.disconnect();
  }
}
