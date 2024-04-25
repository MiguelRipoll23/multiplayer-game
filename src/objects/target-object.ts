import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class TargetObject extends BaseGameObject implements GameObject {
  private readonly RADIUS: number = 10;
  private readonly FADE_IN_DURATION_SECONDS: number = 1000;

  private readonly canvas: HTMLCanvasElement;

  private scale: number = 0;
  private opacity: number = 0;

  private x: number;
  private y: number;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.canvas = canvas;

    // Set random position for the circle
    this.x = Math.random() * (this.canvas.width - this.RADIUS * 2) +
      this.RADIUS;
    this.y = Math.random() * (this.canvas.height - this.RADIUS * 2) +
      this.RADIUS;
  }

  update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // Implement scaling animation
    if (this.scale < 1) {
      // Ease-in scaling
      this.scale += deltaTimeStamp / this.FADE_IN_DURATION_SECONDS;
      this.scale = Math.min(this.scale, 1);
    }

    // Implement fade-in animation
    if (this.opacity < 1) {
      // Ease-in opacity
      this.opacity += deltaTimeStamp / this.FADE_IN_DURATION_SECONDS;
      this.opacity = Math.min(this.opacity, 1);
    }
  }

  render(context: CanvasRenderingContext2D): void {
    // Save the context state
    context.save();

    // Set the circle color to yellow with the specified opacity
    context.fillStyle = `rgba(255, 165, 0, ${this.opacity})`;

    // Scale and draw the circle
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      Math.abs(this.RADIUS) * this.scale,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.closePath();

    // Restore the context state
    context.restore();
  }
}
