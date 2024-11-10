import { ObjectUtils } from "../../utils/object-utils.js";
import { BaseGameObject } from "./base-game-object.js";
export class BaseMultiplayerGameObject extends BaseGameObject {
    syncableId;
    syncableTypeId;
    constructor() {
        super();
        this.syncableId = "94c58aa0-41c3-4b22-825a-15a3834be240";
        this.syncableTypeId = ObjectUtils.getSyncableTypeId(this.constructor.name);
    }
    getSyncableId() {
        return this.syncableId;
    }
    setSyncableId(syncableId) {
        this.syncableId = syncableId;
    }
    getSyncableType() {
        return this.syncableTypeId;
    }
    serialize() {
        return new Uint8Array();
    }
    static deserialize(id, data) {
        throw new Error("Method not implemented.");
    }
    synchronize(data) {
        throw new Error("Method not implemented.");
    }
}
