import { LocalCarObject } from "../objects/local-car-object.js";
import { WorldBackgroundObject } from "../objects/backgrounds/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
import { ScoreboardObject } from "../objects/scoreboard-object.js";
import { BaseCollidingGameScreen } from "./base/base-colliding-game-screen.js";
import { GameState } from "../models/game-state.js";
import { getConfigurationKey } from "../utils/configuration-utils.js";
import { SCOREBOARD_SECONDS_DURATION } from "../constants/configuration-constants.js";
import { GameController } from "../models/game-controller.js";
import { LocalPlayerObject } from "../objects/local-player-object.js";
import { AlertObject } from "../objects/alert-object.js";
import { TimerService } from "../services/timer-service.js";
import { PlayerObject } from "../objects/player-object.js";
import { ToastObject } from "../objects/common/toast-object.js";
import {
  MATCH_ADVERTISED_EVENT,
  PLAYER_CONNECTED_EVENT,
  PLAYER_DISCONNECTED_EVENT,
} from "../constants/events-constants.js";
import { Team } from "../models/game-teams.js";
import { RemoteCarObject } from "../objects/remote-car-object.js";
import { ObjectState } from "../models/object-state.js";

export class WorldScreen extends BaseCollidingGameScreen {
  private gameState: GameState;
  private scoreboardObject: ScoreboardObject | null = null;
  private localCarObject: LocalCarObject | null = null;
  private ballObject: BallObject | null = null;
  private goalObject: GoalObject | null = null;
  private alertObject: AlertObject | null = null;
  private toastObject: ToastObject | null = null;

  private goalTimerService: TimerService | null = null;

  constructor(protected gameController: GameController) {
    super(gameController);
    this.gameState = gameController.getGameState();
    this.addCustomEventListeners();
    this.addSyncableObjects();
  }

  public override loadObjects(): void {
    this.createBackgroundObject();
    this.createScoreboardObject();
    this.createPlayerAndLocalCarObjects();
    this.createBallObject();
    this.createGoalObject();
    this.createAlertObject();
    this.createToastObject();
    super.loadObjects();
  }

  public override hasTransitionFinished(): void {
    super.hasTransitionFinished();

    this.toastObject?.show("Finding sessions...");
    this.gameController.getMatchmakingService().findOrAdvertiseMatch();
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    super.update(deltaTimeStamp);
    this.detectScores();
    this.gameController.getObjectOrchestrator().sendLocalData(this);
  }

  private addSyncableObjects(): void {
    this.addSyncableObject(BallObject);
    this.addSyncableObject(RemoteCarObject);
  }

  private createBackgroundObject() {
    const backgroundObject = new WorldBackgroundObject(this.canvas);
    this.sceneObjects.push(backgroundObject);

    backgroundObject.getCollisionHitboxes().forEach((object) => {
      this.sceneObjects.push(object);
    });
  }

  private addCustomEventListeners(): void {
    window.addEventListener(MATCH_ADVERTISED_EVENT, (event) => {
      this.toastObject?.show("Waiting for players...");
    });

    window.addEventListener(PLAYER_CONNECTED_EVENT, (event) => {
      this.toastObject?.hide();
    });

    window.addEventListener(PLAYER_DISCONNECTED_EVENT, (event) => {
      this.handlePlayerDisconnection(event as CustomEvent<any>);
    });
  }

  private handlePlayerDisconnection(event: CustomEvent<any>): void {
    const player = event.detail.player;

    this.getObjectsByOwner(player).forEach((object) => {
      object.setState(ObjectState.Inactive);
    });
  }

  private createScoreboardObject() {
    const durationSeconds: number | null = getConfigurationKey<number>(
      SCOREBOARD_SECONDS_DURATION,
      60 * 5,
      this.gameState
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

  private createGoalObject() {
    this.goalObject = new GoalObject(this.canvas);
    this.sceneObjects.push(this.goalObject);
  }

  private createPlayerAndLocalCarObjects() {
    const gamePointer = this.gameController.getGamePointer();
    const gameKeyboard = this.gameController.getGameKeyboard();

    const playerObject = this.createAndGetPlayerObject();

    this.localCarObject = new LocalCarObject(
      0,
      0,
      90,
      this.canvas,
      gamePointer,
      gameKeyboard
    );

    this.localCarObject.setCanvas(this.canvas);
    this.localCarObject.setCenterPosition();
    this.localCarObject.setPlayerObject(playerObject);

    // Scene
    this.sceneObjects.push(this.localCarObject);

    // UI
    this.uiObjects.push(this.localCarObject.getGearStickObject());
    this.uiObjects.push(this.localCarObject.getJoystickObject());
  }

  private createAndGetPlayerObject(): LocalPlayerObject {
    const player = this.gameState.getGamePlayer();

    const playerObject = new LocalPlayerObject(player);
    this.sceneObjects.push(playerObject);

    return playerObject;
  }

  private createAlertObject() {
    this.alertObject = new AlertObject(this.canvas);
    this.uiObjects.push(this.alertObject);
  }

  private createToastObject() {
    this.toastObject = new ToastObject(this.canvas);
    this.sceneObjects.push(this.toastObject);
  }

  private detectScores() {
    if (this.ballObject === null || this.ballObject?.isInactive()) {
      return;
    }

    const goalScored = this.goalObject
      ?.getCollidingObjects()
      .includes(this.ballObject);

    if (goalScored) {
      this.handleGoalScored(Team.Orange);
    }
  }

  private handleGoalScored(goalTeam: Team) {
    // Ball
    this.ballObject?.setInactive();

    // Scoreboard
    if (goalTeam === Team.Orange) {
      this.scoreboardObject?.incrementBlueScore();
    } else if (goalTeam === Team.Blue) {
      this.scoreboardObject?.incrementOrangeScore();
    }

    const playerObject = this.ballObject?.getLastPlayerObject();

    // Score
    if (playerObject) {
      this.handlePlayerScore(playerObject, goalTeam);
    }

    // Alert
    this.showGoalAlert(playerObject, goalTeam);

    // Timer
    this.goalTimerService = this.gameController.addTimer(5, () =>
      this.handleGoalTimerEnd()
    );
  }

  private handlePlayerScore(playerObject: PlayerObject, goalTeam: Team) {
    playerObject.sumScore(1);

    if (playerObject instanceof LocalPlayerObject) {
      this.gameController.getGameState().getGamePlayer().sumScore(1);
    }
  }

  private showGoalAlert(
    playerObject: PlayerObject | null | undefined,
    goalTeam: Team
  ) {
    const playerName = playerObject?.getName().toUpperCase() || "UNKNOWN";

    let color = "white";

    if (goalTeam === Team.Orange) {
      color = "blue";
    } else if (goalTeam === Team.Blue) {
      color = "orange";
    }

    this.alertObject?.show([playerName, "SCORED!"], color);
  }

  private handleGoalTimerEnd(): void {
    this.ballObject?.reset();
    this.localCarObject?.reset();
    this.alertObject?.hide();
  }
}
