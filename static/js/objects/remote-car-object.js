import { ObjectType } from "../models/object-types.js";
import { CarObject } from "./car-object.js";
export class RemoteCarObject extends CarObject {
    constructor(syncableId, x, y, angle) {
        super(x, y, angle, true);
        this.setDebug(true);
        this.setSyncableValues(syncableId);
    }
    static getObjectTypeId() {
        return ObjectType.RemoteCar;
    }
    static deserialize(syncableId, data) {
        const dataView = new DataView(data);
        const x = dataView.getFloat32(0);
        const y = dataView.getFloat32(4);
        const angle = dataView.getFloat32(6);
        return new RemoteCarObject(syncableId, x, y, angle);
    }
    synchronize(data) {
        const dataView = new DataView(data);
        this.x = dataView.getFloat32(0);
        this.y = dataView.getFloat32(2);
        this.angle = dataView.getFloat32(4);
        this.speed = dataView.getFloat32(6);
        this.updateHitbox();
    }
    setSyncableValues(syncableId) {
        this.syncableId = syncableId;
        this.objectTypeId = ObjectType.RemoteCar;
        this.syncableByHost = true;
    }
}
