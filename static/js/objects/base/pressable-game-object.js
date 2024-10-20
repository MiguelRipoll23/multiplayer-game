import { BaseGameObject } from "./base-game-object.js";
export class PressableBaseGameObject extends BaseGameObject {
    canvas;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    active = true;
    pressed = false;
    constructor(canvas) {
        super();
        this.canvas = canvas;
    }
    setActive(active) {
        this.active = active;
    }
    isActive() {
        return this.active;
    }
    isPressed() {
        return this.pressed;
    }
    resetPressedState() {
        this.pressed = false;
    }
    handleTouchEnd(event) {
        const touch = event.changedTouches[0];
        const pointerX = touch.clientX - this.canvas.getBoundingClientRect().left;
        const pointerY = touch.clientY - this.canvas.getBoundingClientRect().top;
        this.handlePointerEvent(pointerX, pointerY);
    }
    handleMouseUp(event) {
        const pointerX = event.clientX - this.canvas.getBoundingClientRect().left;
        const pointerY = event.clientY - this.canvas.getBoundingClientRect().top;
        this.handlePointerEvent(pointerX, pointerY);
    }
    handlePointerEvent(pointerX, pointerY) {
        if (pointerX >= this.x &&
            pointerX <= this.x + this.width &&
            pointerY >= this.y &&
            pointerY <= this.y + this.height) {
            this.pressed = true;
        }
    }
    update(deltaTimeStamp) {
        this.pressed = false;
        super.update(deltaTimeStamp);
    }
    render(context) {
        if (this.active) {
            context.strokeStyle = "red";
            context.beginPath();
            context.rect(this.x, this.y, this.width, this.height);
            context.stroke();
            context.closePath();
        }
    }
}
