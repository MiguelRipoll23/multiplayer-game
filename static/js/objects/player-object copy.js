import { PlayerObject } from "./player-object.js";
export class LocalPlayerObject extends PlayerObject {
    name;
    constructor(name) {
        super();
        this.name = name;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
