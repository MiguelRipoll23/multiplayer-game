import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class GearStickObject extends BaseGameObject implements GameObject {
  private readonly SIZE: number = 65; // Adjust size as needed
  private readonly CORNER_RADIUS: number = 12; // Adjust corner radius as needed
  private readonly FILL_COLOR: string = "black"; // Change fill color to black
  private readonly FONT_SIZE: number = 36; // Adjust font size as needed
  private readonly Y_OFFSET: number = 25;

  private y: number = 0;
  private x: number = 30;

  private active: boolean = false;
  private currentGear = "F";

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();

    // Position the gear stick 50px from the bottom
    this.y = this.canvas.height - (this.SIZE + this.Y_OFFSET);

    this.addTouchEventListeners();
    this.addKeyboardEventListeners();
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

  private switchGear(): void {
    this.currentGear = this.currentGear === "F" ? "R" : "F";
  }

  private drawSquare(context: CanvasRenderingContext2D): void {
    // Draw the filled rounded square
    context.fillStyle = this.FILL_COLOR;
    context.beginPath();
    context.moveTo(this.x + this.CORNER_RADIUS, this.y);
    context.arcTo(
      this.x + this.SIZE,
      this.y,
      this.x + this.SIZE,
      this.y + this.SIZE,
      this.CORNER_RADIUS,
    );
    context.arcTo(
      this.x + this.SIZE,
      this.y + this.SIZE,
      this.x,
      this.y + this.SIZE,
      this.CORNER_RADIUS,
    );
    context.arcTo(
      this.x,
      this.y + this.SIZE,
      this.x,
      this.y,
      this.CORNER_RADIUS,
    );
    context.arcTo(
      this.x,
      this.y,
      this.x + this.SIZE,
      this.y,
      this.CORNER_RADIUS,
    );
    context.closePath();
    context.fill();
  }

  private drawGearLetter(context: CanvasRenderingContext2D): void {
    // Draw the current gear letter inside the square
    context.fillStyle = "white"; // Set text color to white
    context.font = `bold ${this.FONT_SIZE}px Arial`; // Set font size dynamically
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      this.currentGear,
      this.x + this.SIZE / 2,
      this.y + this.SIZE / 2,
    );
  }

  private addTouchEventListeners(): void {
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
