import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class GearStickObject extends BaseGameObject implements GameObject {
  private y: number = 0;
  private x: number = 25;

  private active: boolean = false;
  private currentGear = "F";

  private readonly size: number = 65; // Adjust size as needed
  private readonly cornerRadius: number = 12; // Adjust corner radius as needed
  private readonly fillColor: string = "black"; // Change fill color to black
  private readonly fontSize: number = 36; // Adjust font size as needed
  private readonly yOffset: number = 25;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();

    // Position the gear stick 50px from the bottom
    this.y = this.canvas.height - (this.size + this.yOffset);

    this.addEventListeners();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // Implement update logic if required
  }

  public render(context: CanvasRenderingContext2D): void {
    this.drawSquare(context);
    this.drawGearLetter(context);
  }

  public isActive(): boolean {
    return this.active;
  }

  public getCurrentGear(): string {
    return this.currentGear;
  }

  private addEventListeners(): void {
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: true },
    );

    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });

    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (!event.target) return;

    const rect = (event.target as Element).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (this.isWithinGearStick(mouseX, mouseY)) {
      this.switchGear();
    }
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    if (!touch) return;

    const rect = this.canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    if (this.isWithinGearStick(touchX, touchY)) {
      this.active = true;
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    this.active = false;
  }

  private isWithinGearStick(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.size &&
      y >= this.y &&
      y <= this.y + this.size
    );
  }

  private switchGear(): void {
    this.currentGear = this.currentGear === "F" ? "R" : "F";
  }

  private drawSquare(context: CanvasRenderingContext2D): void {
    // Draw the filled rounded square
    context.fillStyle = this.fillColor;
    context.beginPath();
    context.moveTo(this.x + this.cornerRadius, this.y);
    context.arcTo(
      this.x + this.size,
      this.y,
      this.x + this.size,
      this.y + this.size,
      this.cornerRadius,
    );
    context.arcTo(
      this.x + this.size,
      this.y + this.size,
      this.x,
      this.y + this.size,
      this.cornerRadius,
    );
    context.arcTo(
      this.x,
      this.y + this.size,
      this.x,
      this.y,
      this.cornerRadius,
    );
    context.arcTo(
      this.x,
      this.y,
      this.x + this.size,
      this.y,
      this.cornerRadius,
    );
    context.closePath();
    context.fill();
  }

  private drawGearLetter(context: CanvasRenderingContext2D): void {
    // Draw the current gear letter inside the square
    context.fillStyle = "white"; // Set text color to white
    context.font = `bold ${this.fontSize}px Arial`; // Set font size dynamically
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.currentGear,
      this.x + this.size / 2,
      this.y + this.size / 2,
    );
  }
}