import { GameObject } from "../../interfaces/game-object.js";

export class Car implements GameObject {
  protected readonly topSpeed: number = 5;
  protected speed: number = 0;
  protected readonly acceleration: number = 0.4;

  protected angle: number;
  protected readonly handling: number = 6;

  private x: number;
  private y: number;
  private canvas: HTMLCanvasElement;
  private vx: number = 0;
  private vy: number = 0;
  private readonly friction: number = 0.1;
  private readonly bounceMultiplier: number = 0.7;
  private readonly width: number = 50;
  private readonly height: number = 50;
  private carImage: HTMLImageElement | null = null;
  private imageLoaded: boolean = false;

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.canvas = canvas;
    this.loadCarImage();
  }

  public update(deltaTimeStamp: number): void {
    if (!this.imageLoaded) return;

    this.wrapAngle();
    this.applyFriction();
    this.calculateMovement();
  }

  public render(context: CanvasRenderingContext2D): void {
    if (!this.imageLoaded) return;

    context.save();
    context.translate(this.x + this.width / 2, this.y + this.height / 2);
    context.rotate(this.angle * Math.PI / 180);
    context.drawImage(
      this.carImage!,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );
    context.restore();
  }

  private loadCarImage(): void {
    this.carImage = new Image();
    this.carImage.onload = () => {
      this.imageLoaded = true;
    };
    this.carImage.src = "./images/car-local.png";
  }

  private wrapAngle(): void {
    this.angle = (this.angle + 360) % 360;
  }

  private applyFriction(): void {
    this.speed += -this.friction * Math.sign(this.speed);
  }

  private calculateMovement(): void {
    const angleInRadians = this.angle * Math.PI / 180;
    this.vx = Math.cos(angleInRadians) * this.speed;
    this.vy = Math.sin(angleInRadians) * this.speed;

    this.x -= this.vx;
    this.y -= this.vy;

    this.handleCanvasBounds();
  }

  private handleCanvasBounds(): void {
    const canvasBoundsX = this.canvas.width - this.width;
    const canvasBoundsY = this.canvas.height - this.height;

    if (this.x <= 0 || this.x >= canvasBoundsX) {
      this.x = Math.max(0, Math.min(this.x, canvasBoundsX));
      this.speed = Math.abs(this.speed) > this.topSpeed
        ? Math.sign(this.speed) * this.topSpeed
        : this.speed;
      this.speed = -this.speed * this.bounceMultiplier;
    }

    if (this.y <= 0 || this.y >= canvasBoundsY) {
      this.y = Math.max(0, Math.min(this.y, canvasBoundsY));
      this.speed = Math.abs(this.speed) > this.topSpeed
        ? Math.sign(this.speed) * this.topSpeed
        : this.speed;
      this.speed = -this.speed * this.bounceMultiplier;
    }
  }
}
