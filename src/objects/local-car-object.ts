import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";

export class LocalCarObject extends CarObject {
  private joystick: JoystickObject;
  private gearStick: GearStickObject;

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    super(x, y, angle, canvas);

    this.joystick = new JoystickObject(this.canvas);
    this.gearStick = new GearStickObject(this.canvas);
  }

  public update(deltaFrameMilliseconds: number): void {
    this.handleControls();

    super.update(deltaFrameMilliseconds);
  }

  public render(context: CanvasRenderingContext2D): void {
    super.render(context);
  }

  public getJoystick(): JoystickObject {
    return this.joystick;
  }

  public getGearStick(): GearStickObject {
    return this.gearStick;
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

    this.angle += this.handling *
      (this.speed / this.topSpeed) *
      this.joystick.getControlX();
  }
}
