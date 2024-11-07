import { BaseAnimatedGameObject } from "../base/base-animated-object.js";

export class ToastObject extends BaseAnimatedGameObject {
  private text: string = "Unknown";
  private width: number = 0;
  private height: number = 0;
  private readonly padding: number = 10;
  private readonly bottomMargin: number = 30;
  private readonly cornerRadius: number = 10; // Corner radius for rounded corners

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
    this.width = textWidth + this.padding * 2;
    this.height = 30; // Fixed height for simplicity
  }

  private setPosition(): void {
    const canvasHeight = this.canvas.height;
    this.x = (this.canvas.width - this.width) / 2;
    this.y = canvasHeight - this.bottomMargin - this.height;
  }

  private applyOpacity(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;
  }

  private applyTransformations(context: CanvasRenderingContext2D): void {
    context.translate(this.x + this.width / 2, this.y + this.height / 2);
    context.scale(this.scale, this.scale);
    context.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
  }

  private drawToastBackground(context: CanvasRenderingContext2D): void {
    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.beginPath();

    // Rounded rectangle with corner radius
    context.moveTo(this.x + this.cornerRadius, this.y);
    context.lineTo(this.x + this.width - this.cornerRadius, this.y);
    context.arcTo(
      this.x + this.width,
      this.y,
      this.x + this.width,
      this.y + this.height,
      this.cornerRadius
    );
    context.lineTo(
      this.x + this.width,
      this.y + this.height - this.cornerRadius
    );
    context.arcTo(
      this.x + this.width,
      this.y + this.height,
      this.x + this.width - this.cornerRadius,
      this.y + this.height,
      this.cornerRadius
    );
    context.lineTo(this.x + this.cornerRadius, this.y + this.height);
    context.arcTo(
      this.x,
      this.y + this.height,
      this.x,
      this.y + this.height - this.cornerRadius,
      this.cornerRadius
    );
    context.lineTo(this.x, this.y + this.cornerRadius);
    context.arcTo(
      this.x,
      this.y,
      this.x + this.cornerRadius,
      this.y,
      this.cornerRadius
    );

    context.closePath();
    context.fill();
  }

  private drawToastText(context: CanvasRenderingContext2D): void {
    context.fillStyle = "white";
    context.font = "16px system-ui";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.text,
      this.x + this.width / 2,
      this.y + this.height / 2
    );
  }
}
