import { BaseGameScreen } from "../../screens/base/base-game-screen.js";
import { BaseMultiplayerGameObject } from "./base-multiplayer-object.js";
export class BaseMultiplayerScreen extends BaseGameScreen {
    syncableObjectTypes = new Map();
    addSyncableObject(objectInstance, objectClass) {
        const typeId = objectInstance.getSyncableTypeId();
        if (typeId === null) {
            throw new Error("Object type ID is not set");
        }
        this.syncableObjectTypes.set(typeId, objectClass);
    }
    getSyncableObjectClass(typeId) {
        return this.syncableObjectTypes.get(typeId) ?? null;
    }
    getSyncableObjects() {
        return [...this.uiObjects, ...this.sceneObjects]
            .filter((object) => object instanceof BaseMultiplayerGameObject)
            .filter((object) => object.getSyncableId() !== null);
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
