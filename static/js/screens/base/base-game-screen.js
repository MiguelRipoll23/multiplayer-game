export class BaseGameScreen {
    canvas;
    opacity = 0;
    sceneObjects;
    uiObjects;
    loading = true;
    constructor(canvas) {
        console.log(`${this.constructor.name} created`);
        this.canvas = canvas;
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
        this.checkIfScreenHasLoaded();
        this.updateObjects(this.sceneObjects, deltaTimeStamp);
        this.updateObjects(this.uiObjects, deltaTimeStamp);
    }
    render(context) {
        this.renderObjects(this.sceneObjects, context);
        this.renderObjects(this.uiObjects, context);
    }
    getOpacity() {
        return this.opacity;
    }
    setOpacity(opacity) {
        this.opacity = opacity;
    }
    checkIfScreenHasLoaded() {
        if (this.loading && this.hasLoaded()) {
            this.loading = false;
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
