import { Car } from "./car.js";
import { GearStick } from "./gear-stick.js";
import { Joystick } from "./joystick.js";

export class LocalCar extends Car {
  private joystick: Joystick | null = null;
  private gearStick: GearStick | null = null;

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

  public setControls(joystick: Joystick, gearStick: GearStick): void {
    this.joystick = joystick;
    this.gearStick = gearStick;
  }

  private handleControls(): void {
    if (!this.joystick || !this.gearStick) return;

    const currentGear = this.gearStick.getCurrentGear();

    if (this.joystick.isPressed) {
      if (currentGear === "F" && this.speed < this.topSpeed) {
        this.speed += this.acceleration;
      } else if (currentGear === "R" && this.speed > -this.topSpeed) {
        this.speed -= this.acceleration;
      }
    }

    this.angle += this.handling * (this.speed / this.topSpeed) *
      this.joystick.controlX;
  }
}
