import { LocalCarObject } from "../objects/local-car-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
export class WorldScreen extends BaseGameScreen {
    canvas;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    loadObjects() {
        this.addLocalCarObjects();
        super.loadObjects();
    }
    addLocalCarObjects() {
        const localCarObject = new LocalCarObject(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 90, this.canvas);
        this.uiObjects.push(localCarObject.getJoystick());
        this.uiObjects.push(localCarObject.getGearStick());
        this.sceneObjects.push(localCarObject);
    }
}
