import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { PlayerObject } from "../objects/player-object.js";
import { GrassBackground } from "../objects/grass-background-object.js";
import { GoalObject } from "../objects/goal-object.js";
export class WorldScreen extends BaseGameScreen {
    canvas;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    loadObjects() {
        this.loadBackgroundObject();
        const goalObject1 = new GoalObject(false, this.canvas);
        this.sceneObjects.push(goalObject1);
        const goalObject2 = new GoalObject(true, this.canvas);
        this.sceneObjects.push(goalObject2);
        const playerObject = this.loadAndGetPlayerObject();
        this.loadLocalCarObjects(playerObject);
        super.loadObjects();
    }
    loadAndGetPlayerObject() {
        const playerObject = new PlayerObject("player1");
        this.sceneObjects.push(playerObject);
        return playerObject;
    }
    loadBackgroundObject() {
        const backgroundObject = new GrassBackground();
        this.sceneObjects.push(backgroundObject);
    }
    loadLocalCarObjects(playerObject) {
        const localCarObject = new LocalCarObject(0, 0, 90, this.canvas);
        localCarObject.setCenterPosition();
        localCarObject.setPlayerObject(playerObject);
        // Scene
        this.sceneObjects.push(localCarObject);
        // UI
        this.uiObjects.push(localCarObject.getGearStickObject());
        this.uiObjects.push(localCarObject.getJoystickObject());
    }
}
