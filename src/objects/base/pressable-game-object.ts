import { BaseGameObject } from "./base-game-object.js";

export class PressableBaseGameObject extends BaseGameObject {
  protected canvas: HTMLCanvasElement;

  protected x = 0;
  protected y = 0;

  protected width = 0;
  protected height = 0;

  protected active = true;
  protected pressed = false;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public isActive(): boolean {
    return this.active;
  }

  public isPressed(): boolean {
    return this.pressed;
  }

  public resetPressedState(): void {
    this.pressed = false;
  }

  public handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const pointerX = touch.clientX - this.canvas.getBoundingClientRect().left;
    const pointerY = touch.clientY - this.canvas.getBoundingClientRect().top;

    this.handlePointerEvent(pointerX, pointerY);
  }

  public handleMouseUp(event: MouseEvent): void {
    const pointerX = event.clientX - this.canvas.getBoundingClientRect().left;
    const pointerY = event.clientY - this.canvas.getBoundingClientRect().top;

    this.handlePointerEvent(pointerX, pointerY);
  }

  private handlePointerEvent(pointerX: number, pointerY: number): void {
    if (
      pointerX >= this.x &&
      pointerX <= this.x + this.width &&
      pointerY >= this.y &&
      pointerY <= this.y + this.height
    ) {
      this.pressed = true;
    }
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.pressed = false;
    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    if (this.active) {
      context.strokeStyle = "red";
      context.beginPath();
      context.rect(this.x, this.y, this.width, this.height);
      context.stroke();
      context.closePath();
    }
  }
}
