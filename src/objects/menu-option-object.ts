import { BaseGameObject } from "./base/base-game-object.js";

export class MenuOptionObject extends BaseGameObject {
  private index: number;
  private x = 0;
  private y = 0;
  private textX = 0;
  private textY = 0;
  private width = 200; // Adjust as needed
  private height = 120; // Adjust as needed
  private text: string;

  private active = false;
  private pressed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    index: number,
    text: string,
  ) {
    super();
    this.index = index;
    this.width = canvas.width - 70; // Adjust width as needed
    this.text = text.toUpperCase(); // Convert text to uppercase
    this.addEventListeners();
  }

  public getIndex(): number {
    return this.index;
  }

  public getHeight(): number {
    return this.height;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;

    this.calculateTextPosition();
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public isPressed(): boolean {
    return this.pressed;
  }

  public reset(): void {
    this.pressed = false;
  }

  public render(context: CanvasRenderingContext2D): void {
    // Draw rectangle with gradient
    context.fillStyle = "black"; // Black color for the rectangle
    context.fillRect(this.x, this.y, this.width, this.height);

    // Set text properties
    context.fillStyle = "#FFFFFF"; // White color for the text
    context.font = "bold 28px system-ui"; // Adjust font size and family as needed
    context.textAlign = "center";

    // Draw the text
    context.fillText(this.text, this.textX, this.textY);
  }

  private calculateTextPosition(): void {
    this.textX = this.x + this.width / 2 + 8;
    this.textY = this.y + this.height / 2 + 8;
  }

  private addEventListeners(): void {
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });

    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  private handleTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const x = touch.clientX - this.canvas.getBoundingClientRect().left;
    const y = touch.clientY - this.canvas.getBoundingClientRect().top;

    this.handlePointerEvent(x, y);
  }

  private handleMouseUp(event: MouseEvent): void {
    const x = event.clientX - this.canvas.getBoundingClientRect().left;
    const y = event.clientY - this.canvas.getBoundingClientRect().top;

    this.handlePointerEvent(x, y);
  }

  private handlePointerEvent(x: number, y: number): void {
    if (this.active === false) {
      return;
    }

    if (
      x >= this.x && x <= this.x + this.width && y >= this.y &&
      y <= this.y + this.height
    ) {
      this.pressed = true;
    }
  }
}
