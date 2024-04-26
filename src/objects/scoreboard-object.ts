import { BLUE_TEAM_COLOR, ORANGE_TEAM_COLOR } from "../constants/colors.js";
import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class ScoreboardObject extends BaseGameObject implements GameObject {
  private readonly BLUE_SCORE: number = 0;
  private readonly ORANGE_SCORE: number = 0;

  private readonly SQUARE_SIZE: number = 50;
  private readonly SPACE_BETWEEN: number = 5;
  private readonly TIME_BOX_WIDTH: number = 120;
  private readonly TIME_BOX_HEIGHT: number = 50;
  private readonly CORNER_RADIUS: number = 10;

  private readonly TEXT_COLOR: string = "white";
  private readonly FONT_SIZE: string = "32px";
  private readonly FONT_FAMILY: string = "monospace";

  private readonly TIME_TEXT_COLOR: string = "white";
  private readonly TIME_FONT_SIZE: string = "32px";

  private readonly BLUE_SHAPE_COLOR: string = BLUE_TEAM_COLOR;
  private readonly ORANGE_SHAPE_COLOR: string = ORANGE_TEAM_COLOR;
  private readonly SHAPE_FILL_COLOR: string = "white";

  private x: number;
  private y: number = 120;

  private active: boolean = false;
  private elapsedMilliseconds: number = 0;
  private durationMilliseconds: number = 0;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.x = this.canvas.width / 2;
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
    // Calculate total width
    const totalWidth =
      2 * this.SQUARE_SIZE + this.SPACE_BETWEEN + this.TIME_BOX_WIDTH;

    // Calculate starting x coordinate for rendering
    const startX = this.x - totalWidth / 2;

    // Render blue score square with rounded corners
    this.renderSquare(context, startX, this.BLUE_SHAPE_COLOR, this.BLUE_SCORE);

    // Render formatted time inside a rectangle with rounded corners
    const remainingTimeSeconds = Math.ceil(
      (this.durationMilliseconds - this.elapsedMilliseconds) / 1000
    );
    const formattedTime = this.formatTime(remainingTimeSeconds);
    const timeX = startX + this.SQUARE_SIZE + this.SPACE_BETWEEN;
    const timeY = this.y + (this.SQUARE_SIZE - this.TIME_BOX_HEIGHT) / 2; // Center the time box vertically
    this.renderTimeBox(
      context,
      timeX,
      timeY,
      this.TIME_BOX_WIDTH,
      this.TIME_BOX_HEIGHT,
      formattedTime
    );

    // Render orange score square with rounded corners
    const orangeScoreX =
      startX +
      this.SQUARE_SIZE +
      this.SPACE_BETWEEN +
      this.TIME_BOX_WIDTH +
      this.SPACE_BETWEEN;
    this.renderSquare(
      context,
      orangeScoreX,
      this.ORANGE_SHAPE_COLOR,
      this.ORANGE_SCORE
    );
  }

  private renderSquare(
    context: CanvasRenderingContext2D,
    x: number,
    color: string,
    score: number
  ): void {
    context.fillStyle = color;
    this.roundedRect(
      context,
      x,
      this.y,
      this.SQUARE_SIZE,
      this.SQUARE_SIZE,
      this.CORNER_RADIUS
    );
    context.fill();
    context.fillStyle = this.TEXT_COLOR;
    context.font = `${this.FONT_SIZE} ${this.FONT_FAMILY}`;
    context.fillText(
      score.toString(),
      x + this.SQUARE_SIZE / 2,
      this.y + this.SQUARE_SIZE / 2
    );
  }

  private renderTimeBox(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    text: string
  ): void {
    context.fillStyle = "black";
    this.roundedRect(context, x, y, width, height, this.CORNER_RADIUS);
    context.fill();
    context.fillStyle = this.TIME_TEXT_COLOR;
    context.font = `${this.TIME_FONT_SIZE} ${this.FONT_FAMILY}`;
    context.textAlign = "center";
    context.fillText(text, x + width / 2, y + height / 2);
  }

  // Helper method to draw rounded rectangle
  private roundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
  }

  private formatTime(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
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
