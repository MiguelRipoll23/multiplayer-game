import { AnimationType } from "../../models/game-animation.js";
import { AnimationService } from "../../services/animator-service.js";
import { BasePositionableGameObject } from "./base-positionable-game-object.js";
export class BaseAnimatedGameObject extends BasePositionableGameObject {
    opacity = 1;
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
    fadeIn(seconds) {
        this.animations.push(new AnimationService(this, AnimationType.FadeIn, 0, 1, seconds));
    }
    fadeOut(seconds) {
        this.animations.push(new AnimationService(this, AnimationType.FadeOut, 1, 0, seconds));
    }
    moveToX(newX, seconds) {
        this.animations.push(new AnimationService(this, AnimationType.MoveX, this.x, newX, seconds));
    }
    moveToY(newY, seconds) {
        this.animations.push(new AnimationService(this, AnimationType.MoveY, this.y, newY, seconds));
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
