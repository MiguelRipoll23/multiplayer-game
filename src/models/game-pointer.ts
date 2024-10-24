export class GamePointer {
  private x: number = 0;
  private y: number = 0;

  private pressed: boolean = false;

  public getX(): number {
    return this.x;
  }

  public getY(): number {
    return this.y;
  }

  public setX(x: number): void {
    this.x = x;
  }

  public setY(y: number): void {
    this.y = y;
  }

  public isPressed(): boolean {
    return this.pressed;
  }

  public setPressed(pressed: boolean): void {
    this.pressed = pressed;
  }
}
