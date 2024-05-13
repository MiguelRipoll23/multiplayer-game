import { BaseGameObject } from "./base/base-game-object.js";
export class MessageObject extends BaseGameObject {
    canvas;
    FILL_COLOR = "rgba(0, 0, 0, 0.8)";
    DEFAULT_HEIGHT = 100;
    DEFAULT_WIDTH = 340;
    TRANSITION_MILLISECONDS = 400;
    X_OFFSET = 25;
    x = 0;
    y = 0;
    textX = 0;
    textY = 0;
    targetX = 0;
    width = this.DEFAULT_WIDTH;
    height = this.DEFAULT_HEIGHT;
    text = "Unknown";
    elapsedMilliseconds = 0;
    opacity = 0;
    fadeIn = false;
    fadeOut = false;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setPosition();
    }
    show(value) {
        this.text = value;
        this.setPosition();
        this.updateElapsedMilliseconds();
        this.fadeIn = true;
    }
    hide() {
        if (this.opacity === 0) {
            console.warn("MessageObject is already hidden");
            return;
        }
        this.updateElapsedMilliseconds();
        this.fadeOut = true;
    }
    update(deltaTimeStamp) {
        if (this.fadeIn || this.fadeOut) {
            this.elapsedMilliseconds += deltaTimeStamp;
        }
        if (this.fadeIn || this.fadeOut) {
            this.updateOpacityAndPosition();
        }
    }
    render(context) {
        context.globalAlpha = this.opacity;
        this.drawRoundedRectangle(context);
        this.drawText(context);
        context.globalAlpha = this.opacity;
    }
    updateElapsedMilliseconds() {
        if (this.elapsedMilliseconds === 0) {
            return;
        }
        if (this.elapsedMilliseconds >= this.TRANSITION_MILLISECONDS) {
            this.elapsedMilliseconds = 0;
        }
        else {
            this.elapsedMilliseconds = this.TRANSITION_MILLISECONDS -
                this.elapsedMilliseconds;
        }
    }
    updateOpacityAndPosition() {
        if (this.fadeIn) {
            this.fadeInTransition();
        }
        else if (this.fadeOut) {
            this.fadeOutTransition();
        }
    }
    fadeInTransition() {
        if (this.elapsedMilliseconds < this.TRANSITION_MILLISECONDS) {
            this.opacity = this.elapsedMilliseconds / this.TRANSITION_MILLISECONDS;
            this.x += (this.targetX - this.x) * 0.1;
        }
        else {
            this.x = this.targetX;
            this.opacity = 1;
            this.fadeIn = false;
        }
        this.textX = this.x + this.width / 2;
    }
    fadeOutTransition() {
        if (this.elapsedMilliseconds < this.TRANSITION_MILLISECONDS) {
            this.opacity = 1 -
                this.elapsedMilliseconds / this.TRANSITION_MILLISECONDS;
            this.x += (this.targetX + this.X_OFFSET - this.x) * 0.1;
        }
        else {
            this.x = this.targetX + this.X_OFFSET;
            this.opacity = 0;
            this.fadeOut = false;
        }
        this.textX = this.x + this.width / 2;
    }
    drawRoundedRectangle(context) {
        context.fillStyle = this.FILL_COLOR;
        context.beginPath();
        context.moveTo(this.x + 6, this.y);
        context.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.height, 6);
        context.arcTo(this.x + this.width, this.y + this.height, this.x, this.y + this.height, 6);
        context.arcTo(this.x, this.y + this.height, this.x, this.y, 6);
        context.arcTo(this.x, this.y, this.x + this.width, this.y, 6);
        context.closePath();
        context.fill();
    }
    drawText(context) {
        context.font = "16px Arial";
        context.fillStyle = "WHITE";
        context.textAlign = "center";
        context.fillText(this.text, this.textX, this.textY);
    }
    setPosition() {
        this.x = this.canvas.width / 2 - (this.width / 2) - this.X_OFFSET;
        this.y = this.canvas.height / 2 - (this.height / 2);
        this.targetX = this.canvas.width / 2 - (this.width / 2);
        this.textX = this.x + this.width / 2;
        this.textY = this.y + this.height / 2 + 5;
    }
}
