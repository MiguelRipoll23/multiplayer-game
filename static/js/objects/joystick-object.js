import { BaseGameObject } from "./base/base-game-object.js";
export class JoystickObject extends BaseGameObject {
    RADIUS = 40;
    MAX_DISTANCE = 30;
    canvas;
    active = false;
    controlX = 0;
    controlY = 0;
    x = 0;
    y = 0;
    initialTouch = { x: 0, y: 0 };
    touchPoint = { x: 0, y: 0 };
    usingTouch = false;
    pressedKeys = new Set();
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.addTouchEventListeners();
        this.addKeyboardEventListeners();
    }
    update(deltaTimeStamp) {
        if (this.usingTouch) {
            this.updateJoystickPosition();
        }
    }
    render(context) {
        if (this.usingTouch) {
            this.drawJoystick(context);
        }
    }
    updateJoystickPosition() {
        const distance = this.calculateDistance();
        if (distance <= this.MAX_DISTANCE) {
            this.x = this.touchPoint.x;
            this.y = this.touchPoint.y;
        }
        else {
            this.adjustPosition();
        }
        this.calculateControlValues();
    }
    calculateDistance() {
        return Math.sqrt(Math.pow(this.touchPoint.x - this.initialTouch.x, 2) +
            Math.pow(this.touchPoint.y - this.initialTouch.y, 2));
    }
    adjustPosition() {
        const angle = Math.atan2(this.touchPoint.y - this.initialTouch.y, this.touchPoint.x - this.initialTouch.x);
        const newX = this.initialTouch.x + this.MAX_DISTANCE * Math.cos(angle);
        const newY = this.initialTouch.y + this.MAX_DISTANCE * Math.sin(angle);
        this.x = newX;
        this.y = newY;
    }
    calculateControlValues() {
        const relativeX = this.x - this.initialTouch.x;
        const relativeY = this.y - this.initialTouch.y;
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
        context.arc(this.initialTouch.x, this.initialTouch.y, this.RADIUS, 0, Math.PI * 2);
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
    addTouchEventListeners() {
        this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: false });
        this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), {
            passive: false,
        });
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this)),
            { passive: true };
    }
    handleTouchStart(event) {
        this.active = true;
        this.usingTouch = true;
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.initialTouch = this.getTouchPoint(touch, rect);
        this.touchPoint = this.initialTouch;
    }
    handleTouchMove(event) {
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchPoint = this.getTouchPoint(touch, rect);
    }
    handleTouchEnd(event) {
        this.resetJoystick();
    }
    getTouchPoint(touch, rect) {
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    }
    addKeyboardEventListeners() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
        window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
    handleKeyDown(event) {
        this.pressedKeys.add(event.key);
        this.updateControlValues();
    }
    handleKeyUp(event) {
        this.pressedKeys.delete(event.key);
        this.updateControlValues();
    }
    updateControlValues() {
        const isArrowUpPressed = this.pressedKeys.has("ArrowUp") ||
            this.pressedKeys.has("w");
        const isArrowDownPressed = this.pressedKeys.has("ArrowDown") ||
            this.pressedKeys.has("s");
        const isArrowLeftPressed = this.pressedKeys.has("ArrowLeft") ||
            this.pressedKeys.has("a");
        const isArrowRightPressed = this.pressedKeys.has("ArrowRight") ||
            this.pressedKeys.has("d");
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
        this.usingTouch = false;
        this.touchPoint = { x: 0, y: 0 };
        this.controlX = 0;
        this.controlY = 0;
    }
}
