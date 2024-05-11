import {
  BLUE_TEAM_TRANSPARENCY_COLOR,
  ORANGE_TEAM_TRANSPARENCY_COLOR,
} from "../constants/colors-constants.js";
import { HitboxObject } from "./hitbox-object.js";
import { BaseStaticCollidableGameObject } from "./base/base-static-collidable-game-object.js";

export class GoalObject extends BaseStaticCollidableGameObject {
  private readonly WIDTH: number = 100; // Width of the goal
  private readonly HEIGHT: number = 40; // Height of the goal (adjusted)
  private readonly BORDER_SIZE: number = 2; // Border size
  private readonly BORDER_COLOR: string = "#fff";
  private readonly Y_OFFSET: number = 13;

  private fillColor: string;
  private orangeTeam: boolean;

  constructor(orangeTeam: boolean, canvas: HTMLCanvasElement) {
    super();

    this.orangeTeam = orangeTeam;
    this.crossable = true;

    if (orangeTeam) {
      // Position goal at the top of the canvas
      this.y = this.Y_OFFSET;
      this.fillColor = ORANGE_TEAM_TRANSPARENCY_COLOR;
    } else {
      // Position goal at the bottom of the canvas
      this.y = canvas.height - this.HEIGHT - this.Y_OFFSET;
      this.fillColor = BLUE_TEAM_TRANSPARENCY_COLOR;
    }

    // Calculate x position to center the goal horizontally
    this.x = (canvas.width - this.WIDTH) / 2;
  }

  public override load(): void {
    this.createHitbox();
    super.load();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // No update logic required
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.fillColor;
    context.strokeStyle = this.BORDER_COLOR;
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
    if (this.orangeTeam) {
      // Remove top border for orange team
      context.beginPath();
      context.moveTo(this.x, this.y + this.HEIGHT);
      context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
      context.closePath();
      context.stroke();
    } else {
      // Remove bottom border for blue team
      context.beginPath();
      context.moveTo(this.x, this.y);
      context.lineTo(this.x + this.WIDTH, this.y);
      context.closePath();
      context.stroke();
    }

    // Hitbox
    super.render(context);
  }

  private createHitbox(): void {
    const y = this.orangeTeam ? this.y + 1 : this.y + this.HEIGHT / 2;

    this.setHitboxObjects([
      new HitboxObject(this.x + 2, y, this.WIDTH - 4, this.HEIGHT / 2),
    ]);
  }
}
