import { BaseStaticCollidableGameObject as BaseStaticCollidableGameObject } from "../../objects/base/base-static-collidable-game-object.js";
import { BaseDynamicCollidableGameObject } from "../../objects/base/base-dynamic-collidable-game-object.js";
export class BaseGameScreen {
    canvas;
    opacity = 0;
    sceneObjects;
    uiObjects;
    isScreenLoading = true;
    constructor(canvas) {
        console.log(`${this.constructor.name} created`);
        this.canvas = canvas;
        this.sceneObjects = [];
        this.uiObjects = [];
    }
    loadObjects() {
        this.sceneObjects.forEach((object) => object.load());
        this.uiObjects.forEach((object) => object.load());
    }
    hasLoaded() {
        return [...this.sceneObjects, ...this.uiObjects].every((object) => object.hasLoaded());
    }
    update(deltaTimeStamp) {
        this.checkIfScreenHasLoaded();
        this.updateObjects(this.sceneObjects, deltaTimeStamp);
        this.updateObjects(this.uiObjects, deltaTimeStamp);
        this.detectCollisions();
    }
    detectCollisions() {
        const collidableGameObjects = this
            .sceneObjects.filter((sceneObject) => sceneObject instanceof BaseStaticCollidableGameObject ||
            sceneObject instanceof BaseDynamicCollidableGameObject);
        collidableGameObjects.forEach((collidableGameObject) => {
            collidableGameObject.setColliding(false);
            collidableGameObjects.forEach((otherCollidableGameObject) => {
                if (collidableGameObject === otherCollidableGameObject) {
                    return;
                }
                if (this.areObjectsColliding(collidableGameObject, otherCollidableGameObject)) {
                    collidableGameObject.setColliding(true);
                    otherCollidableGameObject.setColliding(true);
                }
            });
            if (collidableGameObject.isColliding() === false) {
                collidableGameObject.setAvoidingCollision(false);
            }
        });
    }
    render(context) {
        context.globalAlpha = this.opacity;
        this.renderObjects(this.sceneObjects, context);
        this.renderObjects(this.uiObjects, context);
        context.globalAlpha = 1;
    }
    getOpacity() {
        return this.opacity;
    }
    setOpacity(opacity) {
        this.opacity = opacity;
    }
    checkIfScreenHasLoaded() {
        if (this.isScreenLoading && this.hasLoaded()) {
            this.isScreenLoading = false;
            console.log(`${this.constructor.name} loaded`);
        }
    }
    updateObjects(objects, deltaTimeStamp) {
        objects.forEach((object) => {
            if (object.hasLoaded()) {
                object.update(deltaTimeStamp);
            }
        });
    }
    areObjectsColliding(collidableObject, otherCollidableObject) {
        const hitboxes = collidableObject.getHitboxObjects();
        const otherHitboxes = otherCollidableObject.getHitboxObjects();
        const areDynamicObjectsColliding = collidableObject instanceof BaseDynamicCollidableGameObject &&
            otherCollidableObject instanceof BaseDynamicCollidableGameObject;
        const isDynamicObjectCollidingWithStatic = collidableObject instanceof BaseDynamicCollidableGameObject &&
            otherCollidableObject instanceof BaseStaticCollidableGameObject;
        if (this.doesHitboxesIntersect(hitboxes, otherHitboxes)) {
            if (areDynamicObjectsColliding) {
                this.simulateCollisionBetweenDynamicObjects(collidableObject, otherCollidableObject);
            }
            else if (isDynamicObjectCollidingWithStatic) {
                if (collidableObject.isAvoidingCollision()) {
                    return true;
                }
                this.simulateCollisionBetweenDynamicAndStaticObjects(collidableObject);
            }
            return true;
        }
        return false;
    }
    doesHitboxesIntersect(hitboxObjects, otherHitboxObjects) {
        let intersecting = false;
        hitboxObjects.forEach((hitbox) => {
            otherHitboxObjects.forEach((otherHitbox) => {
                if (hitbox.getX() < otherHitbox.getX() + otherHitbox.getWidth() &&
                    hitbox.getX() + hitbox.getWidth() > otherHitbox.getX() &&
                    hitbox.getY() < otherHitbox.getY() + otherHitbox.getHeight() &&
                    hitbox.getY() + hitbox.getHeight() > otherHitbox.getY()) {
                    intersecting = true;
                    hitbox.setColliding(true);
                    otherHitbox.setColliding(true);
                }
            });
        });
        return intersecting;
    }
    simulateCollisionBetweenDynamicAndStaticObjects(dynamicCollidableObject) {
        dynamicCollidableObject.setAvoidingCollision(true);
        dynamicCollidableObject.setVX(-dynamicCollidableObject.getVX());
        dynamicCollidableObject.setVY(-dynamicCollidableObject.getVY());
    }
    simulateCollisionBetweenDynamicObjects(dynamicCollidableObject, otherDynamicCollidableObject) {
        // Calculate collision vector
        const vCollision = {
            x: otherDynamicCollidableObject.getX() - dynamicCollidableObject.getX(),
            y: otherDynamicCollidableObject.getY() - dynamicCollidableObject.getY(),
        };
        // Calculate distance between objects
        const distance = Math.sqrt(Math.pow(vCollision.x, 2) + Math.pow(vCollision.y, 2));
        // Normalize collision vector
        const vCollisionNorm = {
            x: vCollision.x / distance,
            y: vCollision.y / distance,
        };
        // Calculate relative velocity
        const vRelativeVelocity = {
            x: otherDynamicCollidableObject.getVX() - dynamicCollidableObject.getVX(),
            y: otherDynamicCollidableObject.getVY() - dynamicCollidableObject.getVY(),
        };
        // Calculate speed along collision normal
        const speed = vRelativeVelocity.x * vCollisionNorm.x +
            vRelativeVelocity.y * vCollisionNorm.y;
        if (speed < 0) {
            // Collision has already been resolved
            return;
        }
        // Calculate impulse
        const impulse = (2 * speed) /
            (dynamicCollidableObject.getMass() +
                otherDynamicCollidableObject.getMass());
        // Update velocities for both movable objects
        const impulseX = impulse * otherDynamicCollidableObject.getMass() *
            vCollisionNorm.x;
        const impulseY = impulse * otherDynamicCollidableObject.getMass() *
            vCollisionNorm.y;
        dynamicCollidableObject.setVX(dynamicCollidableObject.getVX() + impulseX);
        dynamicCollidableObject.setVY(dynamicCollidableObject.getVY() + impulseY);
        otherDynamicCollidableObject.setVX(otherDynamicCollidableObject.getVX() - impulseX);
        otherDynamicCollidableObject.setVY(otherDynamicCollidableObject.getVY() - impulseY);
    }
    renderObjects(objects, context) {
        objects.forEach((object) => {
            if (object.hasLoaded()) {
                object.render(context);
            }
        });
    }
}
