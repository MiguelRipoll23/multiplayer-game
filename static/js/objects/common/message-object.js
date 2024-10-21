import { BaseGameObject } from "../base/base-game-object.js";
export class MessageObject extends BaseGameObject {
    canvas;
    FILL_COLOR = "rgba(0, 0, 0, 0.8)";
    DEFAULT_HEIGHT = 100;
    DEFAULT_WIDTH = 340;
    x = 0;
    y = 0;
    textX = 0;
    textY = 0;
    opacity = 0;
    width = this.DEFAULT_WIDTH;
    height = this.DEFAULT_HEIGHT;
    text = "Unknown";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setPosition();
    }
    show(value) {
        this.text = value;
        this.setPosition();
        this.opacity = 1;
    }
    hide() {
        if (this.opacity === 0) {
            console.warn("MessageObject is already hidden");
            return;
        }
        this.opacity = 0;
    }
    render(context) {
        context.globalAlpha = this.opacity;
        this.drawRoundedRectangle(context);
        this.drawText(context);
        context.globalAlpha = this.opacity;
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
        this.x = this.canvas.width / 2 - (this.width / 2);
        this.y = this.canvas.height / 2 - (this.height / 2);
        this.textX = this.x + this.width / 2;
        this.textY = this.y + this.height / 2 + 5;
    }
}
