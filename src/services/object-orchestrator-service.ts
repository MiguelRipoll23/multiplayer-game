import { OBJECT_DATA_ID } from "../constants/webrtc-constants.js";
import { GameController } from "../models/game-controller.js";
import { GameFrame } from "../models/game-frame.js";
import { BaseMultiplayerScreen } from "../screens/base/base-multiplayer-screen.js";
import { MultiplayerGameObject } from "../objects/interfaces/multiplayer-game-object.js";
import { WebRTCService } from "./webrtc-service.js";
import { GameState } from "../models/game-state.js";
import { ObjectState } from "../models/object-state.js";
import { BaseMultiplayerGameObject } from "../objects/base/base-multiplayer-object.js";
import { ObjectLayer } from "../models/object-layer.js";
import { ObjectType } from "../models/object-type.js";
import { WebRTCPeer } from "./interfaces/webrtc-peer.js";

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

  public handleRemoteData(
    webrtcPeer: WebRTCPeer,
    data: ArrayBuffer | null
  ): void {
    if (data === null || data.byteLength < 39) {
      return console.warn("Invalid data received for object synchronization");
    }

    const multiplayerScreen = this.getMultiplayerScreen();

    if (multiplayerScreen === null) {
      return;
    }

    const dataView = new DataView(data);
    const objectLayer = dataView.getUint8(0);
    const objectStateId = dataView.getUint8(1);
    const objectTypeId = dataView.getUint8(2);
    const syncableId = new TextDecoder().decode(data.slice(3, 39));
    const syncableCustomData = data.slice(39);

    switch (objectStateId) {
      case ObjectState.Active:
        return this.createOrSynchronize(
          webrtcPeer,
          multiplayerScreen,
          objectLayer,
          syncableId,
          objectTypeId,
          syncableCustomData
        );

      case ObjectState.Inactive:
        return this.delete(multiplayerScreen, syncableId);
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
    webrtcPeer: WebRTCPeer,
    multiplayerScreen: BaseMultiplayerScreen,
    objectLayer: number,
    syncableId: string,
    objectTypeId: number,
    syncableCustomData: ArrayBuffer
  ): void {
    const multiplayerObject = multiplayerScreen.getSyncableObject(syncableId);

    if (multiplayerObject === null) {
      return this.create(
        webrtcPeer,
        multiplayerScreen,
        objectLayer,
        objectTypeId,
        syncableId,
        syncableCustomData
      );
    }

    if (this.isInvalidOwner(webrtcPeer, multiplayerObject)) {
      return console.warn("Invalid owner for object", multiplayerObject);
    }

    multiplayerObject.synchronize(syncableCustomData);
  }

  private create(
    webrtcPeer: WebRTCPeer,
    multiplayerScreen: BaseMultiplayerScreen,
    objectLayer: ObjectLayer,
    objectTypeId: ObjectType,
    syncableId: string,
    syncableCustomData: ArrayBuffer
  ): void {
    const syncableObjectClass =
      multiplayerScreen.getSyncableObjectClass(objectTypeId);

    if (syncableObjectClass === null) {
      return console.warn(`Syncable class not found for type ${objectTypeId}`);
    }

    let instance: MultiplayerGameObject;

    try {
      instance = syncableObjectClass.deserialize(
        syncableId,
        syncableCustomData
      );
    } catch (error) {
      return console.warn(
        "Cannot deserialize object with id",
        syncableId,
        error
      );
    }

    instance.setOwner(webrtcPeer.getPlayer());
    multiplayerScreen?.addObjectToLayer(objectLayer, instance);

    console.log(
      `Created syncable object for layer id ${objectLayer}`,
      instance
    );
  }

  private isInvalidOwner(
    webrtcPeer: WebRTCPeer,
    multiplayerObject: BaseMultiplayerGameObject
  ): boolean {
    if (multiplayerObject.getOwner() === null) {
      return false;
    }

    return webrtcPeer.getPlayer() !== multiplayerObject.getOwner();
  }

  private delete(
    multiplayerScreen: BaseMultiplayerScreen,
    syncableId: string
  ): void {
    const object = multiplayerScreen.getSyncableObject(syncableId);

    if (object === null) {
      return console.warn(`Object not found with id ${syncableId}`);
    }

    object.setState(ObjectState.Inactive);
  }

  private sendObjectData(multiplayerObject: BaseMultiplayerGameObject): void {
    const objectLayer =
      this.getMultiplayerScreen()?.getObjectLayer(multiplayerObject) ?? null;

    if (objectLayer === null) {
      return console.warn(
        "Object layer id not found for object",
        multiplayerObject
      );
    }

    const dataBuffer = this.createObjectDataBuffer(
      objectLayer,
      multiplayerObject
    );

    if (dataBuffer === null) {
      return;
    }

    this.webrtcService.getPeers().forEach((peer) => {
      if (this.skipWebRTCPeer(peer, multiplayerObject)) {
        return;
      }

      multiplayerObject.sendSyncableData(peer, dataBuffer);
    });
  }

  private skipWebRTCPeer(
    webrtcPeer: WebRTCPeer,
    multiplayerObject: BaseMultiplayerGameObject
  ): boolean {
    if (webrtcPeer.hasJoined() === false) {
      return true;
    }

    if (webrtcPeer.getPlayer() === multiplayerObject.getOwner()) {
      return true;
    }

    return false;
  }

  private createObjectDataBuffer(
    objectLayer: ObjectLayer,
    multiplayerObject: BaseMultiplayerGameObject
  ): ArrayBuffer | null {
    const objectTypeId = multiplayerObject.getObjectTypeId();
    const syncableId = multiplayerObject.getSyncableId();
    const syncableCustomData = multiplayerObject.serialize();

    if (objectTypeId === null || syncableId === null) {
      console.error("Invalid syncable object data");
      return null;
    }

    const arrayBuffer = new ArrayBuffer(4 + 36 + syncableCustomData.byteLength);
    const dataView = new DataView(arrayBuffer);

    dataView.setUint8(0, OBJECT_DATA_ID);
    dataView.setUint8(1, objectLayer);
    dataView.setUint8(2, ObjectState.Active);
    dataView.setUint8(3, objectTypeId);

    const syncableIdBytes = new TextEncoder().encode(syncableId);
    new Uint8Array(arrayBuffer, 4, syncableIdBytes.length).set(syncableIdBytes);

    new Uint8Array(arrayBuffer, 40, syncableCustomData.byteLength).set(
      new Uint8Array(syncableCustomData)
    );

    return arrayBuffer;
  }

  private getMultiplayerScreen(): BaseMultiplayerScreen | null {
    const screen = this.gameFrame.getCurrentScreen();
    return screen instanceof BaseMultiplayerScreen ? screen : null;
  }
}
