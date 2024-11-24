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
import { TeamType } from "../types/team-type.js";
import { RemoteCarObject } from "../objects/remote-car-object.js";
import { ObjectStateType } from "../types/object-state-type.js";
import { GamePlayer } from "../models/game-player.js";
import { EventType } from "../types/event-type.js";
import { GameEvent } from "../models/game-event.js";
import { ScreenType } from "../types/screen-type.js";
import { MainScreen } from "./main-screen.js";
import { MainMenuScreen } from "./main-screen/main-menu-screen.js";
import { MatchStateType } from "../types/match-state-type.js";

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

  public override getTypeId(): ScreenType {
    return ScreenType.World;
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
      this.detectGameEnd();
    }

    this.listenForEvents();

    this.gameController
      .getObjectOrchestrator()
      .sendLocalData(this, deltaTimeStamp);
  }

  private addSyncableObjects(): void {
    this.addSyncableObject(BallObject);
    this.addSyncableObject(RemoteCarObject);
    this.addSyncableObject(ScoreboardObject);
  }

  private listenForEvents(): void {
    this.gameController
      .getEventsProcessorService()
      .listenEvent(EventType.GoalStart, this.handleRemoteGoal.bind(this));

    this.gameController
      .getEventsProcessorService()
      .listenEvent(EventType.GoalEnd, this.handleGoalTimerEnd.bind(this));

    this.gameController
      .getEventsProcessorService()
      .listenEvent(
        EventType.GameOverStart,
        this.handleGameOverStartEvent.bind(this)
      );
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
      this.toastObject?.show(`Joined to <em>${player.getName()}</em>`, 2);
      this.updateScoreboard();
    } else {
      this.toastObject?.show(`<em>${player.getName()}</em> joined`, 2);

      if (this.scoreboardObject?.isActive() === false) {
        this.scoreboardObject?.startCountdown();
      }
    }
  }

  private handlePlayerDisconnection(event: CustomEvent<any>): void {
    const player = event.detail.player;

    this.getObjectsByOwner(player).forEach((object) => {
      object.setState(ObjectStateType.Inactive);
    });

    this.toastObject?.show(`<em>${player.getName()}</em> left`, 2);

    const playersCount =
      this.gameState.getGameMatch()?.getPlayers().length ?? 0;

    if (playersCount === 1) {
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

  private detectScores(): void {
    if (this.ballObject === null || this.ballObject?.isInactive()) {
      return;
    }

    const playersCount =
      this.gameState.getGameMatch()?.getPlayers().length ?? 0;

    if (playersCount < 2) {
      return;
    }

    const goalScored = this.goalObject
      ?.getCollidingObjects()
      .includes(this.ballObject);

    if (goalScored) {
      this.handleGoalScored();
    }
  }

  private sendCountdownStartEvent() {
    const countdownStartEvent = new GameEvent(EventType.CountdownStart, null);

    this.gameController
      .getEventsProcessorService()
      .sendEvent(countdownStartEvent);
  }

  private sendCountdownEndEvent() {
    const countdownEndEvent = new GameEvent(EventType.CountdownEnd, null);

    this.gameController
      .getEventsProcessorService()
      .sendEvent(countdownEndEvent);
  }

  private handleGoalScored() {
    const player = this.ballObject?.getLastPlayer() ?? null;

    if (player === null) {
      return console.warn("Player is null");
    }

    // Pause ball and countdown
    this.ballObject?.setInactive();
    this.scoreboardObject?.stopCountdown();

    // Update match state
    this.gameState.getGameMatch()?.setState(MatchStateType.GoalTime);

    // Score
    player.sumScore(1);

    // Event
    this.sendGoalEvent(player);

    // Scoreboard
    const goalTeam =
      player === this.gameController.getGameState().getGamePlayer()
        ? TeamType.Blue
        : TeamType.Red;

    if (goalTeam === TeamType.Blue) {
      this.scoreboardObject?.incrementBlueScore();
    } else if (goalTeam === TeamType.Red) {
      this.scoreboardObject?.incrementRedScore();
    }

    // Alert
    this.showGoalAlert(player, goalTeam);

    // Timer
    this.goalTimerService = this.gameController.addTimer(
      5,
      this.handleGoalTimerEnd.bind(this)
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

  private showGoalAlert(
    player: GamePlayer | null | undefined,
    goalTeam: TeamType
  ) {
    const playerName = player?.getName().toUpperCase() || "UNKNOWN";

    let color = "white";

    if (goalTeam === TeamType.Blue) {
      color = "blue";
    } else if (goalTeam === TeamType.Red) {
      color = "red";
    }

    this.alertObject?.show([playerName, "SCORED!"], color);
  }

  private handleRemoteGoal(arrayBuffer: ArrayBuffer | null) {
    if (arrayBuffer === null) {
      return console.warn("Array buffer is null");
    }

    // Pause ball and countdown
    this.ballObject?.setInactive();
    this.scoreboardObject?.stopCountdown();

    // Update match state
    this.gameState.getGameMatch()?.setState(MatchStateType.GoalTime);

    // Score
    const playerId = new TextDecoder().decode(arrayBuffer.slice(0, 36));
    const playerScore = new DataView(arrayBuffer).getInt32(36);

    const player = this.gameState.getGameMatch()?.getPlayer(playerId) ?? null;
    player?.setScore(playerScore);

    // Score
    this.updateScoreboard();

    // Alert
    let team = TeamType.Red;

    if (player === this.gameController.getGameState().getGamePlayer()) {
      team = TeamType.Blue;
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
    this.scoreboardObject?.startCountdown();

    // Update match state
    this.gameState.getGameMatch()?.setState(MatchStateType.InProgress);
  }

  private sendGoalTimerEndEvent() {
    const goalTimerEndEvent = new GameEvent(EventType.GoalEnd, null);

    this.gameController
      .getEventsProcessorService()
      .sendEvent(goalTimerEndEvent);
  }

  private detectGameEnd() {
    if (this.gameState.getGameMatch()?.getState() === MatchStateType.GameOver) {
      return;
    }

    if (this.scoreboardObject?.hasTimerFinished() === true) {
      this.handleTimerEnd();
    }
  }

  private handleTimerEnd(): void {
    // Get all players and find the best player
    const players = this.gameState.getGameMatch()?.getPlayers() || [];

    // Find the player with the highest score
    let winner = this.gameState.getGamePlayer();

    for (const player of players) {
      if (player.getScore() > winner.getScore()) {
        winner = player;
      }
    }

    // Check for a tie among all players
    const isTie = players.every(
      (player) => player.getScore() === winner.getScore()
    );
    if (isTie) return;

    this.sendGameOverStartEvent(winner);
    this.handleGameOverStart(winner);
  }

  private sendGameOverStartEvent(winner: GamePlayer): void {
    const playerId: string = winner.getId();

    const arrayBuffer = new ArrayBuffer(36);
    new Uint8Array(arrayBuffer).set(new TextEncoder().encode(playerId), 0);

    const gameOverStartEvent = new GameEvent(
      EventType.GameOverStart,
      arrayBuffer
    );

    this.gameController
      .getEventsProcessorService()
      .sendEvent(gameOverStartEvent);
  }

  private handleGameOverStartEvent(arrayBuffer: ArrayBuffer | null): void {
    if (arrayBuffer === null) {
      return console.warn("Array buffer is null");
    }

    this.gameState.getGameMatch()?.setState(1);
    this.ballObject?.setInactive();

    const playerId = new TextDecoder().decode(arrayBuffer);
    const player = this.gameState.getGameMatch()?.getPlayer(playerId) ?? null;

    this.handleGameOverStart(player);
  }

  private handleGameOverStart(winner: GamePlayer | null) {
    // Pause ball and countdown
    this.ballObject?.setInactive();
    this.gameState.getGameMatch()?.setState(MatchStateType.GameOver);

    // Determine winner details and show alert
    const playerName = winner?.getName().toUpperCase() ?? "UNKNOWN";
    const playerTeam =
      winner === this.gameState.getGamePlayer() ? "blue" : "red";

    this.alertObject?.show([playerName, "WINS!"], playerTeam);

    // Timer
    this.gameController.addTimer(5, this.handleGameOverEnd.bind(this));

    // Save player score
    this.gameController.getMatchmakingService().savePlayerScore();
  }

  private handleGameOverEnd() {
    console.log("Game over end");

    this.gameController.getMatchmakingService().handleGameOver();

    const mainScreen = new MainScreen(this.gameController);
    const mainMenuScreen = new MainMenuScreen(this.gameController, false);

    mainScreen.setScreen(mainMenuScreen);
    mainScreen.loadObjects();

    this.gameController.getTransitionService().fadeOutAndIn(mainScreen, 1, 1);
  }
}
