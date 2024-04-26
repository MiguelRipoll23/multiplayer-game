import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";

export class LocalCarObject extends CarObject {
  private readonly joystickObject: JoystickObject;
  private readonly gearStickObject: GearStickObject;

  constructor(x: number, y: number, angle: number, canvas: HTMLCanvasElement) {
    super(x, y, angle, true, canvas);

    this.joystickObject = new JoystickObject(this.canvas);
    this.gearStickObject = new GearStickObject(this.canvas);
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.handleControls();

    super.update(deltaTimeStamp);
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
}
