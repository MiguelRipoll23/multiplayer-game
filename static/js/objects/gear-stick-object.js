import { BaseGameObject } from "./base/base-game-object.js";
export class GearStickObject extends BaseGameObject {
    canvas;
    gamePointer;
    SIZE = 65; // Adjust size as needed
    FILL_COLOR = "black"; // Change fill color to black
    FONT_SIZE = 36; // Adjust font size as needed
    Y_OFFSET = 25;
    y = 0;
    x = 30;
    active = false;
    currentGear = "F";
    constructor(canvas, gamePointer) {
        super();
        this.canvas = canvas;
        this.gamePointer = gamePointer;
        this.y = this.canvas.height - (this.SIZE + this.Y_OFFSET);
        this.addKeyboardEventListeners();
    }
    update(deltaTimeStamp) {
        // Implement update logic if required
        this.handleTouchEvents();
    }
    render(context) {
        this.drawCircle(context); // Modified to draw a circle
        this.drawGearLetter(context);
    }
    isActive() {
        return this.active;
    }
    getCurrentGear() {
        return this.currentGear;
    }
    switchGear() {
        this.currentGear = this.currentGear === "F" ? "R" : "F";
    }
    drawCircle(context) {
        // Draw the filled circle
        context.fillStyle = this.FILL_COLOR;
        context.beginPath();
        context.arc(this.x + this.SIZE / 2, // x-coordinate of the center
        this.y + this.SIZE / 2, // y-coordinate of the center
        this.SIZE / 2, // radius
        0, // start angle
        Math.PI * 2);
        context.closePath();
        context.fill();
    }
    drawGearLetter(context) {
        // Draw the current gear letter inside the circle
        context.fillStyle = "white"; // Set text color to white
        context.font = `bold ${this.FONT_SIZE}px system-ui`; // Set font size dynamically
        context.textAlign = "center";
        context.fillText(this.currentGear, this.x + this.SIZE / 2, this.y + this.SIZE / 2 + 12);
    }
    handleTouchEvents() {
        if (this.gamePointer.isPressed()) {
            const rect = this.canvas.getBoundingClientRect();
            const touchX = this.gamePointer.getX() - rect.left;
            const touchY = this.gamePointer.getY() - rect.top;
            if (this.isWithinGearStick(touchX, touchY)) {
                this.active = true;
                this.switchGear();
            } else {
                this.active = false;
            }
        }
    }
    isWithinGearStick(x, y) {
        return (x >= this.x &&
            x <= this.x + this.SIZE &&
            y >= this.y &&
            y <= this.y + this.SIZE);
    }
    addKeyboardEventListeners() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }
    handleKeyDown(event) {
        if (event.key === "ArrowUp" || event.key === "w") {
            this.currentGear = "F";
        }
        else if (event.key === "ArrowDown" || event.key === "s") {
            this.currentGear = "R";
        }
    }
}
