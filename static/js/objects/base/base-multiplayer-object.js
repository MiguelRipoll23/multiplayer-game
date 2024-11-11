import { BaseGameObject } from "./base-game-object.js";
export class BaseMultiplayerGameObject extends BaseGameObject {
    syncableId = null;
    syncableTypeId = null;
    syncableByHost = false;
    getSyncableId() {
        return this.syncableId;
    }
    setSyncableId(syncableId) {
        this.syncableId = syncableId;
    }
    getSyncableTypeId() {
        return this.syncableTypeId;
    }
    setSyncableTypeId(syncableTypeId) {
        this.syncableTypeId = syncableTypeId;
    }
    isSyncableByHost() {
        return this.syncableByHost;
    }
    setSyncableByHost(syncableByHost) {
        this.syncableByHost = syncableByHost;
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
