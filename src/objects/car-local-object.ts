import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";

export class LocalCarObject extends CarObject {
  private joystick: JoystickObject | null = null;
  private gearStick: GearStickObject | null = null;

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    super(x, y, angle, canvas);
  }

  public update(deltaTimeStamp: number): void {
    this.handleControls();

    super.update(deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {
    super.render(context);
  }

  public setControls(
    joystick: JoystickObject,
    gearStick: GearStickObject
  ): void {
    this.joystick = joystick;
    this.gearStick = gearStick;
  }

  private handleControls(): void {
    if (!this.joystick || !this.gearStick) return;

    if (this.gearStick.isActive()) {
      return;
    }

    const currentGear = this.gearStick.getCurrentGear();

    if (this.joystick.isActive()) {
      if (currentGear === "F" && this.speed < this.topSpeed) {
        this.speed += this.acceleration;
      } else if (currentGear === "R" && this.speed > -this.topSpeed) {
        this.speed -= this.acceleration;
      }
    }

    this.angle +=
      this.handling *
      (this.speed / this.topSpeed) *
      this.joystick.getControlX();
  }
}
