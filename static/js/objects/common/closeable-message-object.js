import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
export class CloseableMessageObject extends BasePressableGameObject {
    canvas;
    FILL_COLOR = "rgba(0, 0, 0, 0.8)";
    DEFAULT_HEIGHT = 100;
    DEFAULT_WIDTH = 340;
    messageX = 0;
    messageY = 0;
    messageWidth = this.DEFAULT_WIDTH;
    messageHeight = this.DEFAULT_HEIGHT;
    textX = 0;
    textY = 0;
    content = "Unknown";
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.active = false;
        this.opacity = 0;
        this.setSize();
        this.setPosition();
    }
    show(value) {
        this.content = value;
        this.setPosition();
        this.fadeIn(0.2);
        this.active = true;
    }
    close() {
        if (this.opacity === 0) {
            return console.warn("CloseableMessageObject is already closed");
        }
        this.active = false;
        this.fadeOut(0.2);
    }
    update(deltaTimeStamp) {
        if (this.pressed) {
            this.close();
        }
        super.update(deltaTimeStamp);
    }
    render(context) {
        context.globalAlpha = this.opacity;
        this.drawRoundedRectangle(context);
        this.drawText(context);
        context.globalAlpha = this.opacity;
        super.render(context);
    }
    setSize() {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    drawRoundedRectangle(context) {
        context.fillStyle = this.FILL_COLOR;
        context.beginPath();
        context.moveTo(this.messageX + 6, this.messageY);
        context.arcTo(this.messageX + this.messageWidth, this.messageY, this.messageX + this.messageWidth, this.messageY + this.messageHeight, 6);
        context.arcTo(this.messageX + this.messageWidth, this.messageY + this.messageHeight, this.messageX, this.messageY + this.messageHeight, 6);
        context.arcTo(this.messageX, this.messageY + this.messageHeight, this.messageX, this.messageY, 6);
        context.arcTo(this.messageX, this.messageY, this.messageX + this.messageWidth, this.messageY, 6);
        context.closePath();
        context.fill();
    }
    drawText(context) {
        context.font = "16px Arial";
        context.fillStyle = "WHITE";
        context.textAlign = "center";
        context.fillText(this.content, this.textX, this.textY);
    }
    setPosition() {
        this.messageX = this.canvas.width / 2 - (this.messageWidth / 2);
        this.messageY = this.canvas.height / 2 - (this.messageHeight / 2);
        this.textX = this.messageX + this.messageWidth / 2;
        this.textY = this.messageY + this.messageHeight / 2 + 5;
    }
}
