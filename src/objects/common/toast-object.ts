import { BaseAnimatedGameObject } from "../base/base-animated-object.js";

export class ToastObject extends BaseAnimatedGameObject {
  private text: string = "Unknown";
  private toastWidth: number = 0;
  private toastHeight: number = 0;
  private padding: number = 10;
  private cornerRadius: number = 10;
  private bottomMargin: number = 30; // Renamed to bottomMargin

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.configureToast();
  }

  public show(text: string): void {
    this.text = text;
    this.configureToast();
    this.fadeIn(0.3);
    this.scaleTo(1, 0.3);
  }

  private configureToast(): void {
    this.opacity = 0;
    this.scale = 0;

    const context = this.canvas.getContext("2d")!; // Use the actual canvas context
    context.font = "16px Arial";

    // Measure text width and calculate dimensions
    const textWidth = context.measureText(this.text).width;
    this.toastWidth = textWidth + this.padding * 2;
    this.toastHeight = 30;

    // Set position at the bottom center of the canvas
    const canvasHeight = this.canvas.height; // Use the canvas height here
    this.x = (this.canvas.width - this.toastWidth) / 2;
    this.y = canvasHeight - this.bottomMargin - this.toastHeight; // Adjusted to use bottomMargin
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();

    context.globalAlpha = this.opacity;
    this.setTransformOrigin(context);

    // Draw black rounded rectangle for the toast background
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.beginPath();
    context.moveTo(this.x + this.cornerRadius, this.y);
    context.lineTo(this.x + this.toastWidth - this.cornerRadius, this.y);
    context.quadraticCurveTo(
      this.x + this.toastWidth,
      this.y,
      this.x + this.toastWidth,
      this.y + this.cornerRadius
    );
    context.lineTo(
      this.x + this.toastWidth,
      this.y + this.toastHeight - this.cornerRadius
    );
    context.quadraticCurveTo(
      this.x + this.toastWidth,
      this.y + this.toastHeight,
      this.x + this.toastWidth - this.cornerRadius,
      this.y + this.toastHeight
    );
    context.lineTo(this.x + this.cornerRadius, this.y + this.toastHeight);
    context.quadraticCurveTo(
      this.x,
      this.y + this.toastHeight,
      this.x,
      this.y + this.toastHeight - this.cornerRadius
    );
    context.lineTo(this.x, this.y + this.cornerRadius);
    context.quadraticCurveTo(
      this.x,
      this.y,
      this.x + this.cornerRadius,
      this.y
    );
    context.closePath();
    context.fill();

    // Draw white text
    context.fillStyle = "white";
    context.font = "16px system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.text,
      this.x + this.toastWidth / 2,
      this.y + this.toastHeight / 2
    );

    context.restore();
  }

  private setTransformOrigin(context: CanvasRenderingContext2D): void {
    // Translate to the center of the toast and then apply scaling
    context.translate(
      this.x + this.toastWidth / 2,
      this.y + this.toastHeight / 2
    );
    context.scale(this.scale, this.scale);
    context.translate(
      -(this.x + this.toastWidth / 2),
      -(this.y + this.toastHeight / 2)
    );
  }
}
