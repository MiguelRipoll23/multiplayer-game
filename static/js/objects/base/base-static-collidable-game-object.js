import { BasePositionableGameObject } from "./base-positionable-game-object.js";
export class BaseStaticCollidableGameObject extends BasePositionableGameObject {
    rigidBody = true;
    hitboxObjects;
    collidingObjects;
    avoidingCollision = false;
    constructor() {
        super();
        this.hitboxObjects = [];
        this.collidingObjects = [];
    }
    load() {
        this.getHitboxObjects().forEach((object) => object.setDebug(this.debug));
        super.load();
    }
    hasRigidBody() {
        return this.rigidBody;
    }
    isColliding() {
        return this.collidingObjects.some((collidingObject) => collidingObject.hasRigidBody());
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
        return this.avoidingCollision;
    }
    setAvoidingCollision(avoidingCollision) {
        this.avoidingCollision = avoidingCollision;
    }
    render(context) {
        this.hitboxObjects.forEach((object) => object.render(context));
    }
}
