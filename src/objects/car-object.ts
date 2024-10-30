import { HitboxObject } from "./common/hitbox-object.js";
import { PlayerObject } from "./player-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";

export class CarObject extends BaseDynamicCollidableGameObject {
  protected readonly TOP_SPEED: number = 4;
  protected readonly ACCELERATION: number = 0.4;
  protected readonly HANDLING: number = 6;

  protected speed: number = 0;
  protected playerObject: PlayerObject | null = null;

  private readonly IMAGE_PATH = "./images/car-local.png";

  private readonly MASS: number = 500;
  private readonly WIDTH: number = 50;
  private readonly HEIGHT: number = 50;
  private readonly DISTANCE_CENTER: number = 220;
  private readonly FRICTION: number = 0.1;
  private readonly BOUNCE_MULTIPLIER: number = 0.7;

  private orangeTeam: boolean = false;

  private carImage: HTMLImageElement | null = null;

  constructor(
    x: number,
    y: number,
    angle: number,
    orangeTeam: boolean,
    private readonly canvas: HTMLCanvasElement
  ) {
    super();
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.orangeTeam = orangeTeam;
    this.mass = this.MASS;
  }

  public override load(): void {
    this.createHitbox();
    this.loadCarImage();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.wrapAngle();
    this.applyFriction();
    this.calculateMovement();
    this.updateHitbox();
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();

    context.translate(this.x + this.WIDTH / 2, this.y + this.HEIGHT / 2);
    context.rotate((this.angle * Math.PI) / 180);
    context.drawImage(
      this.carImage!,
      -this.WIDTH / 2,
      -this.HEIGHT / 2,
      this.WIDTH,
      this.HEIGHT
    );

    context.restore();

    // Debug
    this.renderDebugInformation(context);

    // Hitbox debug
    super.render(context);
  }

  public setCenterPosition(): void {
    this.x = this.canvas.width / 2 - this.WIDTH / 2;
    this.y = this.canvas.height / 2 - this.HEIGHT / 2;

    if (this.orangeTeam) {
      this.y -= this.DISTANCE_CENTER;
    } else {
      this.y += this.DISTANCE_CENTER;
    }
  }

  public getPlayerObject(): PlayerObject | null {
    return this.playerObject;
  }

  public setPlayerObject(playerObject: PlayerObject): void {
    this.playerObject = playerObject;
  }

  private createHitbox(): void {
    this.setHitboxObjects([
      new HitboxObject(this.x, this.y, this.WIDTH, this.WIDTH),
    ]);
  }

  private updateHitbox(): void {
    this.getHitboxObjects().forEach((object) => {
      object.setX(this.x);
      object.setY(this.y);
    });
  }

  private loadCarImage(): void {
    this.carImage = new Image();
    this.carImage.onload = () => {
      super.load();
    };

    this.carImage.src = this.IMAGE_PATH;
  }

  private wrapAngle(): void {
    this.angle = (this.angle + 360) % 360;
  }

  private applyFriction(): void {
    if (this.isColliding()) {
      // We don't want the car to stop if is colliding
      // otherwise it would became stuck
      return;
    }

    if (this.speed !== 0) {
      if (Math.abs(this.speed) <= this.FRICTION) {
        this.speed = 0; // If friction would stop the car, set speed to 0
      } else {
        this.speed += -Math.sign(this.speed) * this.FRICTION;
      }
    }
  }

  private calculateMovement(): void {
    if (this.isColliding()) {
      this.speed *= -1;
    }

    const angleInRadians = (this.angle * Math.PI) / 180;
    this.vx = Math.cos(angleInRadians) * this.speed;
    this.vy = Math.sin(angleInRadians) * this.speed;

    this.x -= this.vx;
    this.y -= this.vy;
  }

  private renderDebugInformation(context: CanvasRenderingContext2D) {
    if (this.debug === false) {
      return;
    }

    this.renderDebugPositionInformation(context);
    this.renderDebugAngleInformation(context);
    this.renderDebugIsOutsideBounds(context);
  }

  private renderDebugPositionInformation(context: CanvasRenderingContext2D) {
    const displayX = Math.round(this.x);
    const displayY = Math.round(this.y);

    const text = `Position: X(${displayX}) Y(${displayY})`;

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 24, 85, 10);
    context.fillStyle = "#FFFF00";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText(text, 28, 32);
  }

  private renderDebugAngleInformation(context: CanvasRenderingContext2D) {
    const displayAngle = Math.round(this.angle);

    const text = `Angle: ${displayAngle}`;

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 36, 45, 10);
    context.fillStyle = "#FFFF00";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText(text, 28, 44);
  }

  private renderDebugIsOutsideBounds(context: CanvasRenderingContext2D) {
    const outsideBounds =
      this.x < 0 ||
      this.x > this.canvas.width ||
      this.y < 0 ||
      this.y > this.canvas.height;

    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.fillRect(24, 48, 85, 10);
    context.fillStyle = "purple";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText("Outside Bounds: " + outsideBounds, 28, 56);
  }
}
