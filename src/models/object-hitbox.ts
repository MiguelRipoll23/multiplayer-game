export class ObjectHitbox {
  private x: number;
  private y: number;
  private width: number;
  private height: number;

  constructor(x: number, y: number, width: number, height: number) {
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

  public render(context: CanvasRenderingContext2D): void {
    context.save(); // Save the current context state

    context.strokeStyle = "#ff0000"; // Red color
    context.strokeRect(this.x, this.y, this.width, this.height);

    context.restore(); // Restore the context state
  }
}
