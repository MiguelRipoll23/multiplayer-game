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
    const playerObject = this.loadAndGetPlayerObject();
    this.loadLocalCarObjects(playerObject);

    super.loadObjects();
  }

  private loadAndGetPlayerObject(): PlayerObject {
    const playerObject = new PlayerObject("player1");
    this.sceneObjects.push(playerObject);

    return playerObject;
  }

  private loadLocalCarObjects(playerObject: PlayerObject) {
    const localCarObject = new LocalCarObject(0, 0, 90, this.canvas);
    localCarObject.setCenterPosition();
    localCarObject.setPlayerObject(playerObject);

    // Scene
    this.sceneObjects.push(localCarObject);

    // UI
    this.uiObjects.push(localCarObject.getGearStickObject());
    this.uiObjects.push(localCarObject.getJoystickObject());
  }
}
