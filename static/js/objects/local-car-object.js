import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";
export class LocalCarObject extends CarObject {
    joystick;
    gearStick;
    constructor(x, y, angle, canvas) {
        super(x, y, angle, canvas);
        this.joystick = new JoystickObject(this.canvas);
        this.gearStick = new GearStickObject(this.canvas);
    }
    update(deltaFrameMilliseconds) {
        this.handleControls();
        super.update(deltaFrameMilliseconds);
    }
    render(context) {
        super.render(context);
    }
    getJoystick() {
        return this.joystick;
    }
    getGearStick() {
        return this.gearStick;
    }
    handleControls() {
        if (!this.joystick || !this.gearStick)
            return;
        if (this.gearStick.isActive()) {
            return;
        }
        const currentGear = this.gearStick.getCurrentGear();
        if (this.joystick.isActive()) {
            if (currentGear === "F" && this.speed < this.topSpeed) {
                this.speed += this.acceleration;
            }
            else if (currentGear === "R" && this.speed > -this.topSpeed) {
                this.speed -= this.acceleration;
            }
        }
        this.angle += this.handling *
            (this.speed / this.topSpeed) *
            this.joystick.getControlX();
    }
}
