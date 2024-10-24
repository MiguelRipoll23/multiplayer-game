import { AnimationType } from "../models/game-animation.js";
export class AnimationService {
    object;
    completed = false;
    startValue;
    endValue;
    durationMilliseconds;
    currentTime = 0;
    animationType;
    constructor(object, animationType, startValue, endValue, durationSeconds) {
        this.object = object;
        this.startValue = startValue;
        this.endValue = endValue;
        this.durationMilliseconds = durationSeconds * 1000;
        this.animationType = animationType;
        console.log(`AnimationService (${AnimationType[animationType]}) created for ${object.constructor.name}`);
    }
    update(deltaTimeStamp) {
        this.currentTime += deltaTimeStamp;
        const progress = Math.min(this.currentTime / this.durationMilliseconds, 1);
        const newValue = this.startValue +
            (this.endValue - this.startValue) * progress;
        switch (this.animationType) {
            case AnimationType.FadeIn:
            case AnimationType.FadeOut:
                this.object.setOpacity(newValue);
                break;
            case AnimationType.MoveX:
                this.object.setX(newValue);
                break;
            case AnimationType.MoveY:
                this.object.setY(newValue);
                break;
        }
        this.completed = progress >= 1;
    }
    isCompleted() {
        return this.completed;
    }
}
