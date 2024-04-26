import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class GoalObject extends BaseGameObject implements GameObject {
  private readonly RED_FILL_COLOR: string = "#EF5350";
  private readonly BLUE_FILL_COLOR: string = "#42A5F5";
  private readonly LINE_BORDER_COLOR: string = "#fff";

  private readonly WIDTH: number = 100; // Width of the goal
  private readonly HEIGHT: number = 40; // Height of the goal (adjusted)
  private readonly BORDER_SIZE: number = 2; // Border size
  private readonly Y_OFFSET: number = 13;

  private x: number = 0;
  private y: number = 0;
  private fillColor: string;
  private borderColor: string;
  private blueTeam: boolean;

  constructor(blueTeam: boolean, canvas: HTMLCanvasElement) {
    super();
    this.blueTeam = blueTeam;
    this.borderColor = this.LINE_BORDER_COLOR;

    if (blueTeam) {
      // Position goal at the bottom of the canvas
      this.y = canvas.height - this.HEIGHT - this.Y_OFFSET;
      this.fillColor = this.BLUE_FILL_COLOR;
    } else {
      // Position goal at the top of the canvas
      this.y = this.Y_OFFSET;
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
    context.rect(this.x, this.y, this.WIDTH, this.HEIGHT);
    context.closePath();
    context.fill();

    // Draw left border
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x, this.y + this.HEIGHT);
    context.closePath();
    context.stroke();

    // Draw right border
    context.beginPath();
    context.moveTo(this.x + this.WIDTH, this.y);
    context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
    context.closePath();
    context.stroke();

    // Determine which border to remove
    if (this.blueTeam) {
      // Remove bottom border for blue team
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.x + this.WIDTH, this.y);
      context.closePath();
      context.stroke();
    } else {
      // Remove top border for red team
      context.beginPath();
      context.moveTo(this.x, this.y + this.HEIGHT);
      context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
      context.closePath();
      context.stroke();
    }
  }
}
