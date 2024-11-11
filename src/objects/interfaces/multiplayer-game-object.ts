import { SyncableType } from "../../services/object-orchestrator-service.js";

export interface MultiplayerGameObject {
  getSyncableId(): string | null;
  getSyncableTypeId(): SyncableType | null;
  isSyncableByHost(): boolean;
  serialize(): Uint8Array;
  synchronize(data: Uint8Array): void;
}

export interface StaticMultiplayerGameObject {
  new (...args: any[]): MultiplayerGameObject;
  deserialize(id: string, data: Uint8Array): void;
}
