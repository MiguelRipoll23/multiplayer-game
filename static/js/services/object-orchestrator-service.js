import { OBJECT_DATA_ID } from "../constants/webrtc-constants.js";
import { BaseMultiplayerScreen } from "../screens/base/base-multiplayer-screen.js";
import { ObjectState } from "../models/object-state.js";
export class ObjectOrchestrator {
    gameController;
    webrtcService;
    gameFrame;
    gameState;
    constructor(gameController) {
        this.gameController = gameController;
        this.webrtcService = gameController.getWebRTCService();
        this.gameFrame = gameController.getGameFrame();
        this.gameState = gameController.getGameState();
    }
    sendLocalData(multiplayerScreen) {
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
    handleRemoteData(data) {
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
            this.createOrSynchronize(multiplayerScreen, syncableId, objectTypeId, syncableCustomData);
        }
        else {
            this.delete(multiplayerScreen, syncableId);
        }
    }
    skipSyncableObject(multiplayerObject) {
        const gameMatch = this.gameState.getGameMatch();
        if (multiplayerObject.isSyncableByHost()) {
            return gameMatch?.isHost() ? false : true;
        }
        return false;
    }
    createOrSynchronize(multiplayerScreen, syncableId, objectTypeId, syncableCustomData) {
        const object = multiplayerScreen.getSyncableObject(syncableId);
        if (object === null) {
            this.create(multiplayerScreen, objectTypeId, syncableId, syncableCustomData);
        }
        else {
            object.synchronize(syncableCustomData);
        }
    }
    create(multiplayerScreen, objectTypeId, syncableId, syncableCustomData) {
        const syncableObjectClass = multiplayerScreen.getSyncableObjectClass(objectTypeId);
        if (syncableObjectClass === null) {
            return console.warn(`Syncable class not found for type ${objectTypeId}`);
        }
        const instance = syncableObjectClass.deserialize(syncableId, syncableCustomData);
        multiplayerScreen?.addSceneObject(instance);
        console.log("Created object", instance);
    }
    delete(multiplayerScreen, syncableId) {
        const object = multiplayerScreen.getSyncableObject(syncableId);
        if (!object) {
            console.error(`Object not found with id ${syncableId}`);
            return;
        }
        // TODO: delete object from the screen if necessary
        console.log(`Deleted object ${syncableId}`);
    }
    sendObjectData(multiplayerObject) {
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
    createObjectDataBuffer(multiplayerObject) {
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
        new Uint8Array(arrayBuffer, 39, syncableCustomData.byteLength).set(new Uint8Array(syncableCustomData));
        return arrayBuffer;
    }
    getMultiplayerScreen() {
        const screen = this.gameFrame.getCurrentScreen();
        return screen instanceof BaseMultiplayerScreen ? screen : null;
    }
}
