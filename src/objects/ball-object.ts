import { HitboxObject } from "./hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-dynamic-collidable-game-object.js";

export class BallObject extends BaseDynamicCollidableGameObject {
  private readonly MASS: number = 1;
  private readonly RADIUS: number = 20; // Define the radius
  private readonly BALL_COLOR_LIGHT: string = "#ffffff"; // Light color
  private readonly BALL_COLOR_DARK: string = "#cccccc"; // Dark color

  private readonly canvas: HTMLCanvasElement;
  private readonly centerX: number;
  private readonly centerY: number;

  constructor(x: number, y: number, canvas: HTMLCanvasElement) {
    super();
    this.x = x;
    this.y = y;
    this.canvas = canvas;

    this.mass = this.MASS;
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height / 2;
  }

  public override load(): void {
    this.createHitbox();
    super.load();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.updateHitbox();
    this.calculateMovement();
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save(); // Save the current context state

    // Draw the football ball
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.RADIUS);
    gradient.addColorStop(0, this.BALL_COLOR_LIGHT); // Light color
    gradient.addColorStop(1, this.BALL_COLOR_DARK); // Dark color
    context.fillStyle = gradient;

    context.beginPath();
    context.arc(this.x, this.y, this.RADIUS, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    // Restore the context state
    context.restore();

    // Hitbox render
    super.render(context);
  }

  public setCenterPosition(): void {
    // Set position to the center of the canvas accounting for the radius
    this.x = this.centerX;
    this.y = this.centerY;
  }

  private createHitbox(): void {
    const hitboxObject = new HitboxObject(
      this.x - this.RADIUS * 2,
      this.y - this.RADIUS * 2,
      this.RADIUS * 2,
      this.RADIUS * 2
    );

    this.setHitboxObjects([hitboxObject]);
  }

  private updateHitbox(): void {
    this.getHitboxObjects().forEach((object) => {
      object.setX(this.x - this.RADIUS);
      object.setY(this.y - this.RADIUS);
    });
  }

  private calculateMovement(): void {
    this.x -= this.vx;
    this.y -= this.vy;
  }
}
