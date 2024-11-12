import { ObjectState } from "../../models/object-state.js";
export class BaseGameObject {
    loaded = false;
    state = ObjectState.Active;
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
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
    }
    setDebug(debug) {
        this.debug = debug;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
