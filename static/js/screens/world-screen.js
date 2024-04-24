import { GearStick } from "../objects/gear-stick.js";
import { Joystick } from "../objects/joystick.js";
import { LocalCar } from "../objects/car-local.js";
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
        this.gearStick = new GearStick(this.canvas);
        this.uiObjects.push(this.gearStick);
        this.joystick = new Joystick(this.canvas);
        this.uiObjects.push(this.joystick);
    }
    addLocalCar() {
        const localCar = new LocalCar(this.canvas.width / 2 - 25, this.canvas.height / 2 - 25, 90, this.canvas);
        if (this.joystick && this.gearStick) {
            localCar.setControls(this.joystick, this.gearStick);
        }
        this.sceneObjects.push(localCar);
    }
}
