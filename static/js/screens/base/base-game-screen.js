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
    update(deltaTimeStamp) {
        this.updateObjects(this.sceneObjects, deltaTimeStamp);
        this.updateObjects(this.uiObjects, deltaTimeStamp);
        this.handlePointerEvent();
    }
    render(context) {
        context.globalAlpha = this.opacity;
        this.renderObjects(this.sceneObjects, context);
        this.renderObjects(this.uiObjects, context);
        context.globalAlpha = 1;
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
    setDebugToChildObjects() {
        const debug = this.gameController.isDebugging();
        this.sceneObjects.forEach((object) => object.setDebug(debug));
        this.uiObjects.forEach((object) => object.setDebug(debug));
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
