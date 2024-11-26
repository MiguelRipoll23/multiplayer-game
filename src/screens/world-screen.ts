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
import { ToastObject } from "../objects/common/toast-object.js";
import { TeamType } from "../types/team-type.js";
import { RemoteCarObject } from "../objects/remote-car-object.js";
import { ObjectStateType } from "../types/object-state-type.js";
import { GamePlayer } from "../models/game-player.js";
import { EventType } from "../types/event-type.js";
import { RemoteEvent } from "../models/remote-event.js";
import { ScreenType } from "../types/screen-type.js";
import { MainScreen } from "./main-screen.js";
import { MainMenuScreen } from "./main-screen/main-menu-screen.js";
import { MatchStateType } from "../types/match-state-type.js";
import { PlayerConnectedPayload } from "../services/interfaces/events/player-connected-payload.js";
import { PlayerDisconnectedPayload } from "../services/interfaces/events/player-disconnected-payload.js";

export class WorldScreen extends BaseCollidingGameScreen {
  private gameState: GameState;
  private scoreboardObject: ScoreboardObject | null = null;
  private localCarObject: LocalCarObject | null = null;
  private ballObject: BallObject | null = null;
  private goalObject: GoalObject | null = null;
  private alertObject: AlertObject | null = null;
  private toastObject: ToastObject | null = null;

  private countdownNumber = 4;

  constructor(protected gameController: GameController) {
    super(gameController);
    this.gameState = gameController.getGameState();
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
    this.scoreboardObject?.reset(); // P58a2
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    super.update(deltaTimeStamp);

    this.listenForEvents();
    this.detectScoresIfHost();

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

  private handleMatchAdvertised(): void {
    if (this.gameState.getGameMatch()?.getPlayers().length === 1) {
      this.toastObject?.show("Waiting for players...");
    }
  }

  private handlePlayerConnection(payload: PlayerConnectedPayload): void {
    const { player, matchmaking } = payload;

    this.toastObject?.hide();

    if (matchmaking) {
      this.toastObject?.show(`Joined to <em>${player.getName()}</em>`, 2);
      this.updateScoreboard();
    } else {
      this.toastObject?.show(`<em>${player.getName()}</em> joined`, 2);

      const matchState = this.gameState.getGameMatch()?.getState();

      if (matchState === MatchStateType.WaitingPlayers) {
        this.showCountdown();
      }
    }
  }

  private handlePlayerDisconnection(payload: PlayerDisconnectedPayload): void {
    const { player } = payload;

    this.getObjectsByOwner(player).forEach((object) => {
      object.setState(ObjectStateType.Inactive);
    });

    this.toastObject?.show(`<em>${player.getName()}</em> left`, 2);

    const playersCount =
      this.gameState.getGameMatch()?.getPlayers().length ?? 0;

    if (playersCount === 1) {
      this.handleWaitingForPlayers();
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

  private listenForEvents(): void {
    this.listenForLocalEvents();
    this.listenForRemoteEvents();
  }

  private listenForLocalEvents(): void {
    this.gameController
      .getEventsProcessorService()
      .listenLocalEvent(
        EventType.MatchAdvertised,
        this.handleMatchAdvertised.bind(this)
      );

    this.gameController
      .getEventsProcessorService()
      .listenLocalEvent<PlayerConnectedPayload>(
        EventType.PlayerConnected,
        this.handlePlayerConnection.bind(this)
      );

    this.gameController
      .getEventsProcessorService()
      .listenLocalEvent<PlayerDisconnectedPayload>(
        EventType.PlayerDisconnected,
        this.handlePlayerDisconnection.bind(this)
      );
  }

  private listenForRemoteEvents(): void {
    this.gameController
      .getEventsProcessorService()
      .listenRemoteEvent(
        EventType.Countdown,
        this.handleRemoteCountdown.bind(this)
      );

    this.gameController
      .getEventsProcessorService()
      .listenRemoteEvent(EventType.GoalStart, this.handleRemoteGoal.bind(this));

    this.gameController
      .getEventsProcessorService()
      .listenRemoteEvent(
        EventType.GameOverStart,
        this.handleRemoteGameOverStartEvent.bind(this)
      );
  }

  private showCountdown() {
    this.gameState.getGameMatch()?.setState(MatchStateType.Countdown);
    console.log("Countdown number", this.countdownNumber);

    if (this.countdownNumber === -1) {
      this.countdownNumber = 4;
    }

    if (this.gameState.getGameMatch()?.isHost()) {
      this.sendCountdownEvent();
    }

    // Decrement countdown number
    this.countdownNumber -= 1;

    // Reset local objects
    if (this.countdownNumber === 3) {
      this.resetForCountdown();
    }

    // Countdown text
    let text = this.countdownNumber.toString();

    if (this.countdownNumber < 1) {
      text = "GO!";
    }

    // Only show for 3, 2, 1 and GO!
    if (this.countdownNumber > -1) {
      this.alertObject?.show([text], "#FFFF00");
    }

    // If 2 seconds since GO! start the game
    if (this.countdownNumber === -1) {
      return this.handleCountdownEnd();
    }

    // Add timer for next countdown if host
    if (this.gameState.getGameMatch()?.isHost()) {
      this.gameController.addTimer(1, this.showCountdown.bind(this));
    }
  }

  private resetForCountdown() {
    if (this.gameState.getGameMatch()?.isHost()) {
      this.ballObject?.reset();
    }

    this.localCarObject?.reset();
    this.localCarObject?.setActive(false);
    this.ballObject?.setInactive(false);
  }

  private handleRemoteCountdown(arrayBuffer: ArrayBuffer | null) {
    if (arrayBuffer === null) {
      return console.warn("Array buffer is null");
    }

    const countdownNumber = new DataView(arrayBuffer).getInt32(0);

    this.countdownNumber = countdownNumber;
    this.showCountdown();
  }

  private handleCountdownEnd() {
    console.log("Countdown end");
    this.gameState.getGameMatch()?.setState(MatchStateType.InProgress);

    this.alertObject?.hide();
    this.localCarObject?.reset();
    this.ballObject?.reset();
    this.scoreboardObject?.startCountdown();
  }

  private sendCountdownEvent() {
    const arrayBuffer = new ArrayBuffer(4);
    new DataView(arrayBuffer).setInt32(0, this.countdownNumber);

    const countdownStartEvent = new RemoteEvent(EventType.Countdown);
    countdownStartEvent.setBuffer(arrayBuffer);

    this.gameController
      .getEventsProcessorService()
      .sendEvent(countdownStartEvent);
  }

  private handleWaitingForPlayers(): void {
    this.gameState.getGameMatch()?.setState(MatchStateType.WaitingPlayers);
    this.scoreboardObject?.stopCountdown();
  }

  private detectScoresIfHost(): void {
    const host = this.gameState.getGameMatch()?.isHost() ?? false;
    const matchState = this.gameState.getGameMatch()?.getState();

    if (host && matchState === MatchStateType.InProgress) {
      this.detectScores();
      this.detectGameEnd();
    }
  }

  private detectScores(): void {
    if (this.ballObject === null) {
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

  private handleGoalScored() {
    const player = this.ballObject?.getLastPlayer() ?? null;

    if (player === null) {
      return console.warn("Player is null");
    }

    // Pause ball and countdown
    this.ballObject?.handleGoalScored();
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
    this.gameController.addTimer(5, this.handleGoalTimeEnd.bind(this));
  }

  private sendGoalEvent(player: GamePlayer) {
    const playerId: string = player.getId();
    const playerScore: number = player.getScore();

    const arrayBuffer = new ArrayBuffer(36 + 4);

    new Uint8Array(arrayBuffer).set(new TextEncoder().encode(playerId), 0);
    new DataView(arrayBuffer).setInt32(36, playerScore);

    const goalEvent = new RemoteEvent(EventType.GoalStart);
    goalEvent.setBuffer(arrayBuffer);

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
    this.ballObject?.handleGoalScored();
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

  private handleGoalTimeEnd() {
    if (this.scoreboardObject?.hasTimerFinished() === true) {
      return;
    }

    this.showCountdown();
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

    if (isTie) {
      return;
    }

    this.sendGameOverStartEvent(winner);
    this.handleGameOverStart(winner);
  }

  private sendGameOverStartEvent(winner: GamePlayer): void {
    const playerId: string = winner.getId();

    const arrayBuffer = new ArrayBuffer(36);
    new Uint8Array(arrayBuffer).set(new TextEncoder().encode(playerId), 0);

    const gameOverStartEvent = new RemoteEvent(EventType.GameOverStart);
    gameOverStartEvent.setBuffer(arrayBuffer);

    this.gameController
      .getEventsProcessorService()
      .sendEvent(gameOverStartEvent);
  }

  private handleRemoteGameOverStartEvent(
    arrayBuffer: ArrayBuffer | null
  ): void {
    if (arrayBuffer === null) {
      return console.warn("Array buffer is null");
    }

    const playerId = new TextDecoder().decode(arrayBuffer);
    const player = this.gameState.getGameMatch()?.getPlayer(playerId) ?? null;

    this.handleGameOverStart(player);
  }

  private handleGameOverStart(winner: GamePlayer | null) {
    // Pause ball and countdown
    this.gameState.getGameMatch()?.setState(MatchStateType.GameOver);
    this.ballObject?.setInactive(true);

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
