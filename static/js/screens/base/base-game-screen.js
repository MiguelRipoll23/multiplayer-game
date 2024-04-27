import { BaseCollidableGameObject } from "../../objects/base/base-collidable-game-object.js";
export class BaseGameScreen {
    opacity = 0;
    sceneObjects;
    uiObjects;
    isScreenloading = true;
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
        const collidableGameObjects = this.sceneObjects
            .filter((sceneObject) => sceneObject instanceof BaseCollidableGameObject);
        collidableGameObjects.forEach((collidableGameObject) => {
            collidableGameObject.setColliding(false);
            collidableGameObject.getHitbox()?.setColliding(false);
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
        if (this.isScreenloading && this.hasLoaded()) {
            this.isScreenloading = false;
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
        const hitbox = sceneObject.getHitbox();
        const otherHitbox = otherSceneObject.getHitbox();
        if (!hitbox || !otherHitbox) {
            return;
        }
        if (this.hitboxesIntersect(hitbox, otherHitbox)) {
            hitbox.setColliding(true);
            otherHitbox.setColliding(true);
            sceneObject.setColliding(true);
            sceneObject.setCollidedObject(otherSceneObject);
        }
    }
    hitboxesIntersect(hitbox, otherHitbox) {
        return (hitbox.getX() < otherHitbox.getX() + otherHitbox.getWidth() &&
            hitbox.getX() + hitbox.getWidth() > otherHitbox.getX() &&
            hitbox.getY() < otherHitbox.getY() + otherHitbox.getHeight() &&
            hitbox.getY() + hitbox.getHeight() > otherHitbox.getY());
    }
    renderObjects(objects, context) {
        objects.forEach((object) => {
            if (object.hasLoaded()) {
                object.render(context);
            }
        });
    }
}
