export interface WebRTCPeer {
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
