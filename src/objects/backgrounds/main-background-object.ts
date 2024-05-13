import { BaseGameObject } from "../base/base-game-object.js";

export class MainBackgroundObject extends BaseGameObject {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
  }

  public render(context: CanvasRenderingContext2D) {
    context.fillStyle = "#90CAF9";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
