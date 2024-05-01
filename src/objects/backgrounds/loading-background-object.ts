import { BaseGameObject } from "../base/base-game-object.js";

export class LoadingBackgroundObject extends BaseGameObject {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
  }

  public render(context: CanvasRenderingContext2D) {
    context.fillStyle = "white";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
