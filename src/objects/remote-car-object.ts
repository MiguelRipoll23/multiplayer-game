import { ObjectType } from "../models/object-types.js";
import { CarObject } from "./car-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class RemoteCarObject extends CarObject {
  constructor(syncableId: string, x: number, y: number, angle: number) {
    super(x, y, angle, true);
    this.setDebug(true);
    this.setSyncableValues(syncableId);
  }

  public static override getObjectTypeId(): ObjectType {
    return ObjectType.RemoteCar;
  }

  public static deserialize(syncableId: string, data: ArrayBuffer): GameObject {
    const dataView = new DataView(data);
    const x = dataView.getFloat32(0);
    const y = dataView.getFloat32(4);
    const angle = dataView.getFloat32(6);

    return new RemoteCarObject(syncableId, x, y, angle);
  }

  public override synchronize(data: ArrayBuffer): void {
    const dataView = new DataView(data);

    this.x = dataView.getFloat32(0);
    this.y = dataView.getFloat32(2);
    this.angle = dataView.getFloat32(4);
    this.speed = dataView.getFloat32(6);

    this.updateHitbox();
  }

  private setSyncableValues(syncableId: string) {
    this.syncableId = syncableId;
    this.objectTypeId = ObjectType.RemoteCar;
    this.syncableByHost = true;
  }
}