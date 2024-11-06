import { BaseAnimatedGameObject } from "../base/base-animated-object.js";

export class ToastObject extends BaseAnimatedGameObject {
  private text: string = "Unknown";
  private toastWidth: number = 0;
  private toastHeight: number = 0;
  private readonly padding: number = 10;
  private readonly cornerRadius: number = 10;
  private readonly bottomMargin: number = 30; // Renamed to bottomMargin

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.configureToast();
  }

  public show(text: string): void {
    this.text = text;
    this.configureToast();
    this.fadeIn(0.2);
    this.scaleTo(1, 0.2);
  }

  private configureToast(): void {
    this.resetToastProperties();
    const context = this.getCanvasContext();
    this.measureToastDimensions(context);
    this.setToastPosition();
  }

  private resetToastProperties(): void {
    this.opacity = 0;
    this.scale = 0;
  }

  private getCanvasContext(): CanvasRenderingContext2D {
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("Unable to get canvas context");
    return context;
  }

  private measureToastDimensions(context: CanvasRenderingContext2D): void {
    context.font = "16px Arial";
    const textWidth = context.measureText(this.text).width;
    this.toastWidth = textWidth + this.padding * 2;
    this.toastHeight = 30; // Fixed height for simplicity
  }

  private setToastPosition(): void {
    const canvasHeight = this.canvas.height;
    this.x = (this.canvas.width - this.toastWidth) / 2;
    this.y = canvasHeight - this.bottomMargin - this.toastHeight;
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();

    this.applyOpacity(context);
    this.applyTransformations(context);
    this.drawToastBackground(context);
    this.drawToastText(context);

    context.restore();
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
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
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
