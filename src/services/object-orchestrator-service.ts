import { OBJECT_DATA_ID } from "../constants/webrtc-constants.js";
import { GameController } from "../models/game-controller.js";
import { GameFrame } from "../models/game-frame.js";
import { GameMatch } from "../models/game-match.js";
import { BaseMultiplayerScreen } from "../objects/base/base-multiplayer-screen.js";
import { MultiplayerGameObject } from "../objects/interfaces/multiplayer-game-object.js";
import { WebRTCService } from "./webrtc-service.js";

export enum SyncableState {
  Active,
  Inactive,
}

export enum SyncableType {
  Ball = 0,
}

export class ObjectOrchestrator {
  private webrtcService: WebRTCService;
  private gameFrame: GameFrame;
  private gameMatch: GameMatch | null = null;

  constructor(private gameController: GameController) {
    this.webrtcService = gameController.getWebRTCService();
    this.gameFrame = gameController.getGameFrame();
    this.gameMatch = gameController.getGameState().getGameMatch();
  }

  public sendData(multiplayerScreen: BaseMultiplayerScreen): void {
    if (this.gameController.getGameState().getGameMatch()?.isHost() === false) {
      return;
    }

    multiplayerScreen.getSyncableObjects().forEach((object) => {
      this.sendObjectData(object);
    });
  }

  public handleData(data: Uint8Array | null): void {
    if (data === null || data.length < 38) {
      return console.warn("Invalid data received for object synchronization");
    }

    const screen = this.getScreen();

    if (screen === null) {
      return;
    }

    const operationId = data[0]; // 0: create/sync, 1: delete
    const objectTypeId = data[1];
    const objectId = new TextDecoder().decode(data.slice(2, 38));
    const objectData = data.slice(38);

    switch (operationId) {
      case SyncableState.Active:
        return this.createOrSynchronize(
          screen,
          objectId,
          objectTypeId,
          objectData
        );

      case SyncableState.Inactive:
        return this.delete(screen, objectId);

      default:
        console.warn(
          `Invalid operation id ${operationId} for object ${objectId}`
        );
    }
  }

  private createOrSynchronize(
    screen: BaseMultiplayerScreen,
    objectId: string,
    objectTypeId: number,
    objectData: Uint8Array
  ): void {
    const object = screen.getSyncableObject(objectId);

    if (object === null) {
      console.log(`Object not found with id ${objectId}, creating...`);
      return this.create(screen, objectTypeId, objectId, objectData);
    }

    //console.log("Synchronizing object...", object);
    object.synchronize(objectData);
  }

  private create(
    screen: BaseMultiplayerScreen,
    objectTypeId: number,
    objectId: string,
    objectData: Uint8Array
  ): void {
    const syncableObject = screen.getSyncableObjectClass(objectTypeId);
    console.log("result", syncableObject);

    if (syncableObject === null) {
      return console.error(`Object class not found for type ${objectTypeId}`);
    }

    const instance = syncableObject.deserialize(objectId, objectData);
    console.log(`Created object ${objectId} of type ${objectTypeId}`);
  }

  private synchronize(object: any, data: Uint8Array): void {
    object.synchronize(data);
  }

  private delete(screen: BaseMultiplayerScreen, objectId: string): void {
    const object = screen.getSyncableObject(objectId);

    if (object === null) {
      return console.error(`Object not found with id ${objectId}`);
    }

    console.log(`Deleted object ${objectId}`);
    // TODO: delete object
  }

  private sendObjectData(object: MultiplayerGameObject): void {
    if (object.isSyncableByHost() && this.gameMatch?.isHost() === false) {
      return;
    }

    const operationId = 0;
    const syncableTypeId = object.getSyncableTypeId();
    const syncableId = object.getSyncableId();
    const objectData = object.serialize();

    if (syncableTypeId === null || syncableId === null) {
      return;
    }

    const data = new Uint8Array([
      OBJECT_DATA_ID,
      operationId,
      syncableTypeId,
      ...new TextEncoder().encode(syncableId),
      ...objectData,
    ]);

    this.webrtcService.getPeers().forEach((peer) => {
      if (peer.hasJoined() === false) {
        return;
      }

      peer.sendReliableOrderedMessage(data);

      // convert to text for logging
      //const textData = new TextDecoder().decode(data);
      //console.log("Sending object data", textData);
      //this.alreadySent = true;
    });
  }

  private getScreen(): BaseMultiplayerScreen | null {
    const screen = this.gameFrame.getCurrentScreen();

    if (screen instanceof BaseMultiplayerScreen) {
      return screen;
    }

    return null;
  }
}
