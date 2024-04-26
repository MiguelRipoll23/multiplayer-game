import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class WorldBackgroundObject
  extends BaseGameObject
  implements GameObject
{
  private canvas: HTMLCanvasElement;
  private readonly BACKGROUND_COLOR: string = "#00A000";
  private readonly LINE_BLUE_COLOR = "#52cee2";
  private readonly LINE_RED_COLOR = "#e26652";

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // No update logic required
  }

  public render(context: CanvasRenderingContext2D): void {
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    // Draw top half (red)
    context.fillStyle = this.LINE_RED_COLOR;
    context.fillRect(0, 0, canvasWidth, canvasHeight / 2);

    // Draw bottom half (blue)
    context.fillStyle = this.LINE_BLUE_COLOR;
    context.fillRect(0, canvasHeight / 2, canvasWidth, canvasHeight / 2);
  }
}
