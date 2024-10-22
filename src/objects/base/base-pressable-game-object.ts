import { GamePointer } from "../../models/game-pointer.js";
import { BaseGameObject } from "./base-game-object.js";

export class BasePressableGameObject extends BaseGameObject {
  protected x = 0;
  protected y = 0;

  protected width = 0;
  protected height = 0;

  protected active = true;
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

  public isPressed(): boolean {
    return this.pressed;
  }

  public handlePointerEvent(gamePointer: GamePointer): void {
    const pointerX = gamePointer.getX();
    const pointerY = gamePointer.getY();

    if (
      pointerX >= this.x &&
      pointerX <= this.x + this.width &&
      pointerY >= this.y &&
      pointerY <= this.y + this.height
    ) {
      this.pressed = true;
      console.log(this.constructor.name + " pressed");
    }
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.pressed = false;
    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    if (this.debug && this.active) {
      context.strokeStyle = "rgba(148, 0, 211, 0.8)";
      context.beginPath();
      context.rect(this.x, this.y, this.width, this.height);
      context.stroke();
      context.closePath();
    }
  }
}
