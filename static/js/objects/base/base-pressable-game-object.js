import { BaseAnimatedGameObject } from "./base-animated-object.js";
export class BasePressableGameObject extends BaseAnimatedGameObject {
    stealFocus;
    width = 0;
    height = 0;
    active = true;
    hovering = false;
    pressed = false;
    constructor(stealFocus = false) {
        super();
        this.stealFocus = stealFocus;
    }
    setActive(active) {
        if (active) {
            console.log(this.constructor.name + " activated");
        }
        else {
            console.log(this.constructor.name + " deactivated");
        }
        this.active = active;
    }
    isActive() {
        return this.active;
    }
    isHovering() {
        return this.hovering;
    }
    isPressed() {
        return this.pressed;
    }
    handlePointerEvent(gamePointer) {
        if (this.stealFocus || this.isPointerWithinBounds(gamePointer)) {
            if (gamePointer.getType() === "mouse") {
                this.hovering = true;
            }
            if (gamePointer.isPressed()) {
                console.log(this.constructor.name + " pressed");
                this.pressed = true;
            }
        }
    }
    update(deltaTimeStamp) {
        this.hovering = false;
        this.pressed = false;
        super.update(deltaTimeStamp);
    }
    render(context) {
        if (this.debug && this.active) {
            context.save();
            if (this.stealFocus) {
                this.drawFullScreenRectangle(context);
            }
            else {
                this.drawRotatedRectangle(context);
            }
            context.restore();
        }
    }
    isPointerWithinBounds(gamePointer) {
        const pointerX = gamePointer.getX();
        const pointerY = gamePointer.getY();
        return (pointerX >= this.x && pointerX <= this.x + this.width &&
            pointerY >= this.y && pointerY <= this.y + this.height);
    }
    drawFullScreenRectangle(context) {
        context.lineWidth = 8; // Set the border width
        context.strokeStyle = "rgba(148, 0, 211, 0.8)";
        context.beginPath();
        context.rect(0, 0, context.canvas.width, context.canvas.height);
        context.stroke();
        context.closePath();
    }
    drawRotatedRectangle(context) {
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.angle);
        context.strokeStyle = "rgba(148, 0, 211, 0.8)";
        context.beginPath();
        context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        context.stroke();
        context.closePath();
    }
}
