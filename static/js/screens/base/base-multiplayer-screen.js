import { BaseMultiplayerGameObject } from "../../objects/base/base-multiplayer-object.js";
import { BaseGameScreen } from "../../screens/base/base-game-screen.js";
export class BaseMultiplayerScreen extends BaseGameScreen {
    syncableObjectTypes = new Map();
    addSyncableObject(objectClass) {
        const typeId = objectClass.getObjectTypeId();
        this.syncableObjectTypes.set(typeId, objectClass);
    }
    getSyncableObjectClass(typeId) {
        return this.syncableObjectTypes.get(typeId) ?? null;
    }
    getSyncableObjects() {
        const result = [];
        for (const object of this.uiObjects) {
            if (object instanceof BaseMultiplayerGameObject &&
                object.getSyncableId() !== null) {
                result.push(object);
            }
        }
        for (const object of this.sceneObjects) {
            if (object instanceof BaseMultiplayerGameObject &&
                object.getSyncableId() !== null) {
                result.push(object);
            }
        }
        return result;
    }
    getSyncableObject(id) {
        for (const object of this.uiObjects) {
            if (object instanceof BaseMultiplayerGameObject &&
                object.getSyncableId() === id) {
                return object;
            }
        }
        for (const object of this.sceneObjects) {
            if (object instanceof BaseMultiplayerGameObject &&
                object.getSyncableId() === id) {
                return object;
            }
        }
        return null;
    }
    getObjectsByOwner(player) {
        const result = [];
        this.uiObjects.forEach((object) => {
            if (object instanceof BaseMultiplayerGameObject &&
                object.getOwner() === player) {
                result.push(object);
            }
        });
        this.sceneObjects.forEach((object) => {
            if (object instanceof BaseMultiplayerGameObject &&
                object.getOwner() === player) {
                result.push(object);
            }
        });
        return result;
    }
}
