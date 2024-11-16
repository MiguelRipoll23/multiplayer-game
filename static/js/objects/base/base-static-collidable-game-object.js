import { BaseAnimatedGameObject } from "./base-animated-object.js";
export class BaseStaticCollidableGameObject extends BaseAnimatedGameObject {
    rigidBody = true;
    hitboxObjects = [];
    collidingObjects = [];
    avoidingCollision = false;
    excludedCollisionClasses = [];
    load() {
        this.hitboxObjects.forEach((object) => object.setDebug(this.debug));
        super.load();
    }
    hasRigidBody() {
        return this.rigidBody;
    }
    isColliding() {
        return this.collidingObjects
            .filter((object) => this.isCollisionClassIncluded(object.constructor))
            .some((object) => object.hasRigidBody());
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
    addCollisionExclusion(classType) {
        if (!this.excludedCollisionClasses.includes(classType)) {
            this.excludedCollisionClasses.push(classType);
        }
    }
    removeCollisionExclusion(classType) {
        this.excludedCollisionClasses = this.excludedCollisionClasses.filter((type) => type !== classType);
    }
    render(context) {
        this.hitboxObjects.forEach((object) => object.render(context));
    }
    isCollisionClassIncluded(classType) {
        return !this.excludedCollisionClasses.some((excludedType) => classType.prototype instanceof excludedType ||
            classType === excludedType);
    }
}
