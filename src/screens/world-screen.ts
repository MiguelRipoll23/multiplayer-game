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
import { AlertObject } from "../objects/alert-object.js";
import { TimerService } from "../services/timer-service.js";
import { ToastObject } from "../objects/common/toast-object.js";
import {
  MATCH_ADVERTISED_EVENT,
  PLAYER_CONNECTED_EVENT,
  PLAYER_DISCONNECTED_EVENT,
} from "../constants/events-constants.js";
import { Team } from "../models/game-team.js";
import { RemoteCarObject } from "../objects/remote-car-object.js";
import { ObjectState } from "../models/object-state.js";
import { GamePlayer } from "../models/game-player.js";
import { EventType } from "../models/event-type.js";
import { GameEvent } from "../models/game-event.js";

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

    if (this.gameState.getGameMatch()?.isHost()) {
      this.detectScores();
    }

    this.gameController
      .getEventsProcessorService()
      .listenEvent(EventType.GoalStart, this.handleRemoteGoal.bind(this));

    this.gameController
      .getEventsProcessorService()
      .listenEvent(EventType.GoalEnd, () => this.handleGoalTimerEnd());

    this.gameController
      .getObjectOrchestrator()
      .sendLocalData(this, deltaTimeStamp);
  }

  private addSyncableObjects(): void {
    this.addSyncableObject(BallObject);
    this.addSyncableObject(RemoteCarObject);
    this.addSyncableObject(ScoreboardObject);
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
      this.handleMatchAdvertised();
    });

    window.addEventListener(PLAYER_CONNECTED_EVENT, (event) => {
      this.handlePlayerConnection(event as CustomEvent<any>);
    });

    window.addEventListener(PLAYER_DISCONNECTED_EVENT, (event) => {
      this.handlePlayerDisconnection(event as CustomEvent<any>);
    });
  }

  private handleMatchAdvertised(): void {
    if (this.gameState.getGameMatch()?.getPlayers().length === 1) {
      this.toastObject?.show("Waiting for players...");
    }
  }

  private handlePlayerConnection(event: CustomEvent<any>): void {
    const player = event.detail.player;
    const matchmaking = event.detail.matchmaking;

    this.toastObject?.hide();

    if (matchmaking) {
      this.toastObject?.show(`Joined to <em>${player.getName()}</em>`);
      this.updateScoreboard();
    } else {
      this.toastObject?.show(`<em>${player.getName()}</em> joined`);

      if (this.scoreboardObject?.isActive() === false) {
        this.scoreboardObject?.startCountdown();
      }
    }

    this.gameController.addTimer(2, () => this.toastObject?.hide());
  }

  private handlePlayerDisconnection(event: CustomEvent<any>): void {
    const player = event.detail.player;

    this.getObjectsByOwner(player).forEach((object) => {
      object.setState(ObjectState.Inactive);
    });

    this.toastObject?.show(`<em>${player.getName()}</em> left`);

    const playersCount =
      this.gameState.getGameMatch()?.getPlayers().length ?? 0;

    if ((playersCount ?? 0) > 1) {
      this.gameController.addTimer(2, () => this.toastObject?.hide());
    } else {
      this.scoreboardObject?.stopCountdown();
    }

    this.updateScoreboard();
  }

  private createScoreboardObject() {
    const durationSeconds: number | null = getConfigurationKey<number>(
      SCOREBOARD_SECONDS_DURATION,
      60 * 5,
      this.gameState
    );

    this.scoreboardObject = new ScoreboardObject(this.canvas);
    this.scoreboardObject.setCountdownDuration(durationSeconds);
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

    this.localCarObject = new LocalCarObject(
      0,
      0,
      90,
      this.canvas,
      gamePointer,
      gameKeyboard
    );

    this.localCarObject.setOwner(this.gameState.getGamePlayer());
    this.localCarObject.setCanvas(this.canvas);
    this.localCarObject.setCenterPosition();

    // Scene
    this.sceneObjects.push(this.localCarObject);

    // UI
    this.uiObjects.push(this.localCarObject.getGearStickObject());
    this.uiObjects.push(this.localCarObject.getJoystickObject());
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
      this.handleGoalScored();
    }
  }

  private handleGoalScored() {
    const player = this.ballObject?.getLastPlayer() ?? null;

    if (player === null) {
      return console.warn("Player is null");
    }

    // Ball
    this.ballObject?.setInactive();

    // Score
    player.sumScore(1);

    // Event
    this.sendGoalEvent(player);

    // Scoreboard
    const goalTeam =
      player === this.gameController.getGameState().getGamePlayer()
        ? Team.Blue
        : Team.Red;

    if (goalTeam === Team.Blue) {
      this.scoreboardObject?.incrementBlueScore();
    } else if (goalTeam === Team.Red) {
      this.scoreboardObject?.incrementRedScore();
    }

    // Alert
    this.showGoalAlert(player, goalTeam);

    // Timer
    this.goalTimerService = this.gameController.addTimer(5, () =>
      this.handleGoalTimerEnd()
    );
  }

  private sendGoalEvent(player: GamePlayer) {
    const playerId: string = player.getId();
    const playerScore: number = player.getScore();

    const arrayBuffer = new ArrayBuffer(36 + 4);

    new Uint8Array(arrayBuffer).set(new TextEncoder().encode(playerId), 0);
    new DataView(arrayBuffer).setInt32(36, playerScore);

    const goalEvent = new GameEvent(EventType.GoalStart, arrayBuffer);
    this.gameController.getEventsProcessorService().sendEvent(goalEvent);
  }

  private updateScoreboard() {
    const players = this.gameState.getGameMatch()?.getPlayers() ?? [];

    let totalScore = 0;

    players.forEach((player) => {
      const score = player.getScore();
      if (player === this.gameState.getGamePlayer()) {
        return this.scoreboardObject?.setBlueTeamScore(score);
      }

      totalScore += score;
    });

    this.scoreboardObject?.setRedTeamScore(totalScore);
  }

  private showGoalAlert(player: GamePlayer | null | undefined, goalTeam: Team) {
    const playerName = player?.getName().toUpperCase() || "UNKNOWN";

    let color = "white";

    if (goalTeam === Team.Blue) {
      color = "blue";
    } else if (goalTeam === Team.Red) {
      color = "red";
    }

    this.alertObject?.show([playerName, "SCORED!"], color);
  }

  private handleRemoteGoal(arrayBuffer: ArrayBuffer | null) {
    if (arrayBuffer === null) {
      return console.warn("Array buffer is null");
    }

    // Ball
    this.ballObject?.setInactive();

    // Score
    const playerId = new TextDecoder().decode(arrayBuffer.slice(0, 36));
    const playerScore = new DataView(arrayBuffer).getInt32(36);

    const player = this.gameState.getGameMatch()?.getPlayer(playerId) ?? null;
    player?.setScore(playerScore);

    // Score
    this.updateScoreboard();

    // Alert
    let team = Team.Red;

    if (player === this.gameController.getGameState().getGamePlayer()) {
      team = Team.Blue;
    }

    this.showGoalAlert(player, team);
  }

  private handleGoalTimerEnd(): void {
    if (this.gameState.getGameMatch()?.isHost()) {
      this.sendGoalTimerEndEvent();
    }

    this.ballObject?.reset();
    this.localCarObject?.reset();
    this.alertObject?.hide();
  }

  private sendGoalTimerEndEvent() {
    const goalTimerEndEvent = new GameEvent(EventType.GoalEnd, null);

    this.gameController
      .getEventsProcessorService()
      .sendEvent(goalTimerEndEvent);
  }
}
