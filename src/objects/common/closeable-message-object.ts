import { BasePressableGameObject } from "../base/base-pressable-game-object.js";

export class CloseableMessageObject extends BasePressableGameObject {
  private readonly FILL_COLOR = "rgba(0, 0, 0, 0.8)";

  private readonly DEFAULT_HEIGHT = 100;
  private readonly DEFAULT_WIDTH = 340;

  private opacity = 0;

  private messageX = 0;
  private messageY = 0;

  private messageWidth = this.DEFAULT_WIDTH;
  private messageHeight = this.DEFAULT_HEIGHT;

  private textX = 0;
  private textY = 0;

  private content = "Unknown";

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.active = false;
    this.setSize();
    this.setPosition();
  }

  public show(value: string): void {
    this.content = value;
    this.setPosition();
    this.opacity = 1;
    this.active = true;
  }

  public close(): void {
    if (this.opacity === 0) {
      return console.warn("CloseableMessageObject is already closed");
    }

    this.active = false;
    this.opacity = 0;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.pressed) {
      this.close();
    }

    super.update(deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;
    this.drawRoundedRectangle(context);
    this.drawText(context);
    context.globalAlpha = this.opacity;

    super.render(context);
  }

  private setSize(): void {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  private drawRoundedRectangle(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.FILL_COLOR;
    context.beginPath();
    context.moveTo(this.messageX + 6, this.messageY);
    context.arcTo(
      this.messageX + this.messageWidth,
      this.messageY,
      this.messageX + this.messageWidth,
      this.messageY + this.messageHeight,
      6,
    );
    context.arcTo(
      this.messageX + this.messageWidth,
      this.messageY + this.messageHeight,
      this.messageX,
      this.messageY + this.messageHeight,
      6,
    );
    context.arcTo(
      this.messageX,
      this.messageY + this.messageHeight,
      this.messageX,
      this.messageY,
      6,
    );
    context.arcTo(
      this.messageX,
      this.messageY,
      this.messageX + this.messageWidth,
      this.messageY,
      6,
    );
    context.closePath();
    context.fill();
  }

  private drawText(context: CanvasRenderingContext2D): void {
    context.font = "16px Arial";
    context.fillStyle = "WHITE";
    context.textAlign = "center";
    context.fillText(this.content, this.textX, this.textY);
  }

  private setPosition(): void {
    this.messageX = this.canvas.width / 2 - (this.messageWidth / 2);
    this.messageY = this.canvas.height / 2 - (this.messageHeight / 2);
    this.textX = this.messageX + this.messageWidth / 2;
    this.textY = this.messageY + this.messageHeight / 2 + 5;
  }
}
