import { BaseGameObject } from "./base-game-object.js";
export class BaseCollidableObject extends BaseGameObject {
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
}
