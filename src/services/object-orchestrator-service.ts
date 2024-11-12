import { OBJECT_DATA_ID } from "../constants/webrtc-constants.js";
import { GameController } from "../models/game-controller.js";
import { GameFrame } from "../models/game-frame.js";
import { BaseMultiplayerScreen } from "../screens/base/base-multiplayer-screen.js";
import { MultiplayerGameObject } from "../objects/interfaces/multiplayer-game-object.js";
import { WebRTCService } from "./webrtc-service.js";
import { GameState } from "../models/game-state.js";
import { ObjectState } from "../models/object-state.js";

export class ObjectOrchestrator {
  private webrtcService: WebRTCService;
  private gameFrame: GameFrame;
  private gameState: GameState;

  constructor(private gameController: GameController) {
    this.webrtcService = gameController.getWebRTCService();
    this.gameFrame = gameController.getGameFrame();
    this.gameState = gameController.getGameState();
  }

  public sendLocalData(multiplayerScreen: BaseMultiplayerScreen): void {
    if (this.gameState.getGameMatch() === null) {
      return;
    }

    multiplayerScreen.getSyncableObjects().forEach((object) => {
      if (this.skipSyncableObject(object)) {
        return;
      }

      this.sendObjectData(object);
    });
  }

  public handleRemoteData(data: ArrayBuffer | null): void {
    if (!data || data.byteLength < 38) {
      console.warn("Invalid data received for object synchronization");
      return;
    }

    const multiplayerScreen = this.getMultiplayerScreen();

    if (multiplayerScreen === null) {
      return;
    }

    const dataView = new DataView(data);
    const objectStateId = dataView.getUint8(0);
    const objectTypeId = dataView.getUint8(1);
    const syncableId = new TextDecoder().decode(data.slice(2, 38));
    const syncableCustomData = data.slice(38);

    if (objectStateId === ObjectState.Active) {
      this.createOrSynchronize(
        multiplayerScreen,
        syncableId,
        objectTypeId,
        syncableCustomData
      );
    } else {
      this.delete(multiplayerScreen, syncableId);
    }
  }

  private skipSyncableObject(
    multiplayerObject: MultiplayerGameObject
  ): boolean {
    const gameMatch = this.gameState.getGameMatch();

    if (multiplayerObject.isSyncableByHost()) {
      return gameMatch?.isHost() ? false : true;
    }

    return false;
  }

  private createOrSynchronize(
    multiplayerScreen: BaseMultiplayerScreen,
    syncableId: string,
    objectTypeId: number,
    syncableCustomData: ArrayBuffer
  ): void {
    const object = multiplayerScreen.getSyncableObject(syncableId);

    if (object === null) {
      this.create(
        multiplayerScreen,
        objectTypeId,
        syncableId,
        syncableCustomData
      );
    } else {
      object.synchronize(syncableCustomData);
    }
  }

  private create(
    multiplayerScreen: BaseMultiplayerScreen,
    objectTypeId: number,
    syncableId: string,
    syncableCustomData: ArrayBuffer
  ): void {
    const syncableObjectClass =
      multiplayerScreen.getSyncableObjectClass(objectTypeId);

    if (syncableObjectClass === null) {
      return console.warn(`Syncable class not found for type ${objectTypeId}`);
    }

    const instance = syncableObjectClass.deserialize(
      syncableId,
      syncableCustomData
    );

    multiplayerScreen?.addSceneObject(instance);
    console.log("Created object", instance);
  }

  private delete(
    multiplayerScreen: BaseMultiplayerScreen,
    syncableId: string
  ): void {
    const object = multiplayerScreen.getSyncableObject(syncableId);
    if (!object) {
      console.error(`Object not found with id ${syncableId}`);
      return;
    }

    // TODO: delete object from the screen if necessary
    console.log(`Deleted object ${syncableId}`);
  }

  private sendObjectData(multiplayerObject: MultiplayerGameObject): void {
    const dataBuffer = this.createObjectDataBuffer(multiplayerObject);

    if (dataBuffer === null) {
      return;
    }

    this.webrtcService.getPeers().forEach((peer) => {
      if (peer.hasJoined()) {
        multiplayerObject.sendSyncableData(peer, dataBuffer);
      }
    });
  }

  private createObjectDataBuffer(
    multiplayerObject: MultiplayerGameObject
  ): ArrayBuffer | null {
    const objectTypeId = multiplayerObject.getObjectTypeId();
    const syncableId = multiplayerObject.getSyncableId();
    const syncableCustomData = multiplayerObject.serialize();

    if (objectTypeId === null || syncableId === null) {
      console.error("Invalid syncable object data");
      return null;
    }

    const arrayBuffer = new ArrayBuffer(3 + 36 + syncableCustomData.byteLength);
    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(0, OBJECT_DATA_ID);
    dataView.setUint8(1, ObjectState.Active);
    dataView.setUint8(2, objectTypeId);

    const syncableIdBytes = new TextEncoder().encode(syncableId);

    new Uint8Array(arrayBuffer, 3, syncableIdBytes.length).set(syncableIdBytes);
    new Uint8Array(arrayBuffer, 39, syncableCustomData.byteLength).set(
      new Uint8Array(syncableCustomData)
    );

    return arrayBuffer;
  }

  private getMultiplayerScreen(): BaseMultiplayerScreen | null {
    const screen = this.gameFrame.getCurrentScreen();
    return screen instanceof BaseMultiplayerScreen ? screen : null;
  }
}
