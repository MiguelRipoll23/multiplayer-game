import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";
import { PlayerObject } from "./player-object.js";

export class CarObject extends BaseGameObject implements GameObject {
  protected readonly TOP_SPEED: number = 5;
  protected readonly ACCELERATION: number = 0.4;
  protected readonly HANDLING: number = 6;

  protected readonly canvas: HTMLCanvasElement;
  protected speed: number = 0;
  protected angle: number;
  protected player: PlayerObject | null = null;

  private readonly FRICTION: number = 0.1;
  private readonly BOUNCE_MULTIPLIER: number = 0.7;
  private readonly WIDTH: number = 50;
  private readonly HEIGHT: number = 50;

  private x: number;
  private y: number;
  private vx: number = 0;
  private vy: number = 0;

  private carImage: HTMLImageElement | null = null;

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    super();

    this.x = x;
    this.y = y;
    this.angle = angle;
    this.canvas = canvas;
  }

  public override load(): void {
    this.loadCarImage();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.loaded === false) {
      return;
    }

    this.wrapAngle();
    this.applyFriction();
    this.calculateMovement();
  }

  public render(context: CanvasRenderingContext2D): void {
    if (this.loaded === false) {
      return;
    }

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
  }

  public setPlayerObject(player: PlayerObject): void {
    this.player = player;
  }

  private loadCarImage(): void {
    this.carImage = new Image();
    this.carImage.onload = () => {
      super.load();
    };

    this.carImage.src = "./images/car-local.png";
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
    const canvasBoundsX = this.canvas.width - this.WIDTH;
    const canvasBoundsY = this.canvas.height - this.HEIGHT;

    if (this.x <= 0 || this.x >= canvasBoundsX) {
      this.x = Math.max(0, Math.min(this.x, canvasBoundsX));
      this.speed = Math.abs(this.speed) > this.TOP_SPEED
        ? Math.sign(this.speed) * this.TOP_SPEED
        : this.speed;
      this.speed = -this.speed * this.BOUNCE_MULTIPLIER;
    }

    if (this.y <= 0 || this.y >= canvasBoundsY) {
      this.y = Math.max(0, Math.min(this.y, canvasBoundsY));
      this.speed = Math.abs(this.speed) > this.TOP_SPEED
        ? Math.sign(this.speed) * this.TOP_SPEED
        : this.speed;
      this.speed = -this.speed * this.BOUNCE_MULTIPLIER;
    }
  }
}
