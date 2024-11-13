import { ObjectLayer } from "../../models/object-layer.js";
import { ObjectState } from "../../models/object-state.js";
import { BasePressableGameObject } from "../../objects/base/base-pressable-game-object.js";
export class BaseGameScreen {
    gameController;
    canvas;
    screenManagerService = null;
    loaded = false;
    opacity = 0;
    sceneObjects = [];
    uiObjects = [];
    gamePointer;
    constructor(gameController) {
        this.gameController = gameController;
        console.log(`${this.constructor.name} created`);
        this.canvas = gameController.getCanvas();
        this.gamePointer = gameController.getGamePointer();
    }
    isActive() {
        return this.opacity > 0;
    }
    setScreenManagerService(screenManagerService) {
        this.screenManagerService = screenManagerService;
    }
    loadObjects() {
        this.setDebugToChildObjects();
        this.sceneObjects.forEach((object) => object.load());
        this.uiObjects.forEach((object) => object.load());
        console.log(`${this.constructor.name} loaded`);
        this.loaded = true;
    }
    hasLoaded() {
        return this.loaded;
    }
    getOpacity() {
        return this.opacity;
    }
    setOpacity(opacity) {
        this.opacity = opacity;
    }
    hasTransitionFinished() {
        console.log(`Transition to ${this.constructor.name} finished`);
    }
    getTotalObjectsCount() {
        return this.sceneObjects.length + this.uiObjects.length;
    }
    getLoadedObjectsCount() {
        return (this.sceneObjects.filter((object) => object.hasLoaded()).length +
            this.uiObjects.filter((object) => object.hasLoaded()).length);
    }
    getObjectLayer(object) {
        if (this.sceneObjects.includes(object)) {
            return ObjectLayer.Scene;
        }
        if (this.uiObjects.includes(object)) {
            return ObjectLayer.UI;
        }
        throw new Error("Object not found in any layer");
    }
    addObjectToLayer(layerId, object) {
        object.setDebug(this.gameController.isDebugging());
        object.load();
        switch (layerId) {
            case ObjectLayer.UI:
                this.uiObjects.push(object);
                break;
            case ObjectLayer.Scene:
                this.sceneObjects.push(object);
                break;
            default:
                console.warn(`Unknown layer id ${layerId} for object`, object);
        }
    }
    update(deltaTimeStamp) {
        this.updateObjects(this.sceneObjects, deltaTimeStamp);
        this.updateObjects(this.uiObjects, deltaTimeStamp);
        this.uiObjects.forEach((object) => {
            this.removeObjectIfInactive(this.uiObjects, object);
        });
        this.sceneObjects.forEach((object) => {
            this.removeObjectIfInactive(this.sceneObjects, object);
        });
        this.handlePointerEvent();
    }
    render(context) {
        context.globalAlpha = this.opacity;
        this.renderObjects(this.sceneObjects, context);
        this.renderObjects(this.uiObjects, context);
        context.globalAlpha = 1;
    }
    setDebugToChildObjects() {
        const debug = this.gameController.isDebugging();
        this.sceneObjects.forEach((object) => object.setDebug(debug));
        this.uiObjects.forEach((object) => object.setDebug(debug));
    }
    removeObjectIfInactive(layer, object) {
        if (object.getState() === ObjectState.Inactive) {
            const index = layer.indexOf(object);
            layer.splice(index, 1);
        }
    }
    handlePointerEvent() {
        const pressableObjects = this.uiObjects
            .filter((object) => object instanceof BasePressableGameObject)
            .filter((object) => object.isActive())
            .reverse();
        for (const pressableObject of pressableObjects) {
            pressableObject.handlePointerEvent(this.gamePointer);
            if (pressableObject.isHovering() || pressableObject.isPressed()) {
                break;
            }
        }
        this.gamePointer.setPressed(false);
    }
    updateObjects(objects, deltaTimeStamp) {
        objects.forEach((object) => {
            if (object.hasLoaded()) {
                object.update(deltaTimeStamp);
            }
        });
    }
    renderObjects(objects, context) {
        objects.forEach((object) => {
            if (object.hasLoaded()) {
                object.render(context);
            }
        });
    }
}
