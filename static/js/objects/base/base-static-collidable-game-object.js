import { BaseGameObject } from "./base-game-object.js";
export class BaseStaticCollidableGameObject extends BaseGameObject {
    x = 0;
    y = 0;
    hitboxObjects;
    colliding = false;
    avodingCollision = false;
    collisionDirection = 0;
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
        this.getHitboxObjects().forEach((hitboxObject) => hitboxObject.setColliding(colliding));
    }
    isColliding() {
        return (this.getHitboxObjects().filter((hitboxObject) => hitboxObject.isColliding()).length > 0);
    }
    setCollidedObject(collidedObject) {
        this.collidedObject = collidedObject;
    }
    isAvoidingCollision() {
        return this.avodingCollision;
    }
    setAvoidingCollision(avodingCollision) {
        this.avodingCollision = avodingCollision;
    }
    getCollisionDirection() {
        return this.collisionDirection;
    }
    setCollisionDirection(collisionDirection) {
        this.collisionDirection = collisionDirection;
    }
    getCollidedObject() {
        return this.collidedObject;
    }
    setX(x) {
        this.x = x;
        this.getHitboxObjects().forEach((hitboxObject) => {
            hitboxObject.setX(x);
        });
    }
    getX() {
        return this.x;
    }
    setY(y) {
        this.y = y;
        this.getHitboxObjects().forEach((hitboxObject) => {
            hitboxObject.setY(y);
        });
    }
    getY() {
        return this.y;
    }
    render(context) {
        this.hitboxObjects.forEach((object) => object.render(context));
    }
}
