import { GameScreen } from "./interfaces/game-screen.js";
import { GearStickObject } from "../objects/gear-stick-object.js";
import { JoystickObject } from "../objects/joystick-object.js";
import { LocalCarObject } from "../objects/car-local-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";

export class WorldScreen extends BaseGameScreen implements GameScreen {
  private canvas: HTMLCanvasElement;

  private joystick: JoystickObject | null = null;
  private gearStick: GearStickObject | null = null;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.canvas = canvas;
  }

  public override loadObjects(): void {
    this.addControls();
    this.addLocalCar();

    super.loadObjects();
  }

  private addControls(): void {
    this.gearStick = new GearStickObject(this.canvas);
    this.uiObjects.push(this.gearStick);

    this.joystick = new JoystickObject(this.canvas);
    this.uiObjects.push(this.joystick);
  }

  private addLocalCar(): void {
    const localCar = new LocalCarObject(
      this.canvas.width / 2 - 25,
      this.canvas.height / 2 - 25,
      90,
      this.canvas
    );

    if (this.joystick && this.gearStick) {
      localCar.setControls(this.joystick, this.gearStick);
    }

    this.sceneObjects.push(localCar);
  }
}
