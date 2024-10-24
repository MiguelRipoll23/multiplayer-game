import { BaseAnimatedGameObject } from "./base-animated-object.js";
export class BasePressableGameObject extends BaseAnimatedGameObject {
    width = 0;
    height = 0;
    active = true;
    hovering = false;
    pressed = false;
    constructor() {
        super();
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
        const pointerX = gamePointer.getX();
        const pointerY = gamePointer.getY();
        if (pointerX < this.x || pointerX > this.x + this.width ||
            pointerY < this.y || pointerY > this.y + this.height) {
            this.hovering = false;
            return;
        }
        this.hovering = true;
        if (gamePointer.isPressed()) {
            this.pressed = true;
            console.log(this.constructor.name + " pressed");
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
            // Translate context to the object's center
            context.translate(this.x + this.width / 2, this.y + this.height / 2);
            // Apply the rotation
            context.rotate(this.angle);
            // Set the stroke style for the hitbox
            context.strokeStyle = "rgba(148, 0, 211, 0.8)";
            // Draw the rectangle (centered, so offset by half the width/height)
            context.beginPath();
            context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            context.stroke();
            context.closePath();
            // Restore the context
            context.restore();
        }
    }
}
