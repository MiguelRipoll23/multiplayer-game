import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class CountdownObject extends BaseGameObject implements GameObject {
  private readonly DISTANCE_CENTER = 300;

  private readonly RECTANGLE = {
    WIDTH: 150,
    HEIGHT: 60,
    COLOR: "rgba(0, 0, 0, 0.5)",
    CORNER_RADIUS: 10,
  };

  private x: number = 0;
  private y: number = 0;

  private active = false;
  private elapsedMilliseconds = 0;
  private durationMilliseconds = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.setPosition();
  }

  private setPosition(): void {
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2 - this.DISTANCE_CENTER;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.active) {
      this.elapsedMilliseconds += deltaTimeStamp;
      if (this.elapsedMilliseconds >= this.durationMilliseconds) {
        this.stopCountdown();
      }
    }
  }

  public render(context: CanvasRenderingContext2D): void {
    const remainingTimeSeconds = Math.ceil(
      (this.durationMilliseconds - this.elapsedMilliseconds) / 1000
    );
    const formattedTime = this.formatTime(remainingTimeSeconds);

    this.drawRoundedRectangle(context);
    this.drawText(context, formattedTime);
  }

  private formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  private drawRoundedRectangle(context: CanvasRenderingContext2D): void {
    const { WIDTH, HEIGHT, COLOR, CORNER_RADIUS } = this.RECTANGLE;
    const x0 = this.x - WIDTH / 2;
    const y0 = this.y - HEIGHT / 2;

    context.fillStyle = COLOR;
    context.beginPath();
    context.moveTo(x0 + CORNER_RADIUS, y0);
    context.arcTo(x0 + WIDTH, y0, x0 + WIDTH, y0 + HEIGHT, CORNER_RADIUS);
    context.arcTo(x0 + WIDTH, y0 + HEIGHT, x0, y0 + HEIGHT, CORNER_RADIUS);
    context.arcTo(x0, y0 + HEIGHT, x0, y0, CORNER_RADIUS);
    context.arcTo(x0, y0, x0 + WIDTH, y0, CORNER_RADIUS);
    context.closePath();
    context.fill();
  }

  private drawText(context: CanvasRenderingContext2D, text: string): void {
    context.font = "42px monospace";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, this.x, this.y);
  }

  public startCountdown(durationSeconds: number): void {
    this.durationMilliseconds = durationSeconds * 1000;
    this.active = true;
  }

  public stopCountdown(): void {
    this.active = false;
  }

  public resetCountdown(): void {
    this.elapsedMilliseconds = 0;
  }
}
