import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";
export class LocalCarObject extends CarObject {
    joystickObject;
    gearStickObject;
    constructor(x, y, angle, canvas) {
        super(x, y, angle, canvas);
        this.joystickObject = new JoystickObject(this.canvas);
        this.gearStickObject = new GearStickObject(this.canvas);
    }
    update(deltaFrameMilliseconds) {
        this.handleControls();
        super.update(deltaFrameMilliseconds);
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
            if (currentGear === "F" && this.speed < this.topSpeed) {
                this.speed += this.acceleration;
            }
            else if (currentGear === "R" && this.speed > -this.topSpeed) {
                this.speed -= this.acceleration;
            }
        }
        this.angle += this.handling *
            (this.speed / this.topSpeed) *
            this.joystickObject.getControlX();
    }
}
