import { ObjectType } from "../../models/object-types.js";
import { WebRTCPeer } from "../../services/interfaces/webrtc-peer.js";
import { GameObject } from "./game-object.js";

export interface MultiplayerGameObject {
  getSyncableId(): string | null;
  getObjectTypeId(): ObjectType | null;
  isSyncableByHost(): boolean;
  serialize(): ArrayBuffer;
  sendSyncableData(webrtcPeer: WebRTCPeer, data: ArrayBuffer): void;
  synchronize(data: ArrayBuffer): void;
}

export interface StaticMultiplayerGameObject {
  new (...args: any[]): MultiplayerGameObject;
  getObjectTypeId(): ObjectType;
  deserialize(id: string, data: ArrayBuffer): GameObject;
}