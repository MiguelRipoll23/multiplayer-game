export class BaseGameObject {
    loaded = false;
    constructor() {
        console.log(`${this.constructor.name} created`);
    }
    load() {
        console.log(`${this.constructor.name} loaded`);
        this.loaded = true;
    }
    hasLoaded() {
        return this.loaded;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
