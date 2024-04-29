import { BaseGameObject } from "./base-game-object.js";
export class BaseStaticCollidableGameObject extends BaseGameObject {
    crossable = false;
    x = 0;
    y = 0;
    hitboxObjects;
    collidingObjects;
    avodingCollision = false;
    constructor() {
        super();
        this.hitboxObjects = [];
        this.collidingObjects = [];
    }
    isCrossable() {
        return this.crossable;
    }
    isColliding() {
        return this.collidingObjects.some((collidingObject) => collidingObject.isCrossable() === false);
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
    getHitboxObjects() {
        return this.hitboxObjects;
    }
    setHitboxObjects(hitboxObjects) {
        this.hitboxObjects = hitboxObjects;
    }
    getCollidingObjects() {
        return this.collidingObjects;
    }
    addCollidingObject(collidingObject) {
        if (this.collidingObjects.includes(collidingObject) === false) {
            this.collidingObjects.push(collidingObject);
        }
    }
    removeCollidingObject(collidingObject) {
        this.collidingObjects = this.collidingObjects.filter((object) => object !== collidingObject);
    }
    isAvoidingCollision() {
        return this.avodingCollision;
    }
    setAvoidingCollision(avodingCollision) {
        this.avodingCollision = avodingCollision;
    }
    render(context) {
        this.hitboxObjects.forEach((object) => object.render(context));
    }
}
