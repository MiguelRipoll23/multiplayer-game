import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";
export class LocalCarObject extends CarObject {
    canvas;
    joystickObject;
    gearStickObject;
    constructor(x, y, angle, canvas, gamePointer, gameKeyboard) {
        super(x, y, angle, false, canvas);
        this.canvas = canvas;
        this.joystickObject = new JoystickObject(canvas, gamePointer, gameKeyboard);
        this.gearStickObject = new GearStickObject(canvas, gamePointer, gameKeyboard);
    }
    getJoystickObject() {
        return this.joystickObject;
    }
    getGearStickObject() {
        return this.gearStickObject;
    }
    reset() {
        this.angle = 90;
        this.setCenterPosition();
    }
    update(deltaTimeStamp) {
        this.handleControls();
        super.update(deltaTimeStamp);
    }
    render(context) {
        // Debug
        this.renderDebugInformation(context);
        super.render(context);
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
    renderDebugInformation(context) {
        if (this.debug === false) {
            return;
        }
        this.renderDebugPositionInformation(context);
        this.renderDebugAngleInformation(context);
        this.renderDebugIsOutsideBounds(context);
    }
    renderDebugPositionInformation(context) {
        const displayX = Math.round(this.x);
        const displayY = Math.round(this.y);
        const text = `Position: X(${displayX}) Y(${displayY})`;
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(24, 24, 120, 10);
        context.fillStyle = "#FFFF00";
        context.font = "8px system-ui";
        context.textAlign = "left";
        context.fillText(text, 28, 32);
    }
    renderDebugAngleInformation(context) {
        const displayAngle = Math.round(this.angle);
        const text = `Angle: ${displayAngle}`;
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(24, 36, 60, 10);
        context.fillStyle = "#FFFF00";
        context.font = "8px system-ui";
        context.textAlign = "left";
        context.fillText(text, 28, 44);
    }
    renderDebugIsOutsideBounds(context) {
        const outsideBounds = this.x < 0 ||
            this.x > this.canvas.width ||
            this.y < 0 ||
            this.y > this.canvas.height;
        context.fillStyle = "rgba(255, 255, 255, 0.6)";
        context.fillRect(24, 48, 120, 10);
        context.fillStyle = "purple";
        context.font = "8px system-ui";
        context.textAlign = "left";
        context.fillText("Outside Bounds: " + outsideBounds, 28, 56);
    }
}
