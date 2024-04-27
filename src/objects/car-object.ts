import { BOUNDS_MARGIN } from "../constants/map.js";
import { HitboxObject } from "./hitbox-object.js";
import { BaseCollidableGameObject } from "./base/base-collidable-game-object.js";
import { PlayerObject } from "./player-object.js";

export class CarObject extends BaseCollidableGameObject {
  protected readonly TOP_SPEED: number = 4;
  protected readonly ACCELERATION: number = 0.4;
  protected readonly HANDLING: number = 6;

  protected readonly canvas: HTMLCanvasElement;
  protected angle: number;
  protected speed: number = 0;
  protected playerObject: PlayerObject | null = null;

  private readonly IMAGE_PATH = "./images/car-local.png";

  private readonly WIDTH: number = 50;
  private readonly HEIGHT: number = 50;
  private readonly DISTANCE_CENTER: number = 220;
  private readonly FRICTION: number = 0.1;
  private readonly BOUNCE_MULTIPLIER: number = 0.7;

  private x: number;
  private y: number;
  private vx: number = 0;
  private vy: number = 0;

  private orangeTeam: boolean = false;

  private carImage: HTMLImageElement | null = null;

  constructor(
    x: number,
    y: number,
    angle: number,
    orangeTeam: boolean,
    canvas: HTMLCanvasElement,
  ) {
    super();

    this.x = x;
    this.y = y;
    this.angle = angle;
    this.orangeTeam = orangeTeam;
    this.canvas = canvas;
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

  public render(context: CanvasRenderingContext2D): void {
    context.save();
    context.translate(this.x + this.WIDTH / 2, this.y + this.HEIGHT / 2);
    context.rotate((this.angle * Math.PI) / 180);
    context.drawImage(
      this.carImage!,
      -this.WIDTH / 2,
      -this.HEIGHT / 2,
      this.WIDTH,
      this.HEIGHT,
    );
    context.restore();

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

  public setPlayerObject(playerObject: PlayerObject): void {
    this.playerObject = playerObject;
  }

  private createHitbox(): void {
    this.setHitbox(
      new HitboxObject(this.x, this.y, this.WIDTH, this.WIDTH),
    );
  }

  private updateHitbox(): void {
    this.getHitbox()?.setX(this.x);
    this.getHitbox()?.setY(this.y);
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
    this.speed += -this.FRICTION * Math.sign(this.speed);
  }

  private calculateMovement(): void {
    const angleInRadians = (this.angle * Math.PI) / 180;
    this.vx = Math.cos(angleInRadians) * this.speed;
    this.vy = Math.sin(angleInRadians) * this.speed;

    this.x -= this.vx;
    this.y -= this.vy;

    this.handleCanvasBounds();
  }

  private handleCanvasBounds(): void {
    const canvasBoundsX = this.canvas.width - this.WIDTH - BOUNDS_MARGIN;
    const canvasBoundsY = this.canvas.height - this.HEIGHT - BOUNDS_MARGIN;

    if (this.x <= BOUNDS_MARGIN || this.x >= canvasBoundsX) {
      this.x = Math.max(BOUNDS_MARGIN, Math.min(this.x, canvasBoundsX));
      this.speed = Math.abs(this.speed) > this.TOP_SPEED
        ? Math.sign(this.speed) * this.TOP_SPEED
        : this.speed;
      this.speed = -this.speed * this.BOUNCE_MULTIPLIER;
    }

    if (this.y <= BOUNDS_MARGIN || this.y >= canvasBoundsY) {
      this.y = Math.max(BOUNDS_MARGIN, Math.min(this.y, canvasBoundsY));
      this.speed = Math.abs(this.speed) > this.TOP_SPEED
        ? Math.sign(this.speed) * this.TOP_SPEED
        : this.speed;
      this.speed = -this.speed * this.BOUNCE_MULTIPLIER;
    }
  }
}
