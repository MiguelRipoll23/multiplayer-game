import { GamePointer } from "../../models/game-pointer.js";
import { BasePressableGameObject } from "../base/base-pressable-game-object.js";

export class CloseableMessageObject extends BasePressableGameObject {
  private readonly FILL_COLOR = "rgba(0, 0, 0, 0.8)";
  private readonly DEFAULT_HEIGHT = 100;
  private readonly DEFAULT_WIDTH = 340;

  private opacity = 0;

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

  public hide(): void {
    if (this.opacity === 0) {
      console.warn("CloseableMessageObject is already hidden");
      return;
    }

    this.active = false;
    this.opacity = 0;
  }

  public override handlePointerEvent(gamePointer: GamePointer): void {
    this.hide();

    super.handlePointerEvent(gamePointer);
  }

  public render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;
    this.drawRoundedRectangle(context);
    this.drawText(context);
    context.globalAlpha = this.opacity;
  }

  private setSize(): void {
    this.width = this.DEFAULT_WIDTH;
    this.height = this.DEFAULT_HEIGHT;
  }

  private drawRoundedRectangle(context: CanvasRenderingContext2D): void {
    context.fillStyle = this.FILL_COLOR;
    context.beginPath();
    context.moveTo(this.x + 6, this.y);
    context.arcTo(
      this.x + this.width,
      this.y,
      this.x + this.width,
      this.y + this.height,
      6,
    );
    context.arcTo(
      this.x + this.width,
      this.y + this.height,
      this.x,
      this.y + this.height,
      6,
    );
    context.arcTo(this.x, this.y + this.height, this.x, this.y, 6);
    context.arcTo(this.x, this.y, this.x + this.width, this.y, 6);
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
    this.x = this.canvas.width / 2 - (this.width / 2);
    this.y = this.canvas.height / 2 - (this.height / 2);
    this.textX = this.x + this.width / 2;
    this.textY = this.y + this.height / 2 + 5;
  }
}