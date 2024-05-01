import { BaseGameObject } from "./base/base-game-object.js";
export class ProgressBarObject extends BaseGameObject {
    canvas;
    RECT_HEIGHT = 40;
    RECT_CORNER_RADIUS = 6;
    RECT_MARGIN = 25;
    PROGRESS_BAR_HEIGHT = 3;
    rectX;
    reactY;
    rectWidth;
    textX;
    textY;
    progresssBarY = 0;
    progressBarWidth = 0;
    text = "Loading...";
    currentProgress = 0.0;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.rectX = canvas.width * 0.05; // Adjust the margin as needed
        this.reactY = canvas.height - this.RECT_HEIGHT - this.RECT_MARGIN;
        this.rectWidth = this.canvas.width - 2 * this.rectX;
        this.textX = this.rectX + 15;
        this.textY = this.reactY + 25;
        this.progresssBarY = this.reactY + this.RECT_HEIGHT -
            this.PROGRESS_BAR_HEIGHT;
    }
    update() {
        this.progressBarWidth = (this.canvas.width - 2 * this.rectX) *
            this.currentProgress; // Adjust the width calculation
    }
    render(context) {
        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        // Draw top border with rounded corners
        this.roundedRect(context, this.rectX, this.reactY, this.rectWidth, this.RECT_HEIGHT, this.RECT_CORNER_RADIUS);
        const text = this.text;
        context.fillStyle = "white";
        context.font = "14px Arial";
        context.fillText(text, this.textX, this.textY);
        context.fillStyle = "rgba(66, 135, 245, 0.5)";
        context.fillRect(this.rectX, this.progresssBarY, this.rectWidth, this.PROGRESS_BAR_HEIGHT);
        context.fillStyle = "#2196F3";
        context.fillRect(this.rectX, this.progresssBarY, this.progressBarWidth, this.PROGRESS_BAR_HEIGHT);
    }
    roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    }
    setText(text) {
        this.text = text;
    }
    setProgress(progress) {
        this.currentProgress = progress;
    }
}
