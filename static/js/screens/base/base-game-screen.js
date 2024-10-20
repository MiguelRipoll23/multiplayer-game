import { PressableBaseGameObject } from "../../objects/base/pressable-game-object.js";
export class BaseGameScreen {
    canvas;
    screenManagerService = null;
    opacity = 0;
    sceneObjects;
    uiObjects;
    pressableGameObject = null;
    objectsLoadingPending = true;
    constructor(gameController) {
        console.log(`${this.constructor.name} created`);
        this.canvas = gameController.getCanvas();
        this.sceneObjects = [];
        this.uiObjects = [];
        this.addPointerEventListeners();
    }
    isActive() {
        return this.opacity > 0;
    }
    setScreenManagerService(screenManagerService) {
        this.screenManagerService = screenManagerService;
    }
    loadObjects() {
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
    addPointerEventListeners() {
        console.log(`${this.constructor.name} added pointer event listeners`);
        this.canvas.addEventListener("touchend", (event) => {
            if (this.opacity < 1) {
                return;
            }
            console.log(`${this.constructor.name} touchend event`);
            this.uiObjects
                .filter((object) => object instanceof PressableBaseGameObject)
                .filter((object) => object.isActive())
                .forEach((object) => object.handleTouchEnd(event));
        });
        this.canvas.addEventListener("mouseup", (event) => {
            if (this.opacity < 1) {
                return;
            }
            console.log(`${this.constructor.name} mouseup event`);
            this.uiObjects
                .filter((object) => object instanceof PressableBaseGameObject)
                .filter((object) => object.isActive())
                .reverse()
                .forEach((object) => {
                object.handleMouseUp(event);
                if (object.isPressed()) {
                    return;
                }
            });
        });
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
