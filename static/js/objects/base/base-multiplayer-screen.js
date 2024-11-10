import { BaseGameScreen } from "../../screens/base/base-game-screen.js";
import { ObjectUtils } from "../../utils/object-utils.js";
import { BaseMultiplayerGameObject } from "./base-multiplayer-object.js";
export class BaseMultiplayerScreen extends BaseGameScreen {
    syncableObjectTypes = new Map();
    async addSyncableObjectClass(syncableObjectClass) {
        const className = syncableObjectClass.name;
        const typeId = await ObjectUtils.getSyncableTypeId(className);
        this.syncableObjectTypes.set(typeId, syncableObjectClass);
    }
    getSyncableObjectClass(typeId) {
        return this.syncableObjectTypes.get(typeId) ?? null;
    }
    getSyncableObjects() {
        return [...this.uiObjects, ...this.sceneObjects].filter((object) => object instanceof BaseMultiplayerGameObject);
    }
    getSyncableObject(id) {
        let result = null;
        [...this.uiObjects, ...this.sceneObjects].forEach((object) => {
            if (object instanceof BaseMultiplayerGameObject) {
                if (object.getSyncableId() === id) {
                    result = object;
                }
            }
        });
        return result;
    }
}
