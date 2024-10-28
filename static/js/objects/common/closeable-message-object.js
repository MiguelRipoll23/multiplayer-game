import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
export class CloseableMessageObject extends BasePressableGameObject {
    canvas;
    FILL_COLOR = "rgba(0, 0, 0, 0.8)";
    DEFAULT_HEIGHT = 100;
    DEFAULT_WIDTH = 340;
    textX = 0;
    textY = 0;
    content = "Whoops! Something went wrong!";
    constructor(canvas) {
        super(true);
        this.canvas = canvas;
        this.active = false;
        this.opacity = 0;
        this.setSize();
        this.setPosition();
    }
    show(value) {
        this.reset();
        this.setPosition();
        this.content = value;
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
        this.width = this.DEFAULT_WIDTH;
        this.height = this.DEFAULT_HEIGHT;
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
        context.fillText(this.content, this.textX, this.textY);
    }
    setPosition() {
        this.x = this.canvas.width / 2 - (this.width / 2);
        this.y = this.canvas.height / 2 - (this.height / 2);
        this.textX = this.x + this.width / 2;
        this.textY = this.y + this.height / 2 + 5;
    }
}
