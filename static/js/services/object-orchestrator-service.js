import { OBJECT_DATA_ID } from "../constants/webrtc-constants.js";
import { BaseMultiplayerScreen } from "../objects/base/base-multiplayer-screen.js";
export class ObjectOrchestrator {
    gameController;
    webrtcService;
    gameFrame;
    alreadySent = false;
    constructor(gameController) {
        this.gameController = gameController;
        this.webrtcService = gameController.getWebRTCService();
        this.gameFrame = gameController.getGameFrame();
    }
    sendData() {
        const screen = this.getScreen();
        if (screen === null) {
            return;
        }
        if (this.alreadySent === true) {
            return;
        }
        if (this.gameController.getGameState().getGameMatch()?.isHost() === false) {
            return;
        }
        screen.getSyncableObjects().forEach((object) => {
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
        const objectId = new TextDecoder().decode(data.slice(1, 37));
        const objectTypeId = data[37];
        const objectData = data.slice(38);
        switch (operationId) {
            case 0:
                return this.createOrSynchronize(screen, objectId, objectTypeId, objectData);
            case 1:
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
        console.log("Synchronizing object...", object);
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
        const operationId = 0;
        const syncableId = object.getSyncableId();
        const syncableTypeId = object.getSyncableType();
        const objectData = object.serialize();
        const data = new Uint8Array([
            OBJECT_DATA_ID,
            operationId,
            ...new TextEncoder().encode(syncableId),
            syncableTypeId,
            ...objectData,
        ]);
        this.webrtcService.getPeers().forEach((peer) => {
            peer.sendReliableOrderedMessage(data);
            // convert to text for logging
            const textData = new TextDecoder().decode(data);
            console.log("Sending object data", textData);
            this.alreadySent = true;
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
