import { BaseGameObject } from "./base-game-object.js";
export class BaseMultiplayerGameObject extends BaseGameObject {
    syncableId = null;
    objectTypeId = null;
    syncableByHost = false;
    getSyncableId() {
        return this.syncableId;
    }
    setSyncableId(syncableId) {
        this.syncableId = syncableId;
    }
    static getObjectTypeId() {
        throw new Error("Method not implemented.");
    }
    getObjectTypeId() {
        return this.objectTypeId;
    }
    setObjectTypeId(objectTypeId) {
        this.objectTypeId = objectTypeId;
    }
    isSyncableByHost() {
        return this.syncableByHost;
    }
    setSyncableByHost(syncableByHost) {
        this.syncableByHost = syncableByHost;
    }
    serialize() {
        throw new Error("Method not implemented.");
    }
    static deserialize(id, data) {
        throw new Error("Method not implemented.");
    }
    sendSyncableData(webrtcPeer, data) {
        throw new Error("Method not implemented.");
    }
    synchronize(data) {
        throw new Error("Method not implemented.");
    }
}
