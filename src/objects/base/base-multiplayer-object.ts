import { SyncableType } from "../../services/object-orchestrator-service.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseMultiplayerGameObject extends BaseGameObject {
  protected syncableId: string | null = null;
  protected syncableTypeId: SyncableType | null = null;
  protected syncableByHost: boolean = false;

  public getSyncableId(): string | null {
    return this.syncableId;
  }

  public setSyncableId(syncableId: string): void {
    this.syncableId = syncableId;
  }

  public getSyncableTypeId(): SyncableType | null {
    return this.syncableTypeId;
  }

  public setSyncableTypeId(syncableTypeId: SyncableType): void {
    this.syncableTypeId = syncableTypeId;
  }

  public isSyncableByHost(): boolean {
    return this.syncableByHost;
  }

  public setSyncableByHost(syncableByHost: boolean): void {
    this.syncableByHost = syncableByHost;
  }

  public serialize(): Uint8Array {
    return new Uint8Array();
  }

  public static deserialize(id: string, data: Uint8Array): void {
    throw new Error("Method not implemented.");
  }

  public synchronize(data: Uint8Array): void {
    throw new Error("Method not implemented.");
  }
}
