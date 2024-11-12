import { ObjectType } from "../../models/object-type.js";
import { WebRTCPeer } from "../../services/interfaces/webrtc-peer.js";
import { GameObject } from "../interfaces/game-object.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseMultiplayerGameObject extends BaseGameObject {
  protected syncableId: string | null = null;
  protected objectTypeId: ObjectType | null = null;
  protected syncableByHost: boolean = false;

  public getSyncableId(): string | null {
    return this.syncableId;
  }

  public setSyncableId(syncableId: string): void {
    this.syncableId = syncableId;
  }

  public static getObjectTypeId(): ObjectType {
    throw new Error("Method not implemented.");
  }

  public getObjectTypeId(): ObjectType | null {
    return this.objectTypeId;
  }

  public setObjectTypeId(objectTypeId: ObjectType): void {
    this.objectTypeId = objectTypeId;
  }

  public isSyncableByHost(): boolean {
    return this.syncableByHost;
  }

  public setSyncableByHost(syncableByHost: boolean): void {
    this.syncableByHost = syncableByHost;
  }

  public serialize(): ArrayBuffer {
    throw new Error("Method not implemented.");
  }

  public static deserialize(id: string, data: ArrayBuffer): GameObject {
    throw new Error("Method not implemented.");
  }

  public sendSyncableData(webrtcPeer: WebRTCPeer, data: ArrayBuffer): void {
    throw new Error("Method not implemented.");
  }

  public synchronize(data: ArrayBuffer): void {
    throw new Error("Method not implemented.");
  }
}
