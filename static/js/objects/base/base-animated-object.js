import { AnimationType } from "../../models/game-animation.js";
import { ObjectAnimationService } from "../../services/object-animator-service.js";
import { BasePositionableGameObject } from "./base-positionable-game-object.js";
export class BaseAnimatedGameObject extends BasePositionableGameObject {
    opacity = 1;
    scale = 1;
    animations = [];
    constructor() {
        super();
    }
    getOpacity() {
        return this.opacity;
    }
    setOpacity(opacity) {
        this.opacity = opacity;
    }
    getScale() {
        return this.scale;
    }
    setScale(scale) {
        this.scale = scale;
    }
    fadeIn(seconds) {
        this.animations.push(new ObjectAnimationService(this, AnimationType.FadeIn, 0, 1, seconds));
    }
    fadeOut(seconds) {
        this.animations.push(new ObjectAnimationService(this, AnimationType.FadeOut, 1, 0, seconds));
    }
    moveToX(newX, seconds) {
        this.animations.push(new ObjectAnimationService(this, AnimationType.MoveX, this.x, newX, seconds));
    }
    moveToY(newY, seconds) {
        this.animations.push(new ObjectAnimationService(this, AnimationType.MoveY, this.y, newY, seconds));
    }
    scaleTo(newScale, seconds) {
        this.animations.push(new ObjectAnimationService(this, AnimationType.Scale, this.scale, newScale, seconds));
    }
    reset() {
        this.animations.length = 0;
    }
    update(deltaTimeStamp) {
        this.animations.forEach((animation) => {
            animation.update(deltaTimeStamp);
            // Remove completed animations
            if (animation.isCompleted()) {
                const index = this.animations.indexOf(animation);
                this.animations.splice(index, 1);
            }
        });
        super.update(deltaTimeStamp);
    }
}
