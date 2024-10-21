import { PressableBaseGameObject } from "../../objects/base/pressable-game-object.js";
export class BaseGameScreen {
    gameController;
    canvas;
    screenManagerService = null;
    opacity = 0;
    sceneObjects;
    uiObjects;
    gamePointer;
    objectsLoadingPending = true;
    constructor(gameController) {
        this.gameController = gameController;
        console.log(`${this.constructor.name} created`);
        this.canvas = gameController.getCanvas();
        this.gamePointer = gameController.getGamePointer();
        this.sceneObjects = [];
        this.uiObjects = [];
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
        this.objectsLoadingPending = false;
    }
    hasLoaded() {
        if (this.objectsLoadingPending) {
            return false;
        }
        return [...this.sceneObjects, ...this.uiObjects].every((object) => object.hasLoaded());
    }
    update(deltaTimeStamp) {
        this.checkIfScreenHasLoaded();
        this.updateObjects(this.sceneObjects, deltaTimeStamp);
        this.updateObjects(this.uiObjects, deltaTimeStamp);
        if (this.gamePointer.isPressed()) {
            this.handlePointerPressEvent();
        }
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
    checkIfScreenHasLoaded() {
        if (this.objectsLoadingPending && this.hasLoaded()) {
            this.objectsLoadingPending = false;
            console.log(`${this.constructor.name} loaded`);
        }
    }
    setDebugToChildObjects() {
        const debug = this.gameController.isDebugging();
        this.sceneObjects.forEach((object) => object.setDebug(debug));
        this.uiObjects.forEach((object) => object.setDebug(debug));
    }
    handlePointerPressEvent() {
        const pressableObjects = this.uiObjects
            .filter((object) => object instanceof PressableBaseGameObject)
            .filter((object) => object.isActive())
            .reverse();
        for (const pressableObject of pressableObjects) {
            pressableObject.handlePointerEvent(this.gamePointer);
            if (pressableObject.isPressed()) {
                console.log(pressableObject.constructor.name + " pressed");
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
