import { BaseGameObject } from "./base/base-game-object.js";
export class MessageObject extends BaseGameObject {
    canvas;
    FILL_COLOR = "rgba(0, 0, 0, 0.8)";
    DEFAULT_HEIGHT = 100;
    DEFAULT_WIDTH = 340;
    TRANSITION_MILLISECONDS = 400;
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
        this.elapsedMilliseconds = 0;
        this.fadeIn = true;
    }
    hide() {
        if (this.opacity === 0) {
            console.warn("MessageObject is already hidden");
            return;
        }
        this.elapsedMilliseconds = 0;
        this.fadeOut = true;
    }
    update(deltaTimeStamp) {
        if (this.fadeIn || this.fadeOut) {
            this.elapsedMilliseconds += deltaTimeStamp;
        }
        if (this.fadeIn) {
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
        else if (this.fadeOut) {
            if (this.elapsedMilliseconds < this.TRANSITION_MILLISECONDS) {
                this.opacity = 1 -
                    this.elapsedMilliseconds / this.TRANSITION_MILLISECONDS;
                this.x += (this.targetX + 25) / this.x * 0.1;
            }
            else {
                this.x = this.targetX + 25;
                this.opacity = 0;
                this.fadeOut = false;
            }
            this.textX = this.x + this.width / 2;
        }
    }
    render(context) {
        context.globalAlpha = this.opacity;
        // Draw rounded rectangle
        context.fillStyle = this.FILL_COLOR; // Use fill color constant
        this.roundRect(context, this.x, this.y, this.width, this.height, 6);
        // Draw text
        context.font = "16px Arial";
        context.fillStyle = "WHITE";
        context.textAlign = "center";
        context.fillText(this.text, this.textX, this.textY);
        context.globalAlpha = this.opacity;
    }
    // Function to draw rounded rectangle
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
    }
    setPosition() {
        this.x = this.canvas.width / 2 - (this.width / 2) - 25;
        this.y = this.canvas.height / 2 - (this.height / 2);
        this.targetX = this.canvas.width / 2 - (this.width / 2);
        this.textX = this.x + this.width / 2 - 25;
        this.textY = this.y + this.height / 2 + 5;
    }
}
