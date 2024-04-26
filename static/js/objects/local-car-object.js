import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";
export class LocalCarObject extends CarObject {
    joystickObject;
    gearStickObject;
    constructor(x, y, angle, canvas) {
        super(x, y, angle, true, canvas);
        this.joystickObject = new JoystickObject(this.canvas);
        this.gearStickObject = new GearStickObject(this.canvas);
    }
    update(deltaTimeStamp) {
        this.handleControls();
        super.update(deltaTimeStamp);
    }
    render(context) {
        super.render(context);
    }
    getJoystickObject() {
        return this.joystickObject;
    }
    getGearStickObject() {
        return this.gearStickObject;
    }
    handleControls() {
        if (!this.joystickObject || !this.gearStickObject)
            return;
        if (this.gearStickObject.isActive()) {
            return;
        }
        const currentGear = this.gearStickObject.getCurrentGear();
        if (this.joystickObject.isActive()) {
            if (currentGear === "F" && this.speed < this.TOP_SPEED) {
                this.speed += this.ACCELERATION;
            }
            else if (currentGear === "R" && this.speed > -this.TOP_SPEED) {
                this.speed -= this.ACCELERATION;
            }
        }
        this.angle +=
            this.HANDLING *
                (this.speed / this.TOP_SPEED) *
                this.joystickObject.getControlX();
    }
}
