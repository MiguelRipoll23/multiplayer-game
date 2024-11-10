import { ObjectUtils } from "../../utils/object-utils.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseMultiplayerGameObject extends BaseGameObject {
  protected syncableId: string;
  protected syncableTypeId: number;

  constructor() {
    super();
    this.syncableId = "94c58aa0-41c3-4b22-825a-15a3834be240";
    this.syncableTypeId = ObjectUtils.getSyncableTypeId(this.constructor.name);
  }

  public getSyncableId(): string {
    return this.syncableId;
  }

  public setSyncableId(syncableId: string): void {
    this.syncableId = syncableId;
  }

  public getSyncableType(): number {
    return this.syncableTypeId;
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
