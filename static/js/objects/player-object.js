import { BaseGameObject } from "./base/base-game-object.js";
export class PlayerObject extends BaseGameObject {
    name;
    constructor(name) {
        super();
        this.name = name;
    }
    getName() {
        return this.name;
    }
    update(deltaTimeStamp) { }
    render(context) { }
}
