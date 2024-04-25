import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";

export class LocalCarObject extends CarObject {
  private joystickObject: JoystickObject;
  private gearStickObject: GearStickObject;

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    super(x, y, angle, canvas);

    this.joystickObject = new JoystickObject(this.canvas);
    this.gearStickObject = new GearStickObject(this.canvas);
  }

  public update(deltaFrameMilliseconds: number): void {
    this.handleControls();

    super.update(deltaFrameMilliseconds);
  }

  public render(context: CanvasRenderingContext2D): void {
    super.render(context);
  }

  public getJoystickObject(): JoystickObject {
    return this.joystickObject;
  }

  public getGearStickObject(): GearStickObject {
    return this.gearStickObject;
  }

  private handleControls(): void {
    if (!this.joystickObject || !this.gearStickObject) return;

    if (this.gearStickObject.isActive()) {
      return;
    }

    const currentGear = this.gearStickObject.getCurrentGear();

    if (this.joystickObject.isActive()) {
      if (currentGear === "F" && this.speed < this.topSpeed) {
        this.speed += this.acceleration;
      } else if (currentGear === "R" && this.speed > -this.topSpeed) {
        this.speed -= this.acceleration;
      }
    }

    this.angle += this.handling *
      (this.speed / this.topSpeed) *
      this.joystickObject.getControlX();
  }
}
