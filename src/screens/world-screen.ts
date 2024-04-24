import { GameScreen } from "./interfaces/game-screen.js";
import { GearStick } from "../objects/gear-stick.js";
import { Joystick } from "../objects/joystick.js";
import { LocalCar } from "../objects/car-local.js";
import { BaseGameScreen } from "./base/base-game-screen.js";

export class WorldScreen extends BaseGameScreen implements GameScreen {
  private canvas: HTMLCanvasElement;

  private joystick: Joystick | null = null;
  private gearStick: GearStick | null = null;

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
    this.gearStick = new GearStick(this.canvas);
    this.uiObjects.push(this.gearStick);

    this.joystick = new Joystick(this.canvas);
    this.uiObjects.push(this.joystick);
  }

  private addLocalCar(): void {
    const localCar = new LocalCar(
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
