import { BaseGameObject } from "./base/base-game-object.js";

export class MessageObject extends BaseGameObject {
  private readonly FILL_COLOR = "rgba(0, 0, 0, 0.8)";
  private readonly DEFAULT_HEIGHT = 100;
  private readonly DEFAULT_WIDTH = 340;

  private x = 0;
  private y = 0;
  private textX = 0;
  private textY = 0;

  private width = this.DEFAULT_WIDTH;
  private height = this.DEFAULT_HEIGHT;
  private active = false;
  private text = "Unknown";

  private elapsedMilliseconds: number = 0;
  private opacity: number = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.setPosition();
  }

  private setPosition(): void {
    this.x = this.canvas.width / 2 - (this.width / 2);
    this.y = this.canvas.height / 2 - (this.height / 2);
    this.textX = this.x + this.width / 2;
    this.textY = this.y + this.height / 2 + 5;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (!this.active) return;

    if (this.opacity < 1) {
      this.elapsedMilliseconds += deltaTimeStamp;

      if (this.elapsedMilliseconds < 150) {
        this.opacity = this.elapsedMilliseconds / 150;
      } else {
        this.opacity = 1;
      }
    }
  }

  public render(context: CanvasRenderingContext2D): void {
    if (!this.active) return;

    context.globalAlpha = this.opacity;

    // Draw rounded rectangle
    context.fillStyle = this.FILL_COLOR; // Use fill color constant
    this.roundRect(
      context,
      this.x,
      this.y,
      this.width,
      this.height,
      6,
    );

    // Draw text
    context.font = "16px Arial";
    context.fillStyle = "WHITE";
    context.textAlign = "center";
    context.fillText(
      this.text,
      this.textX,
      this.textY,
    );

    context.globalAlpha = this.opacity;
  }

  // Setter for the active property
  public setActive(value: boolean): void {
    this.active = value;
  }

  // Setter for the text property
  public setText(value: string): void {
    this.elapsedMilliseconds = 0;
    this.text = value;
  }

  // Function to draw rounded rectangle
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  }
}
