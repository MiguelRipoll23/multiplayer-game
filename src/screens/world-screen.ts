import { GameScreen } from "./interfaces/game-screen.js";
import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";

export class WorldScreen extends BaseGameScreen implements GameScreen {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.canvas = canvas;
  }

  public override loadObjects(): void {
    this.addLocalCarObjects();

    super.loadObjects();
  }

  private addLocalCarObjects(): void {
    const localCarObject = new LocalCarObject(
      this.canvas.width / 2 - 25,
      this.canvas.height / 2 - 25,
      90,
      this.canvas,
    );

    this.uiObjects.push(localCarObject.getJoystick());
    this.uiObjects.push(localCarObject.getGearStick());
    this.sceneObjects.push(localCarObject);
  }
}
