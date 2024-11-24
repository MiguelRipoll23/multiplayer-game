import { GamePlayer } from "../../models/game-player.js";
import { ConnectionStateType } from "../../types/connection-state-type.js";

export interface WebRTCPeer {
  getConnectionState(): ConnectionStateType;
  getToken(): string;
  getName(): string;
  getPlayer(): GamePlayer | null;
  setPlayer(player: GamePlayer): void;
  hasJoined(): boolean;
  setJoined(joined: boolean): void;
  disconnect(): void;
  disconnectGracefully(): void;
  createOffer(): Promise<RTCSessionDescriptionInit>;
  createAnswer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit>;
  connect(answer: RTCSessionDescriptionInit): Promise<void>;
  getQueuedIceCandidates(): RTCIceCandidateInit[];
  addRemoteIceCandidate(iceCandidate: RTCIceCandidateInit): void;
  sendReliableOrderedMessage(arrayBuffer: ArrayBuffer, skipQueue?: boolean): void;
  sendReliableUnorderedMessage(arrayBuffer: ArrayBuffer, skipQueue?: boolean): void;
  sendUnreliableOrderedMessage(arrayBuffer: ArrayBuffer, skipQueue?: boolean): void;
  sendUnreliableUnorderedMessage(arrayBuffer: ArrayBuffer, skipQueue?: boolean): void;
}
