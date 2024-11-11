import { OBJECT_DATA_ID } from "../constants/webrtc-constants.js";
import { BaseMultiplayerScreen } from "../objects/base/base-multiplayer-screen.js";
export var SyncableState;
(function (SyncableState) {
    SyncableState[SyncableState["Active"] = 0] = "Active";
    SyncableState[SyncableState["Inactive"] = 1] = "Inactive";
})(SyncableState || (SyncableState = {}));
export var SyncableType;
(function (SyncableType) {
    SyncableType[SyncableType["Ball"] = 0] = "Ball";
})(SyncableType || (SyncableType = {}));
export class ObjectOrchestrator {
    gameController;
    webrtcService;
    gameFrame;
    gameMatch = null;
    constructor(gameController) {
        this.gameController = gameController;
        this.webrtcService = gameController.getWebRTCService();
        this.gameFrame = gameController.getGameFrame();
        this.gameMatch = gameController.getGameState().getGameMatch();
    }
    sendData(multiplayerScreen) {
        if (this.gameController.getGameState().getGameMatch()?.isHost() === false) {
            return;
        }
        multiplayerScreen.getSyncableObjects().forEach((object) => {
            this.sendObjectData(object);
        });
    }
    handleData(data) {
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
                return this.createOrSynchronize(screen, objectId, objectTypeId, objectData);
            case SyncableState.Inactive:
                return this.delete(screen, objectId);
            default:
                console.warn(`Invalid operation id ${operationId} for object ${objectId}`);
        }
    }
    createOrSynchronize(screen, objectId, objectTypeId, objectData) {
        const object = screen.getSyncableObject(objectId);
        if (object === null) {
            console.log(`Object not found with id ${objectId}, creating...`);
            return this.create(screen, objectTypeId, objectId, objectData);
        }
        //console.log("Synchronizing object...", object);
        object.synchronize(objectData);
    }
    create(screen, objectTypeId, objectId, objectData) {
        const syncableObject = screen.getSyncableObjectClass(objectTypeId);
        console.log("result", syncableObject);
        if (syncableObject === null) {
            return console.error(`Object class not found for type ${objectTypeId}`);
        }
        const instance = syncableObject.deserialize(objectId, objectData);
        console.log(`Created object ${objectId} of type ${objectTypeId}`);
    }
    synchronize(object, data) {
        object.synchronize(data);
    }
    delete(screen, objectId) {
        const object = screen.getSyncableObject(objectId);
        if (object === null) {
            return console.error(`Object not found with id ${objectId}`);
        }
        console.log(`Deleted object ${objectId}`);
        // TODO: delete object
    }
    sendObjectData(object) {
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
    getScreen() {
        const screen = this.gameFrame.getCurrentScreen();
        if (screen instanceof BaseMultiplayerScreen) {
            return screen;
        }
        return null;
    }
}
