import { BaseGameObject } from "./base/base-game-object.js";
export class GearStickObject extends BaseGameObject {
    canvas;
    SIZE = 65; // Adjust size as needed
    CORNER_RADIUS = 12; // Adjust corner radius as needed
    FILL_COLOR = "black"; // Change fill color to black
    FONT_SIZE = 36; // Adjust font size as needed
    Y_OFFSET = 15;
    y = 0;
    x = 15;
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
        this.drawSquare(context);
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
    drawSquare(context) {
        // Draw the filled rounded square
        context.fillStyle = this.FILL_COLOR;
        context.beginPath();
        context.moveTo(this.x + this.CORNER_RADIUS, this.y);
        context.arcTo(this.x + this.SIZE, this.y, this.x + this.SIZE, this.y + this.SIZE, this.CORNER_RADIUS);
        context.arcTo(this.x + this.SIZE, this.y + this.SIZE, this.x, this.y + this.SIZE, this.CORNER_RADIUS);
        context.arcTo(this.x, this.y + this.SIZE, this.x, this.y, this.CORNER_RADIUS);
        context.arcTo(this.x, this.y, this.x + this.SIZE, this.y, this.CORNER_RADIUS);
        context.closePath();
        context.fill();
    }
    drawGearLetter(context) {
        // Draw the current gear letter inside the square
        context.fillStyle = "white"; // Set text color to white
        context.font = `bold ${this.FONT_SIZE}px Arial`; // Set font size dynamically
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.currentGear, this.x + this.SIZE / 2, this.y + this.SIZE / 2);
    }
    addTouchEventListeners() {
        this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: true });
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this), {
            passive: true,
        });
        this.canvas.addEventListener("click", this.handleClick.bind(this));
    }
    handleClick(event) {
        if (!event.target)
            return;
        const rect = event.target.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        if (this.isWithinGearStick(mouseX, mouseY)) {
            this.switchGear();
        }
    }
    handleTouchStart(event) {
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
