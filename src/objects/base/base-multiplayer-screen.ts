import { BaseGameScreen } from "../../screens/base/base-game-screen.js";
import { SyncableType } from "../../services/object-orchestrator-service.js";
import {
  MultiplayerGameObject,
  StaticMultiplayerGameObject,
} from "../interfaces/multiplayer-game-object.js";
import { BaseMultiplayerGameObject } from "./base-multiplayer-object.js";

export class BaseMultiplayerScreen extends BaseGameScreen {
  protected syncableObjectTypes: Map<
    SyncableType,
    StaticMultiplayerGameObject
  > = new Map();

  public addSyncableObject(
    objectInstance: MultiplayerGameObject,
    objectClass: StaticMultiplayerGameObject
  ): void {
    const typeId = objectInstance.getSyncableTypeId();

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
