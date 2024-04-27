import { BLUE_TEAM_COLOR, ORANGE_TEAM_COLOR } from "../constants/colors.js";
import { BaseGameObject } from "./base/base-game-object.js";
export class ScoreboardObject extends BaseGameObject {
    canvas;
    BLUE_SCORE = 0;
    ORANGE_SCORE = 0;
    SQUARE_SIZE = 50;
    SPACE_BETWEEN = 10;
    TIME_BOX_WIDTH = 120;
    TIME_BOX_HEIGHT = 50;
    CORNER_RADIUS = 10;
    TEXT_COLOR = "white";
    FONT_SIZE = "32px";
    FONT_FAMILY = "monospace";
    TIME_TEXT_COLOR = "white";
    TIME_FONT_SIZE = "32px";
    BLUE_SHAPE_COLOR = BLUE_TEAM_COLOR;
    ORANGE_SHAPE_COLOR = ORANGE_TEAM_COLOR;
    SHAPE_FILL_COLOR = "white";
    TIME_BOX_FILL_COLOR = "#4caf50"; // Added property for time box fill color
    x;
    y = 90;
    active = false;
    elapsedMilliseconds = 0;
    durationMilliseconds = 0;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.x = this.canvas.width / 2 - this.SPACE_BETWEEN / 2;
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
        const totalWidth = 2 * this.SQUARE_SIZE + this.SPACE_BETWEEN +
            this.TIME_BOX_WIDTH;
        const startX = this.x - totalWidth / 2;
        this.renderSquare(context, startX, this.BLUE_SHAPE_COLOR, this.BLUE_SCORE);
        const remainingTimeSeconds = Math.ceil((this.durationMilliseconds - this.elapsedMilliseconds) / 1000);
        const formattedTime = this.formatTime(remainingTimeSeconds);
        const timeX = startX + this.SQUARE_SIZE + this.SPACE_BETWEEN;
        const timeY = this.y + (this.SQUARE_SIZE - this.TIME_BOX_HEIGHT) / 2;
        this.renderTimeBox(context, timeX, timeY, this.TIME_BOX_WIDTH, this.TIME_BOX_HEIGHT, formattedTime);
        const orangeScoreX = startX +
            this.SQUARE_SIZE +
            this.SPACE_BETWEEN +
            this.TIME_BOX_WIDTH +
            this.SPACE_BETWEEN;
        this.renderSquare(context, orangeScoreX, this.ORANGE_SHAPE_COLOR, this.ORANGE_SCORE);
    }
    renderSquare(context, x, color, score) {
        context.fillStyle = color;
        this.roundedRect(context, x, this.y, this.SQUARE_SIZE, this.SQUARE_SIZE, this.CORNER_RADIUS);
        context.fill();
        this.renderText(context, score.toString(), x + this.SQUARE_SIZE / 2, this.y + this.SQUARE_SIZE / 2);
    }
    renderTimeBox(context, x, y, width, height, text) {
        context.fillStyle = this.TIME_BOX_FILL_COLOR;
        this.roundedRect(context, x, y, width, height, this.CORNER_RADIUS);
        context.fill();
        context.textAlign = "center";
        this.renderText(context, text, x + width / 2, y + height / 2);
    }
    roundedRect(context, x, y, width, height, radius) {
        context.beginPath();
        context.moveTo(x + radius, y);
        context.arcTo(x + width, y, x + width, y + height, radius);
        context.arcTo(x + width, y + height, x, y + height, radius);
        context.arcTo(x, y + height, x, y, radius);
        context.arcTo(x, y, x + width, y, radius);
        context.closePath();
    }
    renderText(context, text, x, y) {
        context.fillStyle = this.TEXT_COLOR;
        context.font = `${this.FONT_SIZE} ${this.FONT_FAMILY}`;
        context.fillText(text, x, y);
    }
    formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;
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
