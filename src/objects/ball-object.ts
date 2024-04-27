import { HitboxObject } from "./hitbox-object.js";
import { BaseCollidableGameObject } from "./base/base-collidable-game-object.js";

export class BallObject extends BaseCollidableGameObject {
  private x: number;
  private y: number;
  private angle: number;
  private readonly canvas: HTMLCanvasElement;
  private readonly RADIUS: number = 20; // Define the radius
  private readonly CENTER_X: number;
  private readonly CENTER_Y: number;
  private readonly BALL_COLOR_LIGHT: string = "#ffffff"; // Light color
  private readonly BALL_COLOR_DARK: string = "#cccccc"; // Dark color

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    super();
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.canvas = canvas;
    this.CENTER_X = this.canvas.width / 2;
    this.CENTER_Y = this.canvas.height / 2;
  }

  public override load(): void {
    this.createHitbox();
    super.load();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.updateHitbox();
  }

  public render(context: CanvasRenderingContext2D): void {
    context.save(); // Save the current context state

    // Translate context to ball position
    context.translate(this.x, this.y);

    // Rotate context by the angle
    context.rotate(this.angle);

    // Draw the football ball
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.RADIUS);
    gradient.addColorStop(0, this.BALL_COLOR_LIGHT); // Light color
    gradient.addColorStop(1, this.BALL_COLOR_DARK); // Dark color
    context.fillStyle = gradient;

    context.beginPath();
    context.arc(0, 0, this.RADIUS, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    // Restore the context state
    context.restore();

    // Hitbox render
    super.render(context);
  }

  public setCenterPosition(): void {
    // Set position to the center of the canvas accounting for the radius
    this.x = this.CENTER_X;
    this.y = this.CENTER_Y;
  }

  private createHitbox(): void {
    this.setHitbox(
      new HitboxObject(
        this.x - this.RADIUS * 2,
        this.y - this.RADIUS * 2,
        this.RADIUS * 2,
        this.RADIUS * 2,
      ),
    );
  }

  private updateHitbox(): void {
    this.getHitbox()?.setX(this.x - this.RADIUS);
    this.getHitbox()?.setY(this.y - this.RADIUS);
  }
}
