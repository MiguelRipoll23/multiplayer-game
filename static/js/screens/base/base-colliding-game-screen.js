import { BaseGameScreen } from "./base-game-screen.js";
import { BaseStaticCollidableGameObject as BaseStaticCollidableGameObject } from "../../objects/base/base-static-collidable-game-object.js";
import { BaseDynamicCollidableGameObject } from "../../objects/base/base-collidable-dynamic-game-object.js";
export class BaseCollidingGameScreen extends BaseGameScreen {
    constructor(gameController) {
        super(gameController);
    }
    update(deltaTimeStamp) {
        super.update(deltaTimeStamp);
        this.detectCollisions();
    }
    detectCollisions() {
        const collidableObjects = this
            .sceneObjects.filter((sceneObject) => sceneObject instanceof BaseStaticCollidableGameObject ||
            sceneObject instanceof BaseDynamicCollidableGameObject);
        collidableObjects.forEach((collidableObject) => {
            // Reset colliding state for hitboxes
            collidableObject.getHitboxObjects().forEach((hitbox) => {
                hitbox.setColliding(false);
            });
            collidableObjects.forEach((otherCollidableObject) => {
                if (collidableObject === otherCollidableObject) {
                    return;
                }
                this.detectStaticAndDynamicCollisions(collidableObject, otherCollidableObject);
            });
            if (collidableObject.isColliding() === false) {
                collidableObject.setAvoidingCollision(false);
            }
        });
    }
    detectStaticAndDynamicCollisions(collidableObject, otherCollidableObject) {
        const hitboxes = collidableObject.getHitboxObjects();
        const otherHitboxes = otherCollidableObject.getHitboxObjects();
        if (this.doesHitboxesIntersect(hitboxes, otherHitboxes) === false) {
            collidableObject.removeCollidingObject(otherCollidableObject);
            otherCollidableObject.removeCollidingObject(collidableObject);
            return;
        }
        collidableObject.addCollidingObject(otherCollidableObject);
        otherCollidableObject.addCollidingObject(collidableObject);
        if (collidableObject.isCrossable() ||
            otherCollidableObject.isCrossable()) {
            return;
        }
        const areDynamicObjectsColliding = collidableObject instanceof BaseDynamicCollidableGameObject &&
            otherCollidableObject instanceof BaseDynamicCollidableGameObject;
        const isDynamicObjectCollidingWithStatic = collidableObject instanceof BaseDynamicCollidableGameObject &&
            otherCollidableObject instanceof BaseStaticCollidableGameObject;
        if (areDynamicObjectsColliding) {
            this.simulateCollisionBetweenDynamicObjects(collidableObject, otherCollidableObject);
        }
        else if (isDynamicObjectCollidingWithStatic) {
            if (collidableObject.isAvoidingCollision()) {
                return;
            }
            this.simulateCollisionBetweenDynamicAndStaticObjects(collidableObject);
        }
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
        let vx = -dynamicCollidableObject.getVX();
        let vy = -dynamicCollidableObject.getVY();
        // Impulse to avoid becaming stuck
        if (vx > -1 && vx < 1) {
            vx = vx < 0 ? -1 : 1;
        }
        if (vy > -1 && vy < 1) {
            vy = vy < 0 ? -1 : 1;
        }
        dynamicCollidableObject.setAvoidingCollision(true);
        dynamicCollidableObject.setVX(vx);
        dynamicCollidableObject.setVY(vy);
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
}
