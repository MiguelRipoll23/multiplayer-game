import { GamePlayer } from "../../models/game-player.js";
import { ObjectType } from "../../models/object-type.js";
import { WebRTCPeer } from "../../services/interfaces/webrtc-peer.js";
import { MultiplayerGameObject } from "../interfaces/multiplayer-game-object.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseMultiplayerGameObject extends BaseGameObject {
  protected syncableId: string | null = null;
  protected objectTypeId: ObjectType | null = null;
  protected syncableByHost: boolean = false;
  protected owner: GamePlayer | null = null;

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

  public static deserialize(
    id: string,
    data: ArrayBuffer
  ): MultiplayerGameObject {
    throw new Error("Method not implemented.");
  }

  public sendSyncableData(webrtcPeer: WebRTCPeer, data: ArrayBuffer): void {
    throw new Error("Method not implemented.");
  }

  public synchronize(data: ArrayBuffer): void {
    throw new Error("Method not implemented.");
  }

  public getOwner(): GamePlayer | null {
    return this.owner;
  }

  public setOwner(playerOwner: GamePlayer | null): void {
    this.owner = playerOwner;
  }

  public mustSync(): boolean {
    // Implement logic to determine if the object must be synced immediately
    // For example, you can check if the object is moving or has changed state
    return false;
  }
}
