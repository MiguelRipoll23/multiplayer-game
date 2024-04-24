export class BaseGameObject {
    loaded = false;
    load() {
        console.log(`Object ${this.constructor.name} loaded`);
        this.loaded = true;
    }
    hasLoaded() {
        return this.loaded;
    }
}
