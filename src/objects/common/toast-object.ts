import { BaseAnimatedGameObject } from "../base/base-animated-object.js";

export class ToastObject extends BaseAnimatedGameObject {
  private text: string = "Unknown";
  private toastWidth: number = 0;
  private toastHeight: number = 0;
  private readonly padding: number = 10;
  private readonly cornerRadius: number = 10;
  private readonly bottomMargin: number = 30; // Renamed to bottomMargin

  private context: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.reset();
  }

  public show(text: string): void {
    this.text = text;
    this.reset();
    this.fadeIn(0.2);
    this.scaleTo(1, 0.2);
  }

  public override reset(): void {
    this.opacity = 0;
    this.scale = 0;

    this.measureDimensions();
    this.setPosition();
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();

    this.applyOpacity(context);
    this.applyTransformations(context);
    this.drawToastBackground(context);
    this.drawToastText(context);

    context.restore();
  }

  private measureDimensions(): void {
    this.context.font = "16px Arial";
    const textWidth = this.context.measureText(this.text).width;
    this.toastWidth = textWidth + this.padding * 2;
    this.toastHeight = 30; // Fixed height for simplicity
  }

  private setPosition(): void {
    const canvasHeight = this.canvas.height;
    this.x = (this.canvas.width - this.toastWidth) / 2;
    this.y = canvasHeight - this.bottomMargin - this.toastHeight;
  }

  private applyOpacity(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;
  }

  private applyTransformations(context: CanvasRenderingContext2D): void {
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

  private drawToastBackground(context: CanvasRenderingContext2D): void {
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.beginPath();
    this.drawRoundedRectangle(context);
    context.closePath();
    context.fill();
  }

  private drawRoundedRectangle(context: CanvasRenderingContext2D): void {
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
  }

  private drawToastText(context: CanvasRenderingContext2D): void {
    context.fillStyle = "white";
    context.font = "16px system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.text,
      this.x + this.toastWidth / 2,
      this.y + this.toastHeight / 2
    );
  }
}
