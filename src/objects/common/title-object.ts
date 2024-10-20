import { BaseGameObject } from "../base/base-game-object.js";

export class TitleObject extends BaseGameObject {
  private x: number = 30;
  private y: number = 55;

  private text: string = "Unknown";

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
  }

  public setText(text: string): void {
    this.text = text;
  }

  public render(context: CanvasRenderingContext2D): void {
    context.fillStyle = "white";
    context.font = "lighter 38px system-ui";
    context.textAlign = "left";
    context.fillText(this.text, this.x, this.y);
  }
}
