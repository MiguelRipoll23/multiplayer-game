import { BaseGameObject } from "../base/base-game-object.js";
export class HitboxObject extends BaseGameObject {
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    colliding = false;
    constructor(x, y, width, height) {
        super();
        this.setPosition(x, y);
        this.setSize(width, height);
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
        if (this.debug === false) {
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
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }
}
