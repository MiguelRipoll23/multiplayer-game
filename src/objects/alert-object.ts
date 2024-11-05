import { BaseAnimatedGameObject } from "./base/base-animated-object.js";

export class AlertObject extends BaseAnimatedGameObject {
  private text: string = "Unknown message";

  constructor(protected readonly canvas: HTMLCanvasElement) {
    super();
    this.setInitialValues();
  }

  public show(text: string): void {
    this.text = text;
    this.fadeIn(0.5);
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();

    context.globalAlpha = this.opacity;

    context.font = "48px Arial";
    context.fillStyle = "white";
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
