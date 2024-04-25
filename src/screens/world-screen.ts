import { GameScreen } from "./interfaces/game-screen.js";
import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { PlayerObject } from "../objects/player-object.js";

export class WorldScreen extends BaseGameScreen implements GameScreen {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.canvas = canvas;
  }

  public override loadObjects(): void {
    this.loadInitialObjects();
    super.loadObjects();
  }

  private loadInitialObjects(): void {
    const playerObject = new PlayerObject("player1");
    const localCarObject = this.createLocalCarObject();

    localCarObject.setPlayerObject(playerObject);

    this.uiObjects.push(localCarObject.getJoystickObject());
    this.uiObjects.push(localCarObject.getGearStickObject());
    this.sceneObjects.push(playerObject);
    this.sceneObjects.push(localCarObject);
  }

  private createLocalCarObject(): LocalCarObject {
    return new LocalCarObject(
      this.canvas.width / 2 - 25,
      this.canvas.height / 2 - 25,
      90,
      this.canvas,
    );
  }
}
