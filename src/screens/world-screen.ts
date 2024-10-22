import { LocalCarObject } from "../objects/local-car-object.js";
import { PlayerObject } from "../objects/player-object.js";
import { WorldBackgroundObject } from "../objects/backgrounds/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
import { ScoreboardObject } from "../objects/scoreboard-object.js";
import { BaseCollidingGameScreen } from "./base/base-colliding-game-screen.js";
import { GameState } from "../models/game-state.js";
import { getConfigurationKey } from "../utils/configuration-utils.js";
import { SCOREBOARD_SECONDS_DURATION } from "../constants/configuration-constants.js";
import { GameController } from "../models/game-controller.js";

export class WorldScreen extends BaseCollidingGameScreen {
  private gameState: GameState;

  private scoreboardObject: ScoreboardObject | null = null;
  private ballObject: BallObject | null = null;
  private orangeGoalObject: GoalObject | null = null;
  private blueGoalObject: GoalObject | null = null;

  constructor(gameController: GameController) {
    super(gameController);
    this.gameState = gameController.getGameState();
  }

  public override loadObjects(): void {
    this.createBackgroundObject();
    this.createScoreboardObject();
    this.createPlayerAndLocalCarObjects();
    this.createBallObject();
    this.createGoalObjects();
    super.loadObjects();
  }

  private createBackgroundObject() {
    const backgroundObject = new WorldBackgroundObject(this.canvas);
    this.sceneObjects.push(backgroundObject);

    backgroundObject.getCollisionHitboxes().forEach((object) => {
      this.sceneObjects.push(object);
    });
  }

  private createScoreboardObject() {
    const durationSeconds: number | null = getConfigurationKey<number>(
      SCOREBOARD_SECONDS_DURATION,
      60 * 5,
      this.gameState,
    );

    this.scoreboardObject = new ScoreboardObject(this.canvas);
    this.scoreboardObject.startCountdown(durationSeconds);
    this.sceneObjects.push(this.scoreboardObject);
  }

  private createBallObject() {
    this.ballObject = new BallObject(0, 0, this.canvas);
    this.ballObject.setCenterPosition();

    this.sceneObjects.push(this.ballObject);
  }

  private createGoalObjects() {
    this.orangeGoalObject = new GoalObject(true, this.canvas);
    this.blueGoalObject = new GoalObject(false, this.canvas);

    this.sceneObjects.push(this.orangeGoalObject);
    this.sceneObjects.push(this.blueGoalObject);
  }

  private createPlayerAndLocalCarObjects() {
    const playerObject = this.createAndGetPlayerObject();

    const localCarObject = new LocalCarObject(0, 0, 90, this.canvas);
    localCarObject.setCenterPosition();
    localCarObject.setPlayerObject(playerObject);

    // Scene
    this.sceneObjects.push(localCarObject);

    // UI
    this.uiObjects.push(localCarObject.getGearStickObject());
    this.uiObjects.push(localCarObject.getJoystickObject());
  }

  private createAndGetPlayerObject(): PlayerObject {
    const playerObject = new PlayerObject("player1");
    this.sceneObjects.push(playerObject);

    return playerObject;
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    super.update(deltaTimeStamp);
    this.detectScores();
  }

  private detectScores() {
    if (
      this.ballObject === null ||
      this.ballObject?.isInactive()
    ) {
      return;
    }

    const hasOrangeTeamScored = this.orangeGoalObject?.getCollidingObjects()
      .includes(this.ballObject);

    if (hasOrangeTeamScored) {
      this.ballObject.setInactive();
      this.scoreboardObject?.incrementBlueScore();
    }

    const hasBlueTeamScored = this.blueGoalObject?.getCollidingObjects()
      .includes(
        this.ballObject,
      );

    if (hasBlueTeamScored) {
      this.ballObject.setInactive();
      this.scoreboardObject?.incrementOrangeScore();
    }
  }
}
