import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class GoalObject extends BaseGameObject implements GameObject {
  private readonly ORANGE_FILL_COLOR: string = "rgba(254, 118, 99, 0.5)";
  private readonly ORANGE_BORDER_COLOR: string = "rgba(254, 118, 99, 1)";

  private readonly BLUE_FILL_COLOR: string = "rgba(133, 222, 255, 0.5)";
  private readonly BLUE_BORDER_COLOR: string = "rgba(133, 222, 255, 1)";

  private readonly WIDTH: number = 200; // Width of the goal
  private readonly HEIGHT: number = 200; // Height of the goal
  private readonly BORDER_SIZE: number = 5; // Border size

  private x: number = 0;
  private y: number = 0;
  private fillColor: string;
  private borderColor: string;
  private isTop: boolean; // New property to save whether the goal is at the top

  constructor(top: boolean, canvas: HTMLCanvasElement) {
    super();
    this.isTop = top; // Save the 'top' value to the 'isTop' property

    if (top) {
      // Position goal at the top of the canvas
      this.y = -5;
      this.fillColor = this.ORANGE_FILL_COLOR;
      this.borderColor = this.ORANGE_BORDER_COLOR;
    } else {
      // Position goal at the bottom of the canvas
      this.y = canvas.height - this.HEIGHT + 5;
      this.fillColor = this.BLUE_FILL_COLOR;
      this.borderColor = this.BLUE_BORDER_COLOR;
    }

    // Calculate x position to center the goal horizontally
    this.x = (canvas.width - this.WIDTH) / 2;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // No update logic required
  }

  public render(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.fillColor;
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.BORDER_SIZE;

    context.beginPath();
    if (this.isTop) {
      context.arc(
        this.x + this.WIDTH / 2,
        this.y,
        this.WIDTH / 2,
        Math.PI,
        0,
        true,
      );
    } else {
      context.arc(
        this.x + this.WIDTH / 2,
        this.y + this.HEIGHT,
        this.WIDTH / 2,
        0,
        Math.PI,
        true,
      );
    }
    context.closePath();
    context.fill();
    context.stroke();
  }
}
