import { CarObject } from "./car-object.js";
export class LocalCarObject extends CarObject {
    joystick = null;
    gearStick = null;
    constructor(x, y, angle, canvas) {
        super(x, y, angle, canvas);
    }
    update(deltaTimeStamp) {
        this.handleControls();
        super.update(deltaTimeStamp);
    }
    render(context) {
        super.render(context);
    }
    setControls(joystick, gearStick) {
        this.joystick = joystick;
        this.gearStick = gearStick;
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
        this.angle +=
            this.handling *
                (this.speed / this.topSpeed) *
                this.joystick.getControlX();
    }
}
