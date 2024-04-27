import { BaseStaticCollidableGameObject } from "./base-static-collidable-game-object.js";
export class BaseDynamicCollidableGameObject extends BaseStaticCollidableGameObject {
    vx = 0;
    vy = 0;
    mass = 0;
    constructor() {
        super();
    }
    getVX() {
        return this.vx;
    }
    setVX(vx) {
        this.vx = vx;
    }
    getVY() {
        return this.vy;
    }
    setVY(vy) {
        this.vy = vy;
    }
    getMass() {
        return this.mass;
    }
}
