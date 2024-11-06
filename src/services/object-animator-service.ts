import { AnimationType } from "../models/game-animation.js";
import { BaseAnimatedGameObject } from "../objects/base/base-animated-object.js";

export class ObjectAnimationService {
  private readonly object: BaseAnimatedGameObject;

  private completed: boolean = false;

  private startValue: number;
  private endValue: number;

  private durationMilliseconds: number;
  private currentTime: number = 0;

  private animationType: AnimationType;

  constructor(
    object: BaseAnimatedGameObject,
    animationType: AnimationType,
    startValue: number,
    endValue: number,
    durationSeconds: number
  ) {
    this.object = object;
    this.startValue = startValue;
    this.endValue = endValue;
    this.durationMilliseconds = durationSeconds * 1000;
    this.animationType = animationType;

    console.log(
      `AnimationService (${AnimationType[animationType]}) created for ${object.constructor.name}`
    );
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp) {
    this.currentTime += deltaTimeStamp;

    const progress = Math.min(this.currentTime / this.durationMilliseconds, 1);
    const newValue =
      this.startValue + (this.endValue - this.startValue) * progress;

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

      case AnimationType.Scale:
        this.object.setScale(newValue);
        break;
    }

    this.completed = progress >= 1;
  }

  public isCompleted(): boolean {
    return this.completed;
  }
}
