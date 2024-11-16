import { GamePlayer } from "../../models/game-player.js";
import { ConnectionState } from "../../models/player-state.js";

export interface WebRTCPeer {
  getConnectionState(): ConnectionState;
  getToken(): string;
  getName(): string;
  getPlayer(): GamePlayer | null;
  setPlayer(player: GamePlayer): void;
  hasJoined(): boolean;
  setJoined(joined: boolean): void;
  disconnect(): void;
  createOffer(): Promise<RTCSessionDescriptionInit>;
  createAnswer(
    offer: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit>;
  connect(answer: RTCSessionDescriptionInit): Promise<void>;
  getQueuedIceCandidates(): RTCIceCandidateInit[];
  addRemoteIceCandidate(iceCandidate: RTCIceCandidateInit): void;
  sendReliableOrderedMessage(arrayBuffer: ArrayBuffer): void;
  sendReliableUnorderedMessage(arrayBuffer: ArrayBuffer): void;
  sendUnreliableOrderedMessage(arrayBuffer: ArrayBuffer): void;
  sendUnreliableUnorderedMessage(arrayBuffer: ArrayBuffer): void;
}
