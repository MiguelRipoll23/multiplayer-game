import { GamePointer } from "../../models/game-pointer.js";
import { BasePositionableGameObject } from "./base-positionable-game-object.js";

export class BasePressableGameObject extends BasePositionableGameObject {
  protected width = 0;
  protected height = 0;

  protected active = true;

  protected hovering = false;
  protected pressed = false;

  constructor() {
    super();
  }

  public setActive(active: boolean): void {
    if (active) {
      console.log(this.constructor.name + " activated");
    } else {
      console.log(this.constructor.name + " deactivated");
    }

    this.active = active;
  }

  public isActive(): boolean {
    return this.active;
  }

  public isHovering(): boolean {
    return this.hovering;
  }

  public isPressed(): boolean {
    return this.pressed;
  }

  public handlePointerEvent(gamePointer: GamePointer): void {
    const pointerX = gamePointer.getX();
    const pointerY = gamePointer.getY();

    if (
      pointerX < this.x || pointerX > this.x + this.width ||
      pointerY < this.y || pointerY > this.y + this.height
    ) {
      this.hovering = false;
      return;
    }

    this.hovering = true;

    if (gamePointer.isPressed()) {
      this.pressed = true;
      console.log(this.constructor.name + " pressed");
    }
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.hovering = false;
    this.pressed = false;
    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    if (this.debug && this.active) {
      context.save();

      // Translate context to the object's center
      context.translate(this.x + this.width / 2, this.y + this.height / 2);

      // Apply the rotation
      context.rotate(this.angle);

      // Set the stroke style for the hitbox
      context.strokeStyle = "rgba(148, 0, 211, 0.8)";

      // Draw the rectangle (centered, so offset by half the width/height)
      context.beginPath();
      context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
      context.stroke();
      context.closePath();

      // Restore the context
      context.restore();
    }
  }
}
