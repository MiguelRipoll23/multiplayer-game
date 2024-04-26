import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { PlayerObject } from "../objects/player-object.js";
import { WorldBackgroundObject } from "../objects/world-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
import { BallObject } from "../objects/ball-object.js";
export class WorldScreen extends BaseGameScreen {
    canvas;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    loadObjects() {
        this.loadBackgroundObject();
        this.loadBallObject();
        this.loadGoalObjects();
        this.loadPlayerAndLocalCarObjects();
        super.loadObjects();
    }
    loadBackgroundObject() {
        const backgroundObject = new WorldBackgroundObject(this.canvas);
        this.sceneObjects.push(backgroundObject);
    }
    loadBallObject() {
        const ballObject = new BallObject(0, 0, 90, this.canvas);
        ballObject.setCenterPosition();
        this.sceneObjects.push(ballObject);
    }
    loadGoalObjects() {
        const goalObject1 = new GoalObject(false, this.canvas);
        this.sceneObjects.push(goalObject1);
        const goalObject2 = new GoalObject(true, this.canvas);
        this.sceneObjects.push(goalObject2);
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
