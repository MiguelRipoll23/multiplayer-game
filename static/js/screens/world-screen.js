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
        const playerObject = this.loadAndGetPlayerObject();
        this.loadLocalCarObjects(playerObject);
        super.loadObjects();
    }
    loadAndGetPlayerObject() {
        const playerObject = new PlayerObject("player1");
        this.sceneObjects.push(playerObject);
        return playerObject;
    }
    loadLocalCarObjects(playerObject) {
        const localCarObject = new LocalCarObject(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 90, this.canvas);
        localCarObject.setPlayerObject(playerObject);
        // Scene
        this.sceneObjects.push(localCarObject);
        // UI
        this.uiObjects.push(localCarObject.getGearStickObject());
        this.uiObjects.push(localCarObject.getJoystickObject());
    }
}
