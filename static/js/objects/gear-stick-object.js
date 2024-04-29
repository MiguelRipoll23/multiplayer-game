import { BaseGameObject } from "./base/base-game-object.js";
export class GearStickObject extends BaseGameObject {
    canvas;
    SIZE = 65; // Adjust size as needed
    FILL_COLOR = "black"; // Change fill color to black
    FONT_SIZE = 36; // Adjust font size as needed
    Y_OFFSET = 25;
    y = 0;
    x = 30;
    active = false;
    currentGear = "F";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        // Position the gear stick 50px from the bottom
        this.y = this.canvas.height - (this.SIZE + this.Y_OFFSET);
        this.addTouchEventListeners();
        this.addKeyboardEventListeners();
    }
    update(deltaTimeStamp) {
        // Implement update logic if required
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
        Math.PI * 2 // end angle
        );
        context.closePath();
        context.fill();
    }
    drawGearLetter(context) {
        // Draw the current gear letter inside the circle
        context.fillStyle = "white"; // Set text color to white
        context.font = `bold ${this.FONT_SIZE}px Arial`; // Set font size dynamically
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.currentGear, this.x + this.SIZE / 2, this.y + this.SIZE / 2);
    }
    addTouchEventListeners() {
        this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
            passive: true,
        });
    }
    handleTouchStart(event) {
        event.preventDefault();
        event.stopPropagation();
        const touch = event.touches[0];
        if (!touch)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        if (this.isWithinGearStick(touchX, touchY)) {
            this.active = true;
        }
    }
    handleTouchEnd(event) {
        const touch = event.touches[0];
        if (!touch)
            return;
        const rect = this.canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        if (this.isWithinGearStick(touchX, touchY)) {
            this.switchGear();
        }
        this.active = false;
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
