import { BLUE_TEAM_TRANSPARENCY_COLOR, RED_TEAM_TRANSPARENCY_COLOR, } from "../constants/colors.js";
import { BaseGameObject } from "./base/base-game-object.js";
export class ScoreObject extends BaseGameObject {
    TEXT_COLOR = "#FFFFFF"; // White text color
    FONT_SIZE = 62;
    DISTANCE_CENTER = 120;
    SQUARE_SIZE = 80;
    CORNER_RADIUS = 10;
    canvas;
    blueTeam;
    score = 0;
    x = 0;
    y = 0;
    SQUARE_FILL_COLOR; // Solid fill color
    constructor(blueTeam, canvas) {
        super();
        this.canvas = canvas;
        this.blueTeam = blueTeam;
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.y = blueTeam
            ? this.y + this.DISTANCE_CENTER
            : this.y - this.DISTANCE_CENTER;
        this.SQUARE_FILL_COLOR = blueTeam
            ? BLUE_TEAM_TRANSPARENCY_COLOR
            : RED_TEAM_TRANSPARENCY_COLOR;
    }
    update(deltaTimeStamp) { }
    render(context) {
        this.drawRoundedSquare(context);
        this.drawText(context);
    }
    drawRoundedSquare(context) {
        context.beginPath();
        context.fillStyle = this.SQUARE_FILL_COLOR;
        context.strokeStyle = "transparent"; // No border
        const halfSquareSize = this.SQUARE_SIZE / 2;
        const halfCornerRadius = this.CORNER_RADIUS / 2;
        context.moveTo(this.x - halfSquareSize + halfCornerRadius, this.y - halfSquareSize);
        context.arcTo(this.x + halfSquareSize, this.y - halfSquareSize, this.x + halfSquareSize, this.y + halfSquareSize, this.CORNER_RADIUS);
        context.arcTo(this.x + halfSquareSize, this.y + halfSquareSize, this.x - halfSquareSize, this.y + halfSquareSize, this.CORNER_RADIUS);
        context.arcTo(this.x - halfSquareSize, this.y + halfSquareSize, this.x - halfSquareSize, this.y - halfSquareSize, this.CORNER_RADIUS);
        context.arcTo(this.x - halfSquareSize, this.y - halfSquareSize, this.x + halfSquareSize, this.y - halfSquareSize, this.CORNER_RADIUS);
        context.closePath();
        context.fill();
    }
    drawText(context) {
        context.font = `${this.FONT_SIZE}px monospace`;
        context.fillStyle = this.TEXT_COLOR; // Use constant white text color
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.score.toString(), this.x, this.y);
    }
    setScore(score) {
        this.score = score;
    }
}
