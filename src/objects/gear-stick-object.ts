import { BaseGameObject } from "./base/base-game-object.js";

export class GearStickObject extends BaseGameObject {
  private readonly SIZE: number = 65; // Adjust size as needed
  private readonly FILL_COLOR: string = "black"; // Change fill color to black
  private readonly FONT_SIZE: number = 36; // Adjust font size as needed
  private readonly Y_OFFSET: number = 25;

  private x: number = 30;
  private y: number = 0;
  private radius: number = this.SIZE / 2;

  private textX = 0;
  private textY = 0;

  private active: boolean = false;
  private currentGear = "F";

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();

    this.x = this.x + this.SIZE / 2;
    this.y = this.canvas.height - (this.SIZE + this.Y_OFFSET);

    this.textX = this.x;
    this.textY = this.y + this.radius / 2;

    this.addTouchEventListeners();
    this.addKeyboardEventListeners();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // Implement update logic if required
  }

  public render(context: CanvasRenderingContext2D): void {
    this.drawCircle(context); // Modified to draw a circle
    this.drawGearLetter(context);
  }

  public isActive(): boolean {
    return this.active;
  }

  public getCurrentGear(): string {
    return this.currentGear;
  }

  private switchGear(): void {
    this.currentGear = this.currentGear === "F" ? "R" : "F";
  }

  private drawCircle(context: CanvasRenderingContext2D): void {
    // Draw the filled circle
    context.fillStyle = this.FILL_COLOR;
    context.beginPath();
    context.arc(
      this.x, // x-coordinate of the center
      this.y, // y-coordinate of the center
      this.radius, // radius
      0, // start angle
      Math.PI * 2, // end angle
    );
    context.closePath();
    context.fill();
  }

  private drawGearLetter(context: CanvasRenderingContext2D): void {
    // Draw the current gear letter inside the circle
    context.fillStyle = "white"; // Set text color to white
    context.font = `bold ${this.FONT_SIZE}px Arial`; // Set font size dynamically
    context.textAlign = "center";
    context.fillText(
      this.currentGear,
      this.textX,
      this.textY,
    );
  }

  private addTouchEventListeners(): void {
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: false },
    );

    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: true,
    });
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
    if (this.active) {
      this.switchGear();
      this.active = false;
    }
  }

  private isWithinGearStick(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.SIZE &&
      y >= this.y &&
      y <= this.y + this.SIZE
    );
  }

  private addKeyboardEventListeners(): void {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "ArrowUp" || event.key === "w") {
      this.currentGear = "F";
    } else if (event.key === "ArrowDown" || event.key === "s") {
      this.currentGear = "R";
    }
  }
}
