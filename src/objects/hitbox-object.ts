import { BaseGameObject } from "./base/base-game-object.js";

export class HitboxObject extends BaseGameObject {
  private DEBUG_MODE: boolean = false;

  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private colliding: boolean = false;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  public setX(x: number): void {
    this.x = x;
  }

  public getX(): number {
    return this.x;
  }

  public setY(y: number): void {
    this.y = y;
  }

  public getY(): number {
    return this.y;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }

  public isColliding(): boolean {
    return this.colliding;
  }

  public setColliding(colliding: boolean): void {
    this.colliding = colliding;
  }

  public render(context: CanvasRenderingContext2D): void {
    if (this.DEBUG_MODE === false) {
      return;
    }

    context.save();

    context.strokeStyle = "rgba(148, 0, 211, 0.2)";
    context.strokeRect(this.x, this.y, this.width, this.height);

    if (this.colliding) {
      // Fill with transparent purple
      context.fillStyle = "rgba(148, 0, 211, 0.5)"; // Adjust alpha value for transparency
      context.fillRect(this.x, this.y, this.width, this.height);
    }

    context.restore();
  }
}
