import { GearStickObject } from "../objects/gear-stick-object.js";
import { JoystickObject } from "../objects/joystick-object.js";
import { LocalCarObject } from "../objects/car-local-object.js";
import { BaseGameScreen } from "./base/base-game-screen.js";
export class WorldScreen extends BaseGameScreen {
    canvas;
    joystick = null;
    gearStick = null;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    loadObjects() {
        this.addControls();
        this.addLocalCar();
        super.loadObjects();
    }
    addControls() {
        this.gearStick = new GearStickObject(this.canvas);
        this.uiObjects.push(this.gearStick);
        this.joystick = new JoystickObject(this.canvas);
        this.uiObjects.push(this.joystick);
    }
    addLocalCar() {
        const localCar = new LocalCarObject(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 90, this.canvas);
        if (this.joystick && this.gearStick) {
            localCar.setControls(this.joystick, this.gearStick);
        }
        this.sceneObjects.push(localCar);
    }
}
