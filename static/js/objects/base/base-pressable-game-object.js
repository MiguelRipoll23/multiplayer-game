import { BaseGameObject } from "./base-game-object.js";
export class BasePressableGameObject extends BaseGameObject {
    x = 0;
    y = 0;
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
            context.strokeStyle = "rgba(148, 0, 211, 0.8)";
            context.beginPath();
            context.rect(this.x, this.y, this.width, this.height);
            context.stroke();
            context.closePath();
        }
    }
}
