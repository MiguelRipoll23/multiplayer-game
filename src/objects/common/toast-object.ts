import { BaseAnimatedGameObject } from "../base/base-animated-object.js";
import { RED_TEAM_COLOR } from "../../constants/colors-constants.js";

export class ToastObject extends BaseAnimatedGameObject {
  private text: string = "Unknown";
  private width: number = 0;
  private height: number = 0;
  private readonly padding: number = 10;
  private readonly topMargin: number = 160; // Changed bottomMargin to topMargin
  private readonly cornerRadius: number = 10; // Corner radius for rounded corners

  private context: CanvasRenderingContext2D;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    this.reset();
  }

  public show(text: string): void {
    this.text = this.parseText(text);
    this.reset();
    this.fadeIn(0.2);
    this.scaleTo(1, 0.2);
  }

  public hide(): void {
    this.fadeOut(0.2);
    this.scaleTo(0, 0.2);
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
    this.y = this.topMargin; // Set y position based on topMargin
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
    const lines = this.text.split("\n");
    const lineHeight = 20;
    const textY = this.y + this.height / 2 - (lines.length - 1) * lineHeight / 2;

    lines.forEach((line, index) => {
      const emMatch = line.match(/<em>(.*?)<\/em>/);
      if (emMatch) {
        const [fullMatch, emText] = emMatch;
        const parts = line.split(fullMatch);

        context.font = "16px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";

        const textX = this.x + this.width / 2;
        context.fillText(parts[0], textX, textY + index * lineHeight);

        context.font = "bold 16px Arial";
        context.fillStyle = RED_TEAM_COLOR;
        context.fillText(emText, textX + context.measureText(parts[0]).width / 2, textY + index * lineHeight);

        context.fillText(parts[1], textX + context.measureText(parts[0] + emText).width / 2, textY + index * lineHeight);
      } else {
        context.font = "16px Arial";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(line, this.x + this.width / 2, textY + index * lineHeight);
      }
    });
  }

  private parseText(text: string): string {
    return text.replace(/<em>(.*?)<\/em>/g, "\n<em>$1</em>\n");
  }
}
