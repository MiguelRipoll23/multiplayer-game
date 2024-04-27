import { BaseCollidableGameObject } from "../../objects/base/base-collidable-game-object.js";
import { BaseMoveableCollidableGameObject } from "../../objects/base/base-moveable-collidable-game-object.js";
export class BaseCollidableGameScreen {
    opacity = 0;
    sceneObjects;
    uiObjects;
    isScreenLoading = true;
    constructor() {
        console.log(`${this.constructor.name} created`);
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
        const collidableGameObjects = this.sceneObjects.filter((sceneObject) => sceneObject instanceof BaseCollidableGameObject ||
            sceneObject instanceof BaseMoveableCollidableGameObject);
        collidableGameObjects.forEach((collidableGameObject) => {
            collidableGameObject.setColliding(false);
            collidableGameObjects.forEach((otherCollidableGameObject) => {
                if (collidableGameObject === otherCollidableGameObject) {
                    return;
                }
                this.detectCollision(collidableGameObject, otherCollidableGameObject);
            });
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
    detectCollision(sceneObject, otherSceneObject) {
        const hitboxes = sceneObject.getHitboxObjects();
        const otherHitboxes = otherSceneObject.getHitboxObjects();
        if (!hitboxes || !otherHitboxes) {
            return;
        }
        if (this.hitboxesIntersect(hitboxes, otherHitboxes)) {
            sceneObject.setColliding(true);
            sceneObject.setCollidedObject(otherSceneObject);
            if (sceneObject instanceof BaseMoveableCollidableGameObject &&
                otherSceneObject instanceof BaseMoveableCollidableGameObject) {
                this.simulateCollision(sceneObject, otherSceneObject);
            }
        }
    }
    hitboxesIntersect(hitboxes, otherHitboxes) {
        return hitboxes.some((hitbox) => {
            return otherHitboxes.some(function (otherHitbox) {
                return (hitbox.getX() < otherHitbox.getX() + otherHitbox.getWidth() &&
                    hitbox.getX() + hitbox.getWidth() > otherHitbox.getX() &&
                    hitbox.getY() < otherHitbox.getY() + otherHitbox.getHeight() &&
                    hitbox.getY() + hitbox.getHeight() > otherHitbox.getY());
            });
        });
    }
    simulateCollision(sceneObject, otherSceneObject) {
        // Calculate collision vector
        const vCollision = {
            x: otherSceneObject.getX() - sceneObject.getX(),
            y: otherSceneObject.getY() - sceneObject.getY(),
        };
        // Calculate distance between objects
        const distance = Math.sqrt(Math.pow(vCollision.x, 2) + Math.pow(vCollision.y, 2));
        // Normalize collision vector
        const vCollisionNorm = {
            x: vCollision.x / distance,
            y: vCollision.y / distance,
        };
        // Check if any of the objects is movable
        const moveableSceneObject = sceneObject instanceof BaseMoveableCollidableGameObject
            ? sceneObject
            : otherSceneObject instanceof BaseMoveableCollidableGameObject
                ? otherSceneObject
                : null;
        if (!moveableSceneObject) {
            // Neither object is movable, nothing to simulate
            return;
        }
        // Calculate relative velocity
        const vRelativeVelocity = {
            x: otherSceneObject.getVX() - sceneObject.getVX(),
            y: otherSceneObject.getVY() - sceneObject.getVY(),
        };
        // Calculate speed along collision normal
        const speed = vRelativeVelocity.x * vCollisionNorm.x +
            vRelativeVelocity.y * vCollisionNorm.y;
        if (speed < 0) {
            // Collision has already been resolved
            return;
        }
        // Calculate impulse
        const impulse = (2 * speed) / (sceneObject.getMass() + otherSceneObject.getMass());
        // Update velocities for both movable objects
        const impulseX = impulse * otherSceneObject.getMass() * vCollisionNorm.x;
        const impulseY = impulse * otherSceneObject.getMass() * vCollisionNorm.y;
        sceneObject.setVX(sceneObject.getVX() + impulseX);
        sceneObject.setVY(sceneObject.getVY() + impulseY);
        otherSceneObject.setVX(otherSceneObject.getVX() - impulseX);
        otherSceneObject.setVY(otherSceneObject.getVY() - impulseY);
    }
    renderObjects(objects, context) {
        objects.forEach((object) => {
            if (object.hasLoaded()) {
                object.render(context);
            }
        });
    }
}
