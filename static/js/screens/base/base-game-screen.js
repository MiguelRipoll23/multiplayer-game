export class BaseGameScreen {
    opacity = 0;
    sceneObjects;
    uiObjects;
    loadedMessagePending = true;
    constructor() {
        console.log(`${this.constructor.name} created`);
        this.sceneObjects = [];
        this.uiObjects = [];
    }
    loadObjects() {
        this.sceneObjects.forEach((object) => object.load());
        this.uiObjects.forEach((object) => object.load());
    }
    hasLoaded() {
        return [...this.sceneObjects, ...this.uiObjects].every((object) => object.hasLoaded());
    }
    update(deltaTimeStamp) {
        this.logScreenLoadedMessageIfPending();
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
    logScreenLoadedMessageIfPending() {
        if (this.loadedMessagePending && this.hasLoaded()) {
            this.loadedMessagePending = false;
            console.log(`${this.constructor.name} loaded`);
        }
    }
    updateObjects(objects, deltaTimeStamp) {
        objects.forEach((object) => object.update(deltaTimeStamp));
    }
    renderObjects(objects, context) {
        objects.forEach((object) => object.render(context));
    }
}
