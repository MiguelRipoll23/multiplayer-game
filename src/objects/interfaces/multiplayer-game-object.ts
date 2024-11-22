import { GamePlayer } from "../../models/game-player.js";
import { ObjectType } from "../../models/object-type.js";
import { WebRTCPeer } from "../../services/interfaces/webrtc-peer.js";
import { GameObject } from "./game-object.js";

export interface MultiplayerGameObject extends GameObject {
  getId(): string | null;
  getTypeId(): ObjectType | null;
  getOwner(): GamePlayer | null;
  setOwner(player: GamePlayer | null): void;
  isSyncableByHost(): boolean;
  mustSync(): boolean;
  setSync(sync: boolean): void;
  serialize(): ArrayBuffer;
  sendSyncableData(
    webrtcPeer: WebRTCPeer,
    data: ArrayBuffer,
    periodicUpdate: boolean
  ): void;
  synchronize(data: ArrayBuffer): void;
}

export interface StaticMultiplayerGameObject {
  new (...args: any[]): MultiplayerGameObject;
  getTypeId(): ObjectType;
  deserialize(id: string, data: ArrayBuffer): MultiplayerGameObject;
}
