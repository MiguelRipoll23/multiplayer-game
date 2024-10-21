import { BLUE_TEAM_COLOR } from "../../constants/colors-constants.js";
import { BaseGameObject } from "../base/base-game-object.js";

export class MainBackgroundObject extends BaseGameObject {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
  }

  public render(context: CanvasRenderingContext2D) {
    context.fillStyle = BLUE_TEAM_COLOR;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
