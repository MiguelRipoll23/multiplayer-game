import { GamePlayer } from "../../models/game-player.js";
import { ObjectType } from "../../models/object-type.js";
import { WebRTCPeer } from "../../services/interfaces/webrtc-peer.js";
import { MultiplayerGameObject } from "../interfaces/multiplayer-game-object.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseMultiplayerGameObject
  extends BaseGameObject
  implements MultiplayerGameObject
{
  protected id: string | null = null;
  protected typeId: ObjectType | null = null;
  protected syncableByHost: boolean = false;
  protected owner: GamePlayer | null = null;
  protected sync: boolean = false;

  public static getTypeId(): ObjectType {
    throw new Error("Method not implemented.");
  }

  public static deserialize(
    id: string,
    data: ArrayBuffer
  ): MultiplayerGameObject {
    throw new Error("Method not implemented.");
  }

  public getId(): string | null {
    return this.id;
  }

  public setId(syncableId: string): void {
    this.id = syncableId;
  }

  public getTypeId(): ObjectType | null {
    return this.typeId;
  }

  public setTypeId(objectTypeId: ObjectType): void {
    this.typeId = objectTypeId;
  }

  public isSyncableByHost(): boolean {
    return this.syncableByHost;
  }

  public setSyncableByHost(syncableByHost: boolean): void {
    this.syncableByHost = syncableByHost;
  }

  public getOwner(): GamePlayer | null {
    return this.owner;
  }

  public setOwner(playerOwner: GamePlayer | null): void {
    this.owner = playerOwner;
  }

  public mustSync(): boolean {
    return this.sync;
  }

  public setSync(sync: boolean): void {
    this.sync = sync;
  }

  public reset(): void {
    this.sync = true;
    console.log("Forced sync for object", this);
  }

  public serialize(): ArrayBuffer {
    throw new Error("Method not implemented.");
  }

  public sendSyncableData(
    webrtcPeer: WebRTCPeer,
    data: ArrayBuffer,
    periodicUpdate: boolean
  ): void {
    throw new Error("Method not implemented.");
  }

  public synchronize(data: ArrayBuffer): void {
    throw new Error("Method not implemented.");
  }
}
