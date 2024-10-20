import { PressableBaseGameObject } from "../base/pressable-game-object.js";

export class MenuOptionObject extends PressableBaseGameObject {
  private index: number;

  private textX = 0;
  private textY = 0;

  private text: string;

  constructor(
    canvas: HTMLCanvasElement,
    index: number,
    text: string,
  ) {
    super(canvas);
    this.index = index;
    this.text = text.toUpperCase();
    this.setSize(canvas);
  }

  public getIndex(): number {
    return this.index;
  }

  public getHeight(): number {
    return this.height;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;

    this.calculateTextPosition();
  }

  public handleMouseUp(event: MouseEvent): void {
    super.handleMouseUp(event);
  }

  public override render(context: CanvasRenderingContext2D): void {
    // Draw rectangle with gradient
    context.fillStyle = "black"; // Black color for the rectangle
    context.fillRect(this.x, this.y, this.width, this.height);

    // Set text properties
    context.fillStyle = "#FFFFFF"; // White color for the text
    context.font = "bold 28px system-ui"; // Adjust font size and family as needed
    context.textAlign = "center";

    // Draw the text
    context.fillText(this.text, this.textX, this.textY);

    super.render(context);
  }

  private setSize(canvas: HTMLCanvasElement): void {
    this.width = canvas.width - 70;
    this.height = 120;
  }

  private calculateTextPosition(): void {
    this.textX = this.x + this.width / 2 + 8;
    this.textY = this.y + this.height / 2 + 8;
  }
}
