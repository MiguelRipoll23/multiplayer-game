import { BaseGameObject } from "./base/base-game-object.js";
export class HitboxObject extends BaseGameObject {
    DEBUG_MODE = false;
    x;
    y;
    width;
    height;
    colliding = false;
    constructor(x, y, width, height) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    setX(x) {
        this.x = x;
    }
    getX() {
        return this.x;
    }
    setY(y) {
        this.y = y;
    }
    getY() {
        return this.y;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    isColliding() {
        return this.colliding;
    }
    setColliding(colliding) {
        this.colliding = colliding;
    }
    render(context) {
        if (this.DEBUG_MODE === false) {
            return;
        }
        context.save();
        context.strokeStyle = "rgba(148, 0, 211, 0.2)";
        context.strokeRect(this.x, this.y, this.width, this.height);
        if (this.colliding) {
            // Fill with transparent purple
            context.fillStyle = "rgba(148, 0, 211, 0.5)"; // Adjust alpha value for transparency
            context.fillRect(this.x, this.y, this.width, this.height);
        }
        context.restore();
    }
}
