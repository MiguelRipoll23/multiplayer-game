import { HitboxObject } from "./common/hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
import { PlayerObject } from "./player-object.js";
import { CarObject } from "./car-object.js";
import { MultiplayerGameObject } from "./interfaces/multiplayer-game-object.js";
import { SyncableType } from "../services/object-orchestrator-service.js";

export class BallObject
  extends BaseDynamicCollidableGameObject
  implements MultiplayerGameObject
{
  private readonly MASS: number = 1;
  private readonly RADIUS: number = 20;
  private readonly FRICTION: number = 0.01;
  private radius: number = this.RADIUS;

  private inactive: boolean = false;
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
    this.setSyncableValues();
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

  public override serialize(): Uint8Array {
    const buffer = new ArrayBuffer(17);
    const view = new DataView(buffer);

    // x, y, vx, vy (4 bytes each)
    view.setFloat32(0, this.x, true);
    view.setFloat32(4, this.y, true);
    view.setFloat32(8, this.vx, true);
    view.setFloat32(12, this.vy, true);

    // inactive (1 byte)
    view.setUint8(16, this.inactive ? 1 : 0);

    return new Uint8Array(buffer);
  }

  public override synchronize(data: Uint8Array): void {
    const view = new DataView(data.buffer);

    this.x = view.getFloat32(0, true);
    this.y = view.getFloat32(4, true);
    this.vx = view.getFloat32(8, true);
    this.vy = view.getFloat32(12, true);
    this.inactive = view.getUint8(16) === 1;

    this.updateHitbox();
  }

  private setSyncableValues() {
    this.setSyncableId("94c58aa0-41c3-4b22-825a-15a3834be240");
    this.setSyncableTypeId(SyncableType.Ball);
    this.setSyncableByHost(true);
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
