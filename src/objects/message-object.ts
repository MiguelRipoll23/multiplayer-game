import { BaseGameObject } from "./base/base-game-object.js";

export class MessageObject extends BaseGameObject {
  private readonly FILL_COLOR = "rgba(0, 0, 0, 0.8)";
  private readonly DEFAULT_HEIGHT = 100;
  private readonly DEFAULT_WIDTH = 340;
  private readonly TRANSITION_MILLISECONDS = 400;

  private x = 0;
  private y = 0;
  private textX = 0;
  private textY = 0;

  private targetX = 0;

  private width = this.DEFAULT_WIDTH;
  private height = this.DEFAULT_HEIGHT;
  private text = "Unknown";

  private elapsedMilliseconds: number = 0;
  private opacity: number = 0;

  private fadeIn: boolean = false;
  private fadeOut: boolean = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.setPosition();
  }

  public show(value: string): void {
    this.text = value;

    this.setPosition();

    this.elapsedMilliseconds = 0;
    this.fadeIn = true;
  }

  public hide(): void {
    if (this.opacity === 0) {
      console.warn("MessageObject is already hidden");
      return;
    }

    this.elapsedMilliseconds = 0;
    this.fadeOut = true;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.fadeIn || this.fadeOut) {
      this.elapsedMilliseconds += deltaTimeStamp;
    }

    if (this.fadeIn) {
      if (this.elapsedMilliseconds < this.TRANSITION_MILLISECONDS) {
        this.opacity = this.elapsedMilliseconds / this.TRANSITION_MILLISECONDS;
        this.x += (this.targetX - this.x) * 0.1;
      } else {
        this.x = this.targetX;
        this.opacity = 1;
        this.fadeIn = false;
      }

      this.textX = this.x + this.width / 2;
    } else if (this.fadeOut) {
      if (this.elapsedMilliseconds < this.TRANSITION_MILLISECONDS) {
        this.opacity = 1 -
          this.elapsedMilliseconds / this.TRANSITION_MILLISECONDS;

        this.x += (this.targetX + 25) / this.x * 0.1;
      } else {
        this.x = this.targetX + 25;
        this.opacity = 0;
        this.fadeOut = false;
      }

      this.textX = this.x + this.width / 2;
    }
  }

  public render(context: CanvasRenderingContext2D): void {
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

  private setPosition(): void {
    this.x = this.canvas.width / 2 - (this.width / 2) - 25;
    this.y = this.canvas.height / 2 - (this.height / 2);

    this.targetX = this.canvas.width / 2 - (this.width / 2);

    this.textX = this.x + this.width / 2 - 25;
    this.textY = this.y + this.height / 2 + 5;
  }
}
