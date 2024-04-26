import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class GoalObject extends BaseGameObject implements GameObject {
  private readonly ORANGE_FILL_COLOR: string = "rgba(254, 118, 99, 0.5)";
  private readonly ORANGE_BORDER_COLOR: string = "rgba(254, 118, 99, 1)";

  private readonly BLUE_FILL_COLOR: string = "rgba(133, 222, 255, 0.5)";
  private readonly BLUE_BORDER_COLOR: string = "rgba(133, 222, 255, 1)";

  private readonly WIDTH: number = 200; // Width of the goal
  private readonly HEIGHT: number = 100; // Height of the goal
  private readonly BORDER_SIZE: number = 5; // Border size

  private x: number = 0;
  private y: number = 0;
  private fillColor: string;
  private borderColor: string;
  private removeTopBorder: boolean = false;
  private removeBottomBorder: boolean = false;

  constructor(top: boolean, canvas: HTMLCanvasElement) {
    super();

    if (top) {
      // Position goal at the top of the canvas
      this.y = 0;
      this.fillColor = this.ORANGE_FILL_COLOR;
      this.borderColor = this.ORANGE_BORDER_COLOR;
      this.removeTopBorder = true;
    } else {
      // Position goal at the bottom of the canvas
      this.y = canvas.height - this.HEIGHT;
      this.fillColor = this.BLUE_FILL_COLOR;
      this.borderColor = this.BLUE_BORDER_COLOR;
      this.removeBottomBorder = true;
    }

    // Calculate x position to center the goal horizontally
    this.x = (canvas.width - this.WIDTH) / 2;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // No update logic required
  }

  public render(context: CanvasRenderingContext2D): void {
    // Render the goal
    context.fillStyle = this.fillColor;
    context.fillRect(this.x, this.y, this.WIDTH, this.HEIGHT);

    // Render borders
    context.strokeStyle = this.borderColor;
    context.lineWidth = this.BORDER_SIZE;

    // Render top border if not removed
    if (!this.removeTopBorder) {
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.x + this.WIDTH, this.y);
      context.stroke();
    }

    // Render bottom border if not removed
    if (!this.removeBottomBorder) {
      context.beginPath();
      context.moveTo(this.x, this.y + this.HEIGHT);
      context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
      context.stroke();
    }

    // Render left border
    context.beginPath();
    context.moveTo(this.x, this.y);
    context.lineTo(this.x, this.y + this.HEIGHT);
    context.stroke();

    // Render right border
    context.beginPath();
    context.moveTo(this.x + this.WIDTH, this.y);
    context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
    context.stroke();

    // Render top left diagonal corner if top border is removed
    if (this.removeTopBorder) {
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.x + this.BORDER_SIZE, this.y + this.BORDER_SIZE);
      context.stroke();
    }

    // Render top right diagonal corner if top border is removed
    if (this.removeTopBorder) {
      context.beginPath();
      context.moveTo(this.x + this.WIDTH, this.y);
      context.lineTo(
        this.x + this.WIDTH - this.BORDER_SIZE,
        this.y + this.BORDER_SIZE,
      );
      context.stroke();
    }

    // Render bottom left diagonal corner if bottom border is removed
    if (this.removeBottomBorder) {
      context.beginPath();
      context.moveTo(this.x, this.y + this.HEIGHT);
      context.lineTo(
        this.x + this.BORDER_SIZE,
        this.y + this.HEIGHT - this.BORDER_SIZE,
      );
      context.stroke();
    }

    // Render bottom right diagonal corner if bottom border is removed
    if (this.removeBottomBorder) {
      context.beginPath();
      context.moveTo(this.x + this.WIDTH, this.y + this.HEIGHT);
      context.lineTo(
        this.x + this.WIDTH - this.BORDER_SIZE,
        this.y + this.HEIGHT - this.BORDER_SIZE,
      );
      context.stroke();
    }
  }
}
