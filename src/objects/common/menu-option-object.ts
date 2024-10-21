import { ORANGE_TEAM_COLOR } from "../../constants/colors-constants.js";
import { BasePressableGameObject } from "../base/base-pressable-game-object.js";

export class MenuOptionObject extends BasePressableGameObject {
  private index: number = 0;
  private content: string = "Unknown";

  private radius = 15;
  private textX = 0;
  private textY = 0;

  constructor(
    canvas: HTMLCanvasElement,
    index: number,
    content: string,
  ) {
    super();
    this.index = index;
    this.content = content.toUpperCase();
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

  public override render(context: CanvasRenderingContext2D): void {
    context.fillStyle = ORANGE_TEAM_COLOR;

    context.beginPath();
    context.moveTo(this.x + this.radius, this.y);
    context.lineTo(this.x + this.width - this.radius, this.y);
    context.quadraticCurveTo(
      this.x + this.width,
      this.y,
      this.x + this.width,
      this.y + this.radius,
    );
    context.lineTo(this.x + this.width, this.y + this.height - this.radius);
    context.quadraticCurveTo(
      this.x + this.width,
      this.y + this.height,
      this.x + this.width - this.radius,
      this.y + this.height,
    );
    context.lineTo(this.x + this.radius, this.y + this.height);
    context.quadraticCurveTo(
      this.x,
      this.y + this.height,
      this.x,
      this.y + this.height - this.radius,
    );
    context.lineTo(this.x, this.y + this.radius);
    context.quadraticCurveTo(this.x, this.y, this.x + this.radius, this.y);
    context.closePath();
    context.fill();

    // Set text properties
    context.fillStyle = "#FFFFFF"; // White color for the text
    context.font = "bold 28px system-ui"; // Adjust font size and family as needed
    context.textAlign = "center";

    // Draw the text
    context.fillText(this.content, this.textX, this.textY);

    super.render(context);
  }

  private setSize(canvas: HTMLCanvasElement): void {
    this.width = canvas.width - 60;
    this.height = 120;
  }

  private calculateTextPosition(): void {
    this.textX = this.x + this.width / 2 + 8;
    this.textY = this.y + this.height / 2 + 8;
  }
}
