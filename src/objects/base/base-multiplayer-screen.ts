import { BaseGameScreen } from "../../screens/base/base-game-screen.js";
import { ObjectUtils } from "../../utils/object-utils.js";
import {
  MultiplayerGameObject,
  StaticMultiplayerGameObject,
} from "../interfaces/multiplayer-game-object.js";
import { BaseMultiplayerGameObject } from "./base-multiplayer-object.js";

export class BaseMultiplayerScreen extends BaseGameScreen {
  protected syncableObjectTypes: Map<number, StaticMultiplayerGameObject> =
    new Map();

  public async addSyncableObjectClass(
    syncableObjectClass: StaticMultiplayerGameObject
  ): Promise<void> {
    const className = syncableObjectClass.name;
    const typeId = await ObjectUtils.getSyncableTypeId(className);

    this.syncableObjectTypes.set(typeId, syncableObjectClass);
  }

  public getSyncableObjectClass(
    typeId: number
  ): StaticMultiplayerGameObject | null {
    return this.syncableObjectTypes.get(typeId) ?? null;
  }

  public getSyncableObjects(): MultiplayerGameObject[] {
    return [...this.uiObjects, ...this.sceneObjects].filter(
      (object) => object instanceof BaseMultiplayerGameObject
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
