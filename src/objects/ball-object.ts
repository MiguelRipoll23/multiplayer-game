import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class BallObject extends BaseGameObject implements GameObject {
  private x: number;
  private y: number;
  private angle: number;
  protected readonly canvas: HTMLCanvasElement;
  private readonly RADIUS: number = 20; // Define the radius
  private readonly CENTER_X: number;
  private readonly CENTER_Y: number;
  private readonly BALL_COLOR_LIGHT: string = "#ffffff"; // Light color
  private readonly BALL_COLOR_DARK: string = "#cccccc"; // Dark color

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    super();
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.canvas = canvas;
    this.CENTER_X = this.canvas.width / 2;
    this.CENTER_Y = this.canvas.height / 2;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // TODO: Implement any update logic if needed
  }

  public render(context: CanvasRenderingContext2D): void {
    context.save(); // Save the current context state

    // Translate context to ball position
    context.translate(this.x, this.y);

    // Rotate context by the angle
    context.rotate(this.angle);

    // Draw the football ball
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.RADIUS);
    gradient.addColorStop(0, this.BALL_COLOR_LIGHT); // Light color
    gradient.addColorStop(1, this.BALL_COLOR_DARK); // Dark color
    context.fillStyle = gradient;

    context.beginPath();
    context.arc(0, 0, this.RADIUS, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    // Restore the context state
    context.restore();
  }

  public setCenterPosition(): void {
    // Set position to the center of the canvas accounting for the radius
    this.x = this.CENTER_X;
    this.y = this.CENTER_Y;
  }
}
