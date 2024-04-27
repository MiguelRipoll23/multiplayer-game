import { BaseGameObject } from "./base-game-object.js";
export class BaseCollidableGameObject extends BaseGameObject {
    objectHitbox = null;
    colliding = false;
    collidedObject = null;
    constructor() {
        super();
    }
    getHitbox() {
        return this.objectHitbox;
    }
    setHitbox(objectHitbox) {
        this.objectHitbox = objectHitbox;
    }
    setColliding(colliding) {
        this.colliding = colliding;
    }
    isColliding() {
        return this.colliding;
    }
    setCollidedObject(collidedObject) {
        this.collidedObject = collidedObject;
    }
    getCollidedObject() {
        return this.collidedObject;
    }
    render(context) {
        if (this.objectHitbox) {
            this.objectHitbox.render(context);
        }
    }
}
