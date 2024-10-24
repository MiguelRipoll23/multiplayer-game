import { BaseGameObject } from "./base-game-object.js";
export class BaseMoveableGameObject extends BaseGameObject {
    x = 0;
    y = 0;
    constructor() {
        super();
    }
    getX() {
        return this.x;
    }
    setX(x) {
        this.x = x;
    }
    getY() {
        return this.y;
    }
    setY(y) {
        this.y = y;
    }
}
