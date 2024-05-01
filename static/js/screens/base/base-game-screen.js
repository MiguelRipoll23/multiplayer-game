export class BaseGameScreen {
    canvas;
    opacity = 0;
    sceneObjects;
    uiObjects;
    objectsLoadingPending = true;
    constructor(gameLoop) {
        console.log(`${this.constructor.name} created`);
        this.canvas = gameLoop.getCanvas();
        this.sceneObjects = [];
        this.uiObjects = [];
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
