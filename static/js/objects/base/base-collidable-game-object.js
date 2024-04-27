import { BaseGameObject } from "./base-game-object.js";
export class BaseStaticCollidableGameObject extends BaseGameObject {
    x = 0;
    y = 0;
    hitboxObjects;
    colliding = false;
    collidedObject = null;
    constructor() {
        super();
        this.hitboxObjects = [];
    }
    getHitboxObjects() {
        return this.hitboxObjects;
    }
    setHitboxObjects(hitboxObjects) {
        this.hitboxObjects = hitboxObjects;
    }
    setColliding(colliding) {
        this.getHitboxObjects().forEach((object) => object.setColliding(colliding));
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
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    render(context) {
        this.hitboxObjects.forEach((object) => object.render(context));
    }
}
