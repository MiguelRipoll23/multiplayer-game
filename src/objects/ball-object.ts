import { HitboxObject } from "./common/hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
import { PlayerObject } from "./player-object.js";
import { CarObject } from "./car-object.js";

export class BallObject extends BaseDynamicCollidableGameObject {
  private readonly MASS: number = 1;
  private readonly RADIUS: number = 20;
  private readonly FRICTION: number = 0.01;
  private readonly INACTIVE_DURATION_MILLISECONDS: number = 5_000;
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

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.handleInactiveState(deltaTimeStamp);
    this.applyFriction();
    this.calculateMovement();
    this.updateHitbox();
    this.handlePlayerCollision();
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
      this.radius
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Inner color (white)
    gradient.addColorStop(1, "rgba(200, 200, 200, 1)"); // Outer color (light gray)

    // Draw the football ball with gradient
    context.beginPath();
    context.fillStyle = gradient;
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    // Restore the context state
    context.restore();

    if (this.debug) {
      this.renderDebugInformation(context);
    }

    // Hitbox render
    super.render(context);
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

  private createHitbox(): void {
    const hitboxObject = new HitboxObject(
      this.x - this.RADIUS * 2,
      this.y - this.RADIUS * 2,
      this.RADIUS * 2,
      this.RADIUS * 2
    );

    this.setHitboxObjects([hitboxObject]);
  }

  private handleInactiveState(deltaTimeStamp: DOMHighResTimeStamp) {
    if (this.inactive) {
      this.elapsedInactiveMilliseconds += deltaTimeStamp;
      this.radius += 1;

      if (
        this.elapsedInactiveMilliseconds > this.INACTIVE_DURATION_MILLISECONDS
      ) {
        this.resetBallState();
      }
    }
  }

  private resetBallState() {
    this.vx = 0;
    this.vy = 0;
    this.radius = this.RADIUS;
    this.setCenterPosition();
    this.elapsedInactiveMilliseconds = 0;
    this.inactive = false;
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
    context.fillRect(24, 72, 120, 10);
    context.fillStyle = "blue";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText(`Last Ball Player: ${playerName}`, 28, 80);
  }
}
