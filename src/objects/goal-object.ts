import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class GoalObject extends BaseGameObject implements GameObject {
  private readonly RED_FILL_COLOR: string = "#EF5350";
  private readonly BLUE_FILL_COLOR: string = "#42A5F5";
  private readonly LNE_BORDER_COLOR: string = "#fff";

  private readonly WIDTH: number = 200; // Width of the goal
  private readonly HEIGHT: number = 0; // Height of the goal
  private readonly BORDER_SIZE: number = 2; // Border size
  private readonly Y_OFSSET: number = 12;

  private x: number = 0;
  private y: number = 0;
  private fillColor: string;
  private borderColor: string;
  private blueTeam: boolean; // New property to save whether the goal is at the top

  constructor(blueTeam: boolean, canvas: HTMLCanvasElement) {
    super();
    this.blueTeam = blueTeam;
    this.borderColor = this.LNE_BORDER_COLOR;

    if (blueTeam) {
      // Position goal at the bottom of the canvas
      this.y = canvas.height - this.HEIGHT - this.Y_OFSSET;
      this.fillColor = this.BLUE_FILL_COLOR;
    } else {
      // Position goal at the top of the canvas
      this.y = this.Y_OFSSET;
      this.fillColor = this.RED_FILL_COLOR;
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
    if (this.blueTeam) {
      context.arc(
        this.x + this.WIDTH / 2,
        this.y + this.HEIGHT,
        this.WIDTH / 2,
        0,
        Math.PI,
        true
      );
    } else {
      context.arc(
        this.x + this.WIDTH / 2,
        this.y,
        this.WIDTH / 2,
        Math.PI,
        0,
        true
      );
    }
    context.closePath();
    context.fill();
    context.stroke();
  }
}
