import { BaseMultiplayerGameObject } from "./base-multiplayer-object.js";
export class BasePositionableGameObject extends BaseMultiplayerGameObject {
    x = 0;
    y = 0;
    angle = 0;
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
    getAngle() {
        return this.angle;
    }
    setAngle(angle) {
        this.angle = angle;
    }
}
