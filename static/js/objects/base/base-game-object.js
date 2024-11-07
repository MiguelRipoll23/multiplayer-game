export class BaseGameObject {
    loaded = false;
    debug = false;
    syncable = false;
    syncableByHost = false;
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
    isSyncable() {
        return this.syncable;
    }
    isSyncableByHost() {
        return this.syncableByHost;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
