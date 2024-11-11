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

  public addSyncableObject(
    objectInstance: MultiplayerGameObject,
    objectClass: StaticMultiplayerGameObject
  ): void {
    const typeId = objectInstance.getObjectTypeId();

    if (typeId === null) {
      throw new Error("Object type ID is not set");
    }

    this.syncableObjectTypes.set(typeId, objectClass);
  }

  public getSyncableObjectClass(
    typeId: number
  ): StaticMultiplayerGameObject | null {
    return this.syncableObjectTypes.get(typeId) ?? null;
  }

  public getSyncableObjects(): MultiplayerGameObject[] {
    return [...this.uiObjects, ...this.sceneObjects]
      .filter((object) => object instanceof BaseMultiplayerGameObject)
      .filter(
        (object) => object.getSyncableId() !== null
      ) as MultiplayerGameObject[];
  }

  public getSyncableObject(id: string): MultiplayerGameObject | null {
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
