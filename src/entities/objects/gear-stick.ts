import { GameObject } from "../../interfaces/game-object.js";

export class GearStick implements GameObject {
  private currentGear = "F";
  private readonly x = 25;
  private readonly size = 65; // Adjust size as needed
  private readonly cornerRadius = 12; // Adjust corner radius as needed
  private readonly fillColor = "black"; // Change fill color to black
  private readonly fontSize = 36; // Adjust font size as needed
  private readonly yOffset = 25;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.y = this.canvas.height - (this.size + this.yOffset); // Position the gear stick 50px from the bottom

    document.addEventListener("click", this.switchGear.bind(this));
  }

  private y: number;

  public update(deltaTimeStamp: number): void {
    // Implement update logic if required
  }

  public render(context: CanvasRenderingContext2D): void {
    this.drawSquare(context);
    this.drawGearLetter(context);
  }

  public getCurrentGear(): string {
    return this.currentGear;
  }

  // Method for gracefully switching gears
  private switchGear(event: MouseEvent): void {
    if (!event.target) return;

    const rect = (event.target as Element).getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check if the click occurred within the boundaries of the gear stick
    if (
      mouseX >= this.x &&
      mouseX <= this.x + this.size &&
      mouseY >= this.y &&
      mouseY <= this.y + this.size
    ) {
      // Effortlessly toggle between forward (F) and reverse (R)
      this.currentGear = this.currentGear === "F" ? "R" : "F";
    }
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
