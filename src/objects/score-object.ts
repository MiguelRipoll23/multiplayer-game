import {
  BLUE_TEAM_TRANSPARENCY_COLOR,
  RED_TEAM_TRANSPARENCY_COLOR,
} from "../constants/colors.js";
import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class ScoreObject extends BaseGameObject implements GameObject {
  private readonly TEXT_COLOR: string = "#FFFFFF"; // White text color
  private readonly FONT_SIZE: number = 62;
  private readonly DISTANCE_CENTER: number = 120;
  private readonly SQUARE_SIZE: number = 80;
  private readonly CORNER_RADIUS: number = 10;
  private readonly canvas: HTMLCanvasElement;
  private readonly blueTeam: boolean;
  private score: number = 0;
  private x: number = 0;
  private y: number = 0;
  private readonly SQUARE_FILL_COLOR: string; // Solid fill color

  constructor(blueTeam: boolean, canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.blueTeam = blueTeam;
    this.x = this.canvas.width / 2;
    this.y = this.canvas.height / 2;
    this.y = blueTeam
      ? this.y + this.DISTANCE_CENTER
      : this.y - this.DISTANCE_CENTER;
    this.SQUARE_FILL_COLOR = blueTeam
      ? BLUE_TEAM_TRANSPARENCY_COLOR
      : RED_TEAM_TRANSPARENCY_COLOR;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {}

  public render(context: CanvasRenderingContext2D): void {
    this.drawRoundedSquare(context);
    this.drawText(context);
  }

  private drawRoundedSquare(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.fillStyle = this.SQUARE_FILL_COLOR;
    context.strokeStyle = "transparent"; // No border
    const halfSquareSize = this.SQUARE_SIZE / 2;
    const halfCornerRadius = this.CORNER_RADIUS / 2;
    context.moveTo(
      this.x - halfSquareSize + halfCornerRadius,
      this.y - halfSquareSize
    );
    context.arcTo(
      this.x + halfSquareSize,
      this.y - halfSquareSize,
      this.x + halfSquareSize,
      this.y + halfSquareSize,
      this.CORNER_RADIUS
    );
    context.arcTo(
      this.x + halfSquareSize,
      this.y + halfSquareSize,
      this.x - halfSquareSize,
      this.y + halfSquareSize,
      this.CORNER_RADIUS
    );
    context.arcTo(
      this.x - halfSquareSize,
      this.y + halfSquareSize,
      this.x - halfSquareSize,
      this.y - halfSquareSize,
      this.CORNER_RADIUS
    );
    context.arcTo(
      this.x - halfSquareSize,
      this.y - halfSquareSize,
      this.x + halfSquareSize,
      this.y - halfSquareSize,
      this.CORNER_RADIUS
    );
    context.closePath();
    context.fill();
  }

  private drawText(context: CanvasRenderingContext2D): void {
    context.font = `${this.FONT_SIZE}px monospace`;
    context.fillStyle = this.TEXT_COLOR; // Use constant white text color
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(this.score.toString(), this.x, this.y);
  }

  public setScore(score: number) {
    this.score = score;
  }
}
