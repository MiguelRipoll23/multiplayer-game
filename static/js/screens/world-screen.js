import { LocalCarObject } from "../objects/local-car-object.js";
import { PlayerObject } from "../objects/player-object.js";
import { WorldBackgroundObject } from "../objects/backgrounds/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
import { ScoreboardObject } from "../objects/scoreboard-object.js";
import { StatusObject } from "../objects/status-object.js";
import { BaseCollidingGameScreen } from "./base/base-colliding-game-screen.js";
export class WorldScreen extends BaseCollidingGameScreen {
    scoreboardObject = null;
    ballObject = null;
    orangeGoalObject = null;
    blueGoalObject = null;
    constructor(gameLoop) {
        super(gameLoop);
    }
    loadObjects() {
        this.createBackgroundObject();
        this.createScoreboardObject();
        this.createPlayerAndLocalCarObjects();
        this.createBallObject();
        this.createGoalObjects();
        this.createStatusObject();
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
        this.scoreboardObject = new ScoreboardObject(this.canvas);
        this.scoreboardObject.startCountdown(60 * 5);
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
    createAndGetPlayerObject() {
        const playerObject = new PlayerObject("player1");
        this.sceneObjects.push(playerObject);
        return playerObject;
    }
    createStatusObject() {
        const statusObject = new StatusObject(this.canvas);
        statusObject.setText("Waiting for players");
        statusObject.setActive(true);
        this.uiObjects.push(statusObject);
    }
    update(deltaTimeStamp) {
        super.update(deltaTimeStamp);
        this.detectScores();
    }
    detectScores() {
        if (this.ballObject === null ||
            this.ballObject.isInactive()) {
            return;
        }
        const hasOrangeTeamScored = this.orangeGoalObject?.getCollidingObjects()
            .includes(this.ballObject);
        if (hasOrangeTeamScored) {
            this.ballObject.setInactive();
            this.scoreboardObject?.incrementBlueScore();
        }
        const hasBlueTeamScored = this.blueGoalObject?.getCollidingObjects()
            .includes(this.ballObject);
        if (hasBlueTeamScored) {
            this.ballObject.setInactive();
            this.scoreboardObject?.incrementOrangeScore();
        }
    }
}
