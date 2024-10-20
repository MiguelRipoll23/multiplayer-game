import { BaseGameObject } from "./base/base-game-object.js";
export class MenuOptionObject extends BaseGameObject {
    canvas;
    index;
    x = 0;
    y = 0;
    textX = 0;
    textY = 0;
    width = 200; // Adjust as needed
    height = 120; // Adjust as needed
    text;
    active = false;
    pressed = false;
    constructor(canvas, index, text) {
        super();
        this.canvas = canvas;
        this.index = index;
        this.width = canvas.width - 70; // Adjust width as needed
        this.text = text.toUpperCase(); // Convert text to uppercase
        this.addEventListeners();
    }
    getIndex() {
        return this.index;
    }
    getHeight() {
        return this.height;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.calculateTextPosition();
    }
    setActive(active) {
        this.active = active;
    }
    isPressed() {
        return this.pressed;
    }
    reset() {
        this.pressed = false;
    }
    render(context) {
        // Draw rectangle with gradient
        context.fillStyle = "black"; // Black color for the rectangle
        context.fillRect(this.x, this.y, this.width, this.height);
        // Set text properties
        context.fillStyle = "#FFFFFF"; // White color for the text
        context.font = "bold 28px system-ui"; // Adjust font size and family as needed
        context.textAlign = "center";
        // Draw the text
        context.fillText(this.text, this.textX, this.textY);
    }
    calculateTextPosition() {
        this.textX = this.x + this.width / 2 + 8;
        this.textY = this.y + this.height / 2 + 8;
    }
    addEventListeners() {
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
            passive: true,
        });
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    }
    handleTouchEnd(event) {
        const touch = event.changedTouches[0];
        const x = touch.clientX - this.canvas.getBoundingClientRect().left;
        const y = touch.clientY - this.canvas.getBoundingClientRect().top;
        this.handlePointerEvent(x, y);
    }
    handleMouseUp(event) {
        const x = event.clientX - this.canvas.getBoundingClientRect().left;
        const y = event.clientY - this.canvas.getBoundingClientRect().top;
        this.handlePointerEvent(x, y);
    }
    handlePointerEvent(x, y) {
        if (this.active === false) {
            return;
        }
        if (x >= this.x && x <= this.x + this.width && y >= this.y &&
            y <= this.y + this.height) {
            this.pressed = true;
        }
    }
}
