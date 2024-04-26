import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { PlayerObject } from "../objects/player-object.js";
import { WorldBackgroundObject } from "../objects/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
import { CountdownObject } from "../objects/countdown-object.js";
import { ScoreObject } from "../objects/score-object.js";
export class WorldScreen extends BaseGameScreen {
    canvas;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    loadObjects() {
        this.loadBackgroundObject();
        this.loadCountdownObject();
        this.loadScoreObjects();
        this.loadBallObject();
        this.loadPlayerAndLocalCarObjects();
        this.loadGoalObjects();
        super.loadObjects();
    }
    loadBackgroundObject() {
        const backgroundObject = new WorldBackgroundObject(this.canvas);
        this.sceneObjects.push(backgroundObject);
    }
    loadCountdownObject() {
        const countdownObject = new CountdownObject(this.canvas);
        countdownObject.startCountdown(60 * 5);
        this.sceneObjects.push(countdownObject);
    }
    loadScoreObjects() {
        const orangeScoreObject = new ScoreObject(false, this.canvas);
        const blueScoreObject = new ScoreObject(true, this.canvas);
        this.sceneObjects.push(orangeScoreObject);
        this.sceneObjects.push(blueScoreObject);
    }
    loadBallObject() {
        const ballObject = new BallObject(0, 0, 90, this.canvas);
        ballObject.setCenterPosition();
        this.sceneObjects.push(ballObject);
    }
    loadGoalObjects() {
        const orangeGoalObject = new GoalObject(true, this.canvas);
        const blueGoalObject = new GoalObject(false, this.canvas);
        this.sceneObjects.push(orangeGoalObject);
        this.sceneObjects.push(blueGoalObject);
    }
    loadPlayerAndLocalCarObjects() {
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
    loadAndGetPlayerObject() {
        const playerObject = new PlayerObject("player1");
        this.sceneObjects.push(playerObject);
        return playerObject;
    }
}
