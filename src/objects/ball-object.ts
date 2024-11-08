import { HitboxObject } from "./common/hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
import { PlayerObject } from "./player-object.js";
import { CarObject } from "./car-object.js";

export class BallObject extends BaseDynamicCollidableGameObject {
  private readonly MASS: number = 1;
  private readonly RADIUS: number = 20;
  private readonly FRICTION: number = 0.01;
  private radius: number = this.RADIUS;

  private inactive: boolean = false;
  private elapsedInactiveMilliseconds: number = 0;

  private lastPlayerObject: PlayerObject | null = null;

  constructor(
    x: number,
    y: number,
    private readonly canvas: HTMLCanvasElement
  ) {
    super();
    this.x = x;
    this.y = y;
    this.mass = this.MASS;
  }

  public override load(): void {
    this.createHitbox();
    super.load();
  }

  public reset() {
    this.vx = 0;
    this.vy = 0;
    this.radius = this.RADIUS;
    this.setCenterPosition();
    this.elapsedInactiveMilliseconds = 0;
    this.inactive = false;
  }

  public setCenterPosition(): void {
    // Set position to the center of the canvas accounting for the radius
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
  }

  public isInactive(): boolean {
    return this.inactive;
  }

  public setInactive(): void {
    this.inactive = true;
    this.vx = -this.vx * 2;
    this.vy = -this.vy * 2;
  }

  public getLastPlayerObject(): PlayerObject | null {
    return this.lastPlayerObject;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.applyFriction();
    this.calculateMovement();
    this.updateHitbox();
    this.handlePlayerCollision();
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save(); // Save the current context state

    // Draw the gradient ball
    this.drawBallWithGradient(context);

    // If the ball is inactive, apply glow effect
    if (this.inactive) {
      this.applyGlowEffect(context);
      this.drawBallWithGlow(context);
    }

    // Restore the context state
    context.restore();

    // Render debug information if enabled
    if (this.debug) {
      this.renderDebugInformation(context);
    }

    // Hitbox render (from superclass)
    super.render(context);
  }

  // Function to create and draw the gradient ball
  private drawBallWithGradient(context: CanvasRenderingContext2D): void {
    const gradient = this.createGradient(context);
    context.beginPath();
    context.fillStyle = gradient;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();
  }

  // Function to create the radial gradient
  private createGradient(context: CanvasRenderingContext2D): CanvasGradient {
    const gradient = context.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Inner color (white)
    gradient.addColorStop(1, "rgba(200, 200, 200, 1)"); // Outer color (light gray)
    return gradient;
  }

  // Function to apply the glow effect when the ball is inactive
  private applyGlowEffect(context: CanvasRenderingContext2D): void {
    context.shadowColor = "rgba(255, 215, 0, 1)"; // Glow color (golden yellow)
    context.shadowBlur = 25; // Glow intensity
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
  }

  // Function to draw the ball with the glow effect
  private drawBallWithGlow(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();
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

  private applyFriction(): void {
    this.vx *= 1 - this.FRICTION;
    this.vy *= 1 - this.FRICTION;
  }

  private calculateMovement(): void {
    this.x -= this.vx;
    this.y -= this.vy;
  }

  private updateHitbox(): void {
    this.getHitboxObjects().forEach((object) => {
      object.setX(this.x - this.RADIUS);
      object.setY(this.y - this.RADIUS);
    });
  }

  private handlePlayerCollision(): void {
    this.getCollidingObjects().forEach((object) => {
      if (object instanceof CarObject) {
        this.lastPlayerObject = object.getPlayerObject();
      }
    });
  }

  private renderDebugInformation(context: CanvasRenderingContext2D) {
    this.renderLastPlayerTouched(context);
  }

  private renderLastPlayerTouched(context: CanvasRenderingContext2D) {
    const playerName = this.lastPlayerObject?.getName() ?? "none";

    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.fillRect(24, 96, 160, 20);
    context.fillStyle = "blue";
    context.font = "12px system-ui";
    context.textAlign = "left";
    context.fillText(`Last Touch: ${playerName}`, 30, 110);
  }
}
