import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
import { PlayerObject } from "../objects/player-object.js";
export class WorldScreen extends BaseGameScreen {
    canvas;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    loadObjects() {
        this.loadInitialObjects();
        super.loadObjects();
    }
    loadInitialObjects() {
        const playerObject = new PlayerObject("player1");
        const localCarObject = this.createLocalCarObject();
        localCarObject.setPlayerObject(playerObject);
        this.uiObjects.push(localCarObject.getJoystickObject());
        this.uiObjects.push(localCarObject.getGearStickObject());
        this.sceneObjects.push(playerObject);
        this.sceneObjects.push(localCarObject);
    }
    createLocalCarObject() {
        return new LocalCarObject(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 90, this.canvas);
    }
}
