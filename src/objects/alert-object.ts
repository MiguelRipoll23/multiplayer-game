import {
  BLUE_TEAM_COLOR,
  RED_TEAM_COLOR,
} from "../constants/colors-constants.js";
import { BaseAnimatedGameObject } from "./base/base-animated-object.js";

export class AlertObject extends BaseAnimatedGameObject {
  private multilineText: string[] = ["Unknown", "message"];
  private color: string = "white";

  constructor(protected readonly canvas: HTMLCanvasElement) {
    super();
    this.setInitialValues();
  }

  public show(text: string[], color = "white"): void {
    this.multilineText = text;

    if (color === "blue") {
      this.color = BLUE_TEAM_COLOR;
    } else if (color === "red") {
      this.color = RED_TEAM_COLOR;
    } else {
      this.color = color;
    }

    this.fadeIn(0.3);
    this.scaleTo(1, 0.3);
  }

  public hide(): void {
    this.fadeOut(0.3);
    this.scaleTo(0, 0.3);
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();
    context.globalAlpha = this.opacity;

    this.setTransformOrigin(context);
    this.setFontStyle(context);
    this.renderMultilineText(context);

    context.restore();
  }

  private setTransformOrigin(context: CanvasRenderingContext2D): void {
    context.translate(this.x, this.y);
    context.scale(this.scale, this.scale);
    context.translate(-this.x, -this.y);
  }

  private setFontStyle(context: CanvasRenderingContext2D): void {
    context.font = "44px system-ui";
    context.fillStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";

    // Adding black shadow to text for readability
    context.shadowColor = "black";
    context.shadowOffsetX = 0; // Horizontal offset of shadow
    context.shadowOffsetY = 0; // Vertical offset of shadow
    context.shadowBlur = 10; // Blur effect for the shadow
  }

  private renderMultilineText(context: CanvasRenderingContext2D): void {
    const lineHeight = 42; // Adjust as needed for line spacing

    this.multilineText.forEach((line, index) => {
      const yPosition = this.y + index * lineHeight;
      this.drawText(context, line, this.x, yPosition);
    });
  }

  private drawText(
    context: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number
  ): void {
    // Draw filled text with shadow applied
    context.fillText(text, x, y);
  }

  private setInitialValues() {
    this.opacity = 0;
    this.scale = 0;
    this.setCenterPosition();
  }

  private setCenterPosition(): void {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
  }
}
