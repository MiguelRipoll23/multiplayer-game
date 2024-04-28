import { HitboxObject } from "./hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-dynamic-collidable-game-object.js";

export class BallObject extends BaseDynamicCollidableGameObject {
  private readonly MASS: number = 1;
  private readonly RADIUS: number = 20; // Define the radius
  private readonly FRICTION: number = 0.01;
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
    this.applyFriction();
    this.calculateMovement();
    this.updateHitbox();
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save(); // Save the current context state

    // Set up gradient
    const gradient = context.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.RADIUS,
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Inner color (white)
    gradient.addColorStop(1, "rgba(200, 200, 200, 1)"); // Outer color (light gray)

    // Draw the football ball with gradient
    context.beginPath();
    context.fillStyle = gradient;
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
      this.RADIUS * 2,
    );

    this.setHitboxObjects([hitboxObject]);
  }

  private calculateMovement(): void {
    this.x -= this.vx;
    this.y -= this.vy;
  }

  private applyFriction(): void {
    this.vx *= 1 - this.FRICTION;
    this.vy *= 1 - this.FRICTION;
  }

  private updateHitbox(): void {
    this.getHitboxObjects().forEach((object) => {
      object.setX(this.x - this.RADIUS);
      object.setY(this.y - this.RADIUS);
    });
  }
}
