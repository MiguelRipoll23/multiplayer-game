import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class StatusObject extends BaseGameObject implements GameObject {
  private readonly DISTANCE_CENTER = 100;
  private readonly FILL_COLOR = "rgba(0, 0, 0, 0.5)";
  private readonly TEXT_PADDING = 140;
  private readonly DEFAULT_HEIGHT = 40;

  private x = 0;
  private y = 180;
  private width = 0;
  private height = this.DEFAULT_HEIGHT;
  private active = false;
  private text = "Unknown";

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.setPosition();
  }

  private setPosition(): void {
    this.x = this.canvas.width / 2;
  }

  public update(_deltaTimeStamp: DOMHighResTimeStamp): void {
    // No need to check if active here
  }

  public render(context: CanvasRenderingContext2D): void {
    if (!this.active) return;

    // Calculate width based on text length
    this.width = context.measureText(this.text).width - this.TEXT_PADDING; // Add padding

    // Draw rounded rectangle
    context.fillStyle = this.FILL_COLOR; // Use fill color constant
    this.roundRect(
      context,
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height,
      10
    );

    // Draw text
    context.font = "16px Arial";
    context.fillStyle = "WHITE";
    context.textAlign = "center";
    context.fillText(this.text, this.x, this.y + 5); // Adjust y position for better centering
  }

  // Setter for the active property
  public setActive(value: boolean): void {
    this.active = value;
  }

  // Setter for the text property
  public setText(value: string): void {
    this.text = value;
  }

  // Function to draw rounded rectangle
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
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
