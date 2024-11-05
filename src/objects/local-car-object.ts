import { GameKeyboard } from "../models/game-keyboard.js";
import { GamePointer } from "../models/game-pointer.js";
import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";

export class LocalCarObject extends CarObject {
  private readonly joystickObject: JoystickObject;
  private readonly gearStickObject: GearStickObject;

  constructor(
    x: number,
    y: number,
    angle: number,
    protected readonly canvas: HTMLCanvasElement,
    gamePointer: GamePointer,
    gameKeyboard: GameKeyboard
  ) {
    super(x, y, angle, false, canvas);
    this.joystickObject = new JoystickObject(canvas, gamePointer, gameKeyboard);
    this.gearStickObject = new GearStickObject(
      canvas,
      gamePointer,
      gameKeyboard
    );
  }

  public getJoystickObject(): JoystickObject {
    return this.joystickObject;
  }

  public getGearStickObject(): GearStickObject {
    return this.gearStickObject;
  }

  public reset(): void {
    this.angle = 90;
    this.setCenterPosition();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.handleControls();

    super.update(deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {
    // Debug
    this.renderDebugInformation(context);

    super.render(context);
  }

  private handleControls(): void {
    if (!this.joystickObject || !this.gearStickObject) return;

    if (this.gearStickObject.isActive()) {
      return;
    }

    const currentGear = this.gearStickObject.getCurrentGear();

    if (this.joystickObject.isActive()) {
      if (currentGear === "F" && this.speed < this.TOP_SPEED) {
        this.speed += this.ACCELERATION;
      } else if (currentGear === "R" && this.speed > -this.TOP_SPEED) {
        this.speed -= this.ACCELERATION;
      }
    }

    this.angle +=
      this.HANDLING *
      (this.speed / this.TOP_SPEED) *
      this.joystickObject.getControlX();
  }

  private renderDebugInformation(context: CanvasRenderingContext2D) {
    if (this.debug === false) {
      return;
    }

    this.renderDebugPositionInformation(context);
    this.renderDebugAngleInformation(context);
    this.renderDebugIsOutsideBounds(context);
  }

  private renderDebugPositionInformation(context: CanvasRenderingContext2D) {
    const displayX = Math.round(this.x);
    const displayY = Math.round(this.y);

    const text = `Position: X(${displayX}) Y(${displayY})`;

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 24, 120, 10);
    context.fillStyle = "#FFFF00";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText(text, 28, 32);
  }

  private renderDebugAngleInformation(context: CanvasRenderingContext2D) {
    const displayAngle = Math.round(this.angle);

    const text = `Angle: ${displayAngle}`;

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 36, 60, 10);
    context.fillStyle = "#FFFF00";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText(text, 28, 44);
  }

  private renderDebugIsOutsideBounds(context: CanvasRenderingContext2D) {
    const outsideBounds =
      this.x < 0 ||
      this.x > this.canvas.width ||
      this.y < 0 ||
      this.y > this.canvas.height;

    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.fillRect(24, 48, 120, 10);
    context.fillStyle = "purple";
    context.font = "8px system-ui";
    context.textAlign = "left";
    context.fillText("Outside Bounds: " + outsideBounds, 28, 56);
  }
}
