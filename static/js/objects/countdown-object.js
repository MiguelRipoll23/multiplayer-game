import { BaseGameObject } from "./base/base-game-object.js";
export class ScoreboardObject extends BaseGameObject {
    canvas;
    RECTANGLE = {
        WIDTH: 150,
        HEIGHT: 60,
        COLOR: "#4CAF50",
        CORNER_RADIUS: 10,
    };
    x = 0;
    y = 120;
    active = false;
    elapsedMilliseconds = 0;
    durationMilliseconds = 0;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.x = this.canvas.width / 2;
    }
    update(deltaTimeStamp) {
        if (this.active) {
            this.elapsedMilliseconds += deltaTimeStamp;
            if (this.elapsedMilliseconds >= this.durationMilliseconds) {
                this.stopCountdown();
            }
        }
    }
    render(context) {
        const remainingTimeSeconds = Math.ceil((this.durationMilliseconds - this.elapsedMilliseconds) / 1000);
        const formattedTime = this.formatTime(remainingTimeSeconds);
        this.drawRoundedRectangle(context);
        this.drawText(context, formattedTime);
    }
    formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
    }
    drawRoundedRectangle(context) {
        const { WIDTH, HEIGHT, COLOR, CORNER_RADIUS } = this.RECTANGLE;
        const x0 = this.x - WIDTH / 2;
        const y0 = this.y - HEIGHT / 2;
        context.fillStyle = COLOR;
        context.beginPath();
        context.moveTo(x0 + CORNER_RADIUS, y0);
        context.arcTo(x0 + WIDTH, y0, x0 + WIDTH, y0 + HEIGHT, CORNER_RADIUS);
        context.arcTo(x0 + WIDTH, y0 + HEIGHT, x0, y0 + HEIGHT, CORNER_RADIUS);
        context.arcTo(x0, y0 + HEIGHT, x0, y0, CORNER_RADIUS);
        context.arcTo(x0, y0, x0 + WIDTH, y0, CORNER_RADIUS);
        context.closePath();
        context.fill();
    }
    drawText(context, text) {
        context.font = "42px monospace";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(text, this.x, this.y);
    }
    startCountdown(durationSeconds) {
        this.durationMilliseconds = durationSeconds * 1000;
        this.active = true;
    }
    stopCountdown() {
        this.active = false;
    }
    resetCountdown() {
        this.elapsedMilliseconds = 0;
    }
}
