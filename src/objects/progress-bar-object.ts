import { BaseGameObject } from "./base/base-game-object.js";

export class ProgressBarObject extends BaseGameObject {
  private readonly RECT_HEIGHT: number = 40;
  private readonly RECT_CORNER_RADIUS: number = 6;
  private readonly RECT_MARGIN: number = 25;
  private readonly PROGRESS_BAR_HEIGHT: number = 3;

  private readonly rectX: number;
  private readonly reactY: number;
  private readonly rectWidth: number;
  private readonly textX: number;
  private readonly textY: number;

  private progresssBarY: number = 0;
  private progressBarWidth: number = 0;

  private text: string = "Loading...";
  private currentProgress: number = 0.0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.rectX = canvas.width * 0.05; // Adjust the margin as needed
    this.reactY = canvas.height - this.RECT_HEIGHT - this.RECT_MARGIN;
    this.rectWidth = this.canvas.width - 2 * this.rectX;
    this.textX = this.rectX + 15;
    this.textY = this.reactY + 25;
    this.progresssBarY = this.reactY + this.RECT_HEIGHT -
      this.PROGRESS_BAR_HEIGHT;
  }

  public update() {
    this.progressBarWidth = (this.canvas.width - 2 * this.rectX) *
      this.currentProgress; // Adjust the width calculation
  }

  public render(context: CanvasRenderingContext2D) {
    context.fillStyle = "rgba(0, 0, 0, 0.8)";

    // Draw top border with rounded corners
    this.roundedRect(
      context,
      this.rectX,
      this.reactY,
      this.rectWidth,
      this.RECT_HEIGHT,
      this.RECT_CORNER_RADIUS, // Adjust the radius for the roundness of the corners
    );

    const text = this.text;
    context.fillStyle = "white";
    context.font = "14px Arial";
    context.fillText(text, this.textX, this.textY);

    context.fillStyle = "rgba(66, 135, 245, 0.5)";
    context.fillRect(
      this.rectX,
      this.progresssBarY,
      this.rectWidth,
      this.PROGRESS_BAR_HEIGHT,
    );

    context.fillStyle = "#2196F3";
    context.fillRect(
      this.rectX,
      this.progresssBarY,
      this.progressBarWidth,
      this.PROGRESS_BAR_HEIGHT,
    );
  }

  private roundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  public setText(text: string) {
    this.text = text;
  }

  public setProgress(progress: number) {
    this.currentProgress = progress;
  }
}
