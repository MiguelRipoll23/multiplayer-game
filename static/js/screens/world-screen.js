import { LocalCarObject } from "../objects/local-car-object.js";
import { WorldBackgroundObject } from "../objects/backgrounds/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
import { ScoreboardObject } from "../objects/scoreboard-object.js";
import { BaseCollidingGameScreen } from "./base/base-colliding-game-screen.js";
import { getConfigurationKey } from "../utils/configuration-utils.js";
import { SCOREBOARD_SECONDS_DURATION } from "../constants/configuration-constants.js";
import { LocalPlayerObject } from "../objects/local-player-object.js";
import { AlertObject } from "../objects/alert-object.js";
export class WorldScreen extends BaseCollidingGameScreen {
    gameController;
    gameState;
    scoreboardObject = null;
    ballObject = null;
    orangeGoalObject = null;
    blueGoalObject = null;
    alertObject = null;
    constructor(gameController) {
        super(gameController);
        this.gameController = gameController;
        this.gameState = gameController.getGameState();
    }
    loadObjects() {
        this.createBackgroundObject();
        this.createScoreboardObject();
        this.createPlayerAndLocalCarObjects();
        this.createBallObject();
        this.createGoalObjects();
        this.createAlertObject();
        super.loadObjects();
    }
    createBackgroundObject() {
        const backgroundObject = new WorldBackgroundObject(this.canvas);
        this.sceneObjects.push(backgroundObject);
        backgroundObject.getCollisionHitboxes().forEach((object) => {
            this.sceneObjects.push(object);
        });
    }
    createScoreboardObject() {
        const durationSeconds = getConfigurationKey(SCOREBOARD_SECONDS_DURATION, 60 * 5, this.gameState);
        this.scoreboardObject = new ScoreboardObject(this.canvas);
        this.scoreboardObject.startCountdown(durationSeconds);
        this.sceneObjects.push(this.scoreboardObject);
    }
    createBallObject() {
        this.ballObject = new BallObject(0, 0, this.canvas);
        this.ballObject.setCenterPosition();
        this.sceneObjects.push(this.ballObject);
    }
    createGoalObjects() {
        this.orangeGoalObject = new GoalObject(true, this.canvas);
        this.blueGoalObject = new GoalObject(false, this.canvas);
        this.sceneObjects.push(this.orangeGoalObject);
        this.sceneObjects.push(this.blueGoalObject);
    }
    createPlayerAndLocalCarObjects() {
        const gamePointer = this.gameController.getGamePointer();
        const gameKeyboard = this.gameController.getGameKeyboard();
        const playerObject = this.createAndGetPlayerObject();
        const localCarObject = new LocalCarObject(0, 0, 90, this.canvas, gamePointer, gameKeyboard);
        localCarObject.setCenterPosition();
        localCarObject.setPlayerObject(playerObject);
        // Scene
        this.sceneObjects.push(localCarObject);
        // UI
        this.uiObjects.push(localCarObject.getGearStickObject());
        this.uiObjects.push(localCarObject.getJoystickObject());
    }
    createAndGetPlayerObject() {
        const player = this.gameState.getGamePlayer();
        const playerObject = new LocalPlayerObject(player);
        this.sceneObjects.push(playerObject);
        return playerObject;
    }
    createAlertObject() {
        this.alertObject = new AlertObject(this.canvas);
        this.uiObjects.push(this.alertObject);
    }
    update(deltaTimeStamp) {
        super.update(deltaTimeStamp);
        this.detectScores();
    }
    detectScores() {
        if (this.ballObject === null || this.ballObject?.isInactive()) {
            return;
        }
        const hasOrangeTeamScored = this.orangeGoalObject
            ?.getCollidingObjects()
            .includes(this.ballObject);
        if (hasOrangeTeamScored) {
            this.handleGoalScored(true);
        }
        const hasBlueTeamScored = this.blueGoalObject
            ?.getCollidingObjects()
            .includes(this.ballObject);
        if (hasBlueTeamScored) {
            this.handleGoalScored(false);
        }
    }
    handleGoalScored(orange) {
        this.ballObject?.setInactive();
        if (orange) {
            this.scoreboardObject?.incrementOrangeScore();
        }
        else {
            this.scoreboardObject?.incrementBlueScore();
        }
        this.showGoalAlert();
    }
    showGoalAlert() {
        const playerObject = this.ballObject?.getLastPlayerObject();
        const playerName = playerObject?.getName().toUpperCase() || "UNKNOWN";
        this.alertObject?.show(`${playerName} SCORED!`);
    }
}
