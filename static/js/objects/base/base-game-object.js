export class BaseGameObject {
    loaded = false;
    debug = false;
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
    setDebug(debug) {
        this.debug = debug;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
