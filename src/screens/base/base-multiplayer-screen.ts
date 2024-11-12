import { ObjectType } from "../../models/object-types.js";
import { BaseMultiplayerGameObject } from "../../objects/base/base-multiplayer-object.js";
import {
  StaticMultiplayerGameObject,
  MultiplayerGameObject,
} from "../../objects/interfaces/multiplayer-game-object.js";
import { BaseGameScreen } from "../../screens/base/base-game-screen.js";

export class BaseMultiplayerScreen extends BaseGameScreen {
  protected syncableObjectTypes: Map<ObjectType, StaticMultiplayerGameObject> =
    new Map();

  public addSyncableObject(objectClass: StaticMultiplayerGameObject): void {
    const typeId = objectClass.getObjectTypeId();
    this.syncableObjectTypes.set(typeId, objectClass);
  }

  public getSyncableObjectClass(
    typeId: number
  ): StaticMultiplayerGameObject | null {
    return this.syncableObjectTypes.get(typeId) ?? null;
  }

  public getSyncableObjects(): MultiplayerGameObject[] {
    const result: MultiplayerGameObject[] = [];

    for (const object of this.uiObjects) {
      if (
        object instanceof BaseMultiplayerGameObject &&
        object.getSyncableId() !== null
      ) {
        result.push(object);
      }
    }

    for (const object of this.sceneObjects) {
      if (
        object instanceof BaseMultiplayerGameObject &&
        object.getSyncableId() !== null
      ) {
        result.push(object);
      }
    }

    return result;
  }

  public getSyncableObject(id: string): MultiplayerGameObject | null {
    for (const object of this.uiObjects) {
      if (
        object instanceof BaseMultiplayerGameObject &&
        object.getSyncableId() === id
      ) {
        return object;
      }
    }

    for (const object of this.sceneObjects) {
      if (
        object instanceof BaseMultiplayerGameObject &&
        object.getSyncableId() === id
      ) {
        return object;
      }
    }

    return null;
  }
}
