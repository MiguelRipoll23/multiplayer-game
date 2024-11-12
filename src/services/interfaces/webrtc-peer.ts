import { GamePlayer } from "../../models/game-player.js";

export interface WebRTCPeer {
  getPlayer(): GamePlayer | null;
  hasJoined(): boolean;
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
