import { ObjectType } from "../../models/object-types.js";
import { WebRTCPeer } from "../../services/interfaces/webrtc-peer.js";

export interface MultiplayerGameObject {
  getSyncableId(): string | null;
  getObjectTypeId(): ObjectType | null;
  isSyncableByHost(): boolean;
  serialize(): ArrayBuffer;
  sendSyncableDataToPeer(webrtcPeer: WebRTCPeer, data: ArrayBuffer): void;
  synchronize(data: ArrayBuffer): void;
}

export interface StaticMultiplayerGameObject {
  new (...args: any[]): MultiplayerGameObject;
  deserialize(id: string, data: ArrayBuffer): void;
}
