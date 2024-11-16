import { RED_TEAM_COLOR } from "../../constants/colors-constants.js";
import { BaseGameObject } from "../base/base-game-object.js";
export class ProgressBarObject extends BaseGameObject {
    canvas;
    RECT_HEIGHT = 40;
    RECT_CORNER_RADIUS = 6;
    RECT_MARGIN = 25;
    PROGRESS_BAR_HEIGHT = 3;
    rectX = 0;
    rectY = 0;
    rectWidth = 0;
    textX = 0;
    textY = 0;
    progressBarY = 0;
    progressBarWidth = 0;
    text = "Loading...";
    currentProgress = 0.0;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.setProperties(canvas);
    }
    update() {
        this.progressBarWidth =
            (this.canvas.width - 2 * this.rectX) * this.currentProgress;
    }
    render(context) {
        context.save();
        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        this.roundedRect(context, this.rectX, this.rectY, this.rectWidth, this.RECT_HEIGHT, this.RECT_CORNER_RADIUS);
        const text = this.text;
        context.fillStyle = "white";
        context.font = "14px system-ui";
        context.textAlign = "left";
        context.fillText(text, this.textX, this.textY);
        context.fillStyle = "rgba(66, 135, 245, 0.5)";
        context.fillRect(this.rectX, this.progressBarY, this.rectWidth, this.PROGRESS_BAR_HEIGHT);
        context.fillStyle = RED_TEAM_COLOR;
        context.fillRect(this.rectX, this.progressBarY, this.progressBarWidth, this.PROGRESS_BAR_HEIGHT);
        context.restore();
    }
    setProperties(canvas) {
        this.rectX = canvas.width * 0.05;
        this.rectY = canvas.height - this.RECT_HEIGHT - this.RECT_MARGIN;
        this.rectWidth = this.canvas.width - 2 * this.rectX;
        this.textX = this.rectX + 15; // adjusted text X position
        this.textY = this.rectY + 25;
        this.progressBarY =
            this.rectY + this.RECT_HEIGHT - this.PROGRESS_BAR_HEIGHT;
    }
    roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius); // corrected to height - radius
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height); // corrected to width - radius
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
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
