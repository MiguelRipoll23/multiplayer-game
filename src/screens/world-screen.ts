import { GameScreen } from "./interfaces/game-screen.js";
import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { PlayerObject } from "../objects/player-object.js";
import { WorldBackgroundObject } from "../objects/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
import { CountdownObject } from "../objects/countdown-object.js";
import { ScoreObject } from "../objects/score-object.js";

export class WorldScreen extends BaseGameScreen implements GameScreen {
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    super();

    this.canvas = canvas;
  }

  public override loadObjects(): void {
    this.loadBackgroundObject();
    this.loadCountdownObject();
    this.loadScoreObjects();
    this.loadBallObject();
    this.loadGoalObjects();
    this.loadPlayerAndLocalCarObjects();

    super.loadObjects();
  }

  private loadBackgroundObject() {
    const backgroundObject = new WorldBackgroundObject(this.canvas);
    this.sceneObjects.push(backgroundObject);
  }

  private loadCountdownObject() {
    const countdownObject = new CountdownObject(this.canvas);
    countdownObject.startCountdown(60 * 5);
    this.sceneObjects.push(countdownObject);
  }

  private loadScoreObjects() {
    const redScoreObject = new ScoreObject(false, this.canvas);
    const blueScoreObject = new ScoreObject(true, this.canvas);

    this.sceneObjects.push(redScoreObject);
    this.sceneObjects.push(blueScoreObject);
  }

  private loadBallObject() {
    const ballObject = new BallObject(0, 0, 90, this.canvas);
    ballObject.setCenterPosition();

    this.sceneObjects.push(ballObject);
  }

  private loadGoalObjects() {
    const redGoalObject = new GoalObject(false, this.canvas);
    const blueGoalObject = new GoalObject(true, this.canvas);

    this.sceneObjects.push(redGoalObject);
    this.sceneObjects.push(blueGoalObject);
  }

  private loadPlayerAndLocalCarObjects() {
    const playerObject = this.loadAndGetPlayerObject();

    const localCarObject = new LocalCarObject(0, 0, 90, this.canvas);
    localCarObject.setCenterPosition();
    localCarObject.setPlayerObject(playerObject);

    // Scene
    this.sceneObjects.push(localCarObject);

    // UI
    this.uiObjects.push(localCarObject.getGearStickObject());
    this.uiObjects.push(localCarObject.getJoystickObject());
  }

  private loadAndGetPlayerObject(): PlayerObject {
    const playerObject = new PlayerObject("player1");
    this.sceneObjects.push(playerObject);

    return playerObject;
  }
}
