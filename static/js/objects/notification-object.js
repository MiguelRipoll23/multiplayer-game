import { BaseGameObject } from "./base/base-game-object.js";
export class NotificationObject extends BaseGameObject {
    canvas;
    DEFAULT_HEIGHT = 35;
    MARGIN = 20;
    TEXT_SPEED = 2;
    TRANSITION_MILLISECONDS = 250;
    context;
    active = false;
    opacity = 0;
    fadingIn = false;
    fadingOut = false;
    elapsedTransitionMilliseconds = 0;
    x = 0;
    y = 0;
    textX = 0;
    completedTimes = 0;
    text = "This is a in-game notification!";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.x = 0;
        this.y = this.MARGIN;
        this.context = canvas.getContext("2d");
        this.textX = this.canvas.width;
    }
    update(deltaTimeStamp) {
        if (this.fadingIn || this.fadingOut) {
            this.elapsedTransitionMilliseconds += deltaTimeStamp;
            this.updateOpacity();
        }
        if (this.active) {
            this.updateTextPosition();
        }
    }
    render(context) {
        context.globalAlpha = this.opacity;
        // Draw red borders
        context.fillStyle = "rgba(255, 0, 0, 0.85)";
        context.fillRect(this.x, this.y, this.canvas.width, 1); // Top border
        context.fillRect(this.x, this.y + this.DEFAULT_HEIGHT - 1, this.canvas.width, 1); // Bottom border
        // Draw black rectangle
        context.fillStyle = "rgba(0, 0, 0, 0.85)";
        context.fillRect(this.x, this.y + 1, this.canvas.width, this.DEFAULT_HEIGHT - 2); // Main rectangle
        // Draw text
        context.fillStyle = "#FFF";
        context.font = "20px system-ui";
        context.fillText(this.text, this.textX, this.y + this.DEFAULT_HEIGHT / 2 + 6);
        context.globalAlpha = 1;
    }
    show(text) {
        this.text = text;
        this.reset();
    }
    reset() {
        this.opacity = 0;
        this.completedTimes = 0;
        this.elapsedTransitionMilliseconds = 0;
        this.fadingIn = true;
        this.fadingOut = false;
        this.textX = this.canvas.width + this.context.measureText(this.text).width;
        this.active = true;
    }
    updateOpacity() {
        if (this.fadingIn) {
            this.handleFadingIn();
        }
        else if (this.fadingOut) {
            this.handleFadingOut();
        }
    }
    handleFadingIn() {
        this.opacity = Math.min(1, this.elapsedTransitionMilliseconds / this.TRANSITION_MILLISECONDS);
        if (this.opacity === 1) {
            this.fadingIn = false;
            this.elapsedTransitionMilliseconds = 0;
        }
    }
    handleFadingOut() {
        this.opacity = Math.max(0, 1 - this.elapsedTransitionMilliseconds / this.TRANSITION_MILLISECONDS);
        if (this.opacity === 0) {
            this.fadingOut = false;
            this.active = false;
        }
    }
    updateTextPosition() {
        if (this.opacity < 1) {
            return;
        }
        this.textX -= this.TEXT_SPEED;
        // Reset position if text is out of screen
        const textWidth = this.context.measureText(this.text).width;
        if (this.textX < -textWidth) {
            this.completedTimes++;
            this.textX = this.canvas.width + textWidth;
            if (this.completedTimes === 2) {
                this.fadingOut = true;
            }
        }
    }
}
