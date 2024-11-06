import { BaseGameObject } from "./base/base-game-object.js";
export class JoystickObject extends BaseGameObject {
    canvas;
    gamePointer;
    gameKeyboard;
    RADIUS = 40;
    MAX_DISTANCE = 30;
    active = false;
    controlX = 0;
    controlY = 0;
    x = 0;
    y = 0;
    constructor(canvas, gamePointer, gameKeyboard) {
        super();
        this.canvas = canvas;
        this.gamePointer = gamePointer;
        this.gameKeyboard = gameKeyboard;
    }
    update(deltaTimeStamp) {
        if (this.gamePointer.isTouch()) {
            this.handleGamePointerEvents();
            this.updateJoystickPosition();
            if (this.debug && this.gamePointer.isPressing() === false) {
                this.handleKeyboardEvents();
            }
        }
        else {
            this.handleKeyboardEvents();
        }
    }
    render(context) {
        if (this.gamePointer.isTouch() && this.gamePointer.isPressing()) {
            this.drawJoystick(context);
        }
    }
    handleGamePointerEvents() {
        if (this.gamePointer.isPressing()) {
            this.active = true;
        }
        else {
            this.resetJoystick();
        }
    }
    updateJoystickPosition() {
        const distance = this.calculateDistance();
        if (distance <= this.MAX_DISTANCE) {
            this.x = this.gamePointer.getX();
            this.y = this.gamePointer.getY();
        }
        else {
            this.adjustPosition();
        }
        this.calculateControlValues();
    }
    calculateDistance() {
        return Math.sqrt(Math.pow(this.gamePointer.getX() - this.gamePointer.getInitialX(), 2) +
            Math.pow(this.gamePointer.getY() - this.gamePointer.getInitialY(), 2));
    }
    adjustPosition() {
        const angle = Math.atan2(this.gamePointer.getY() - this.gamePointer.getInitialY(), this.gamePointer.getX() - this.gamePointer.getInitialX());
        const newX = this.gamePointer.getInitialX() + this.MAX_DISTANCE * Math.cos(angle);
        const newY = this.gamePointer.getInitialY() + this.MAX_DISTANCE * Math.sin(angle);
        this.x = newX;
        this.y = newY;
    }
    calculateControlValues() {
        const relativeX = this.x - this.gamePointer.getInitialX();
        const relativeY = this.y - this.gamePointer.getInitialY();
        this.controlX = relativeX / this.MAX_DISTANCE;
        this.controlY = relativeY / this.MAX_DISTANCE;
    }
    isActive() {
        return this.active;
    }
    getControlX() {
        return this.controlX;
    }
    getControlY() {
        return this.controlY;
    }
    drawJoystick(context) {
        this.drawInitialTouchCircleBorder(context);
        this.drawJoystickCircle(context);
    }
    drawInitialTouchCircleBorder(context) {
        context.beginPath();
        context.arc(this.gamePointer.getInitialX(), this.gamePointer.getInitialY(), this.RADIUS, 0, Math.PI * 2);
        context.strokeStyle = "rgba(0, 0, 0, 0.2)";
        context.lineWidth = 2; // Adjust line width as needed
        context.stroke();
        context.closePath();
    }
    drawJoystickCircle(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.RADIUS, 0, Math.PI * 2);
        const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.RADIUS);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
        gradient.addColorStop(1, "rgba(50, 50, 50, 0.8)");
        context.fillStyle = gradient;
        // Save the current state
        context.save();
        // Apply shadow settings only to the joystick
        context.shadowColor = "rgba(0, 0, 0, 0.3)";
        context.shadowBlur = 10;
        context.fill();
        // Restore the previous state
        context.restore();
        context.closePath();
    }
    handleKeyboardEvents() {
        const pressedKeys = this.gameKeyboard.getPressedKeys();
        const isArrowUpPressed = pressedKeys.has("ArrowUp") || pressedKeys.has("w");
        const isArrowDownPressed = pressedKeys.has("ArrowDown") || pressedKeys.has("s");
        const isArrowLeftPressed = pressedKeys.has("ArrowLeft") || pressedKeys.has("a");
        const isArrowRightPressed = pressedKeys.has("ArrowRight") || pressedKeys.has("d");
        this.active = isArrowUpPressed || isArrowDownPressed;
        if (isArrowUpPressed && !isArrowDownPressed) {
            this.controlY = -1;
        }
        else if (!isArrowUpPressed && isArrowDownPressed) {
            this.controlY = 1;
        }
        else {
            this.controlY = 0;
        }
        if (isArrowLeftPressed && !isArrowRightPressed) {
            this.controlX = -1;
        }
        else if (!isArrowLeftPressed && isArrowRightPressed) {
            this.controlX = 1;
        }
        else {
            this.controlX = 0;
        }
    }
    resetJoystick() {
        this.active = false;
        this.controlX = 0;
        this.controlY = 0;
    }
}
