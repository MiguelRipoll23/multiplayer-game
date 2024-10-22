export class AnimationService {
  private animations: Map<any, any>;

  constructor() {
    this.animations = new Map();
  }

  public fadeIn(gameObject: any, duration: number): void {
    this.startAnimation(gameObject, duration, (progress: number) => {
      gameObject.opacity = progress;
    });
  }

  public fadeOut(gameObject: any, duration: number): void {
    this.startAnimation(gameObject, duration, (progress: number) => {
      gameObject.opacity = 1 - progress;
    });
  }

  public slideUpAndFadeIn(gameObject: any, duration: number): void {
    const initialY = gameObject.y;
    this.startAnimation(gameObject, duration, (progress: number) => {
      gameObject.opacity = progress;
      gameObject.y = initialY - (initialY * progress);
    });
  }

  public slideDownAndFadeOut(gameObject: any, duration: number): void {
    const initialY = gameObject.y;
    this.startAnimation(gameObject, duration, (progress: number) => {
      gameObject.opacity = 1 - progress;
      gameObject.y = initialY + (initialY * progress);
    });
  }

  private startAnimation(gameObject: any, duration: number, updateCallback: (progress: number) => void): void {
    const animation = {
      duration,
      elapsed: 0,
      updateCallback,
    };

    this.animations.set(gameObject, animation);
  }

  public update(deltaTime: number): void {
    this.animations.forEach((animation, gameObject) => {
      animation.elapsed += deltaTime;
      const progress = Math.min(animation.elapsed / animation.duration, 1);
      animation.updateCallback(progress);

      if (progress === 1) {
        this.animations.delete(gameObject);
      }
    });
  }
}
