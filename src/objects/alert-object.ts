import {
  BLUE_TEAM_COLOR,
  ORANGE_TEAM_COLOR,
} from "../constants/colors-constants.js";
import { BaseAnimatedGameObject } from "./base/base-animated-object.js";

export class AlertObject extends BaseAnimatedGameObject {
  private text: string = "Unknown message";
  private color: string = "white";

  constructor(protected readonly canvas: HTMLCanvasElement) {
    super();
    this.setInitialValues();
  }

  public show(text: string, color = "white"): void {
    this.text = text;

    if (color === "orange") {
      this.color = ORANGE_TEAM_COLOR;
    } else if (color === "blue") {
      this.color = BLUE_TEAM_COLOR;
    } else {
      this.color = color;
    }

    this.fadeIn(0.5);
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();

    context.globalAlpha = this.opacity;

    context.font = "lighter 30px system-ui";
    context.fillStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.text, this.x, this.y);

    context.restore();
  }

  private setInitialValues() {
    this.opacity = 0;
    this.setCenterPosition();
  }

  private setCenterPosition(): void {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
  }
}
