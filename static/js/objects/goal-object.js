import { BaseGameObject } from "./base/base-game-object.js";
export class GoalObject extends BaseGameObject {
    RED_FILL_COLOR = "#EF5350";
    BLUE_FILL_COLOR = "#42A5F5";
    LINE_BORDER_COLOR = "#fff";
    WIDTH = 100; // Width of the goal
    HEIGHT = 40; // Height of the goal (adjusted)
    BORDER_SIZE = 2; // Border size
    Y_OFFSET = 13;
    x = 0;
    y = 0;
    fillColor;
    borderColor;
    blueTeam;
    constructor(blueTeam, canvas) {
        super();
        this.blueTeam = blueTeam;
        this.borderColor = this.LINE_BORDER_COLOR;
        if (blueTeam) {
            // Position goal at the bottom of the canvas
            this.y = canvas.height - this.HEIGHT - this.Y_OFFSET;
            this.fillColor = this.BLUE_FILL_COLOR;
        }
        else {
            // Position goal at the top of the canvas
            this.y = this.Y_OFFSET;
            this.fillColor = this.RED_FILL_COLOR;
        }
        // Calculate x position to center the goal horizontally
        this.x = (canvas.width - this.WIDTH) / 2;
    }
    update(deltaTimeStamp) {
        // No update logic required
    }
    render(context) {
        context.fillStyle = this.fillColor;
        context.strokeStyle = this.borderColor;
        context.lineWidth = this.BORDER_SIZE;
        context.beginPath();
        context.rect(this.x, this.y, this.WIDTH, this.HEIGHT);
        context.closePath();
        context.fill();
        // Draw left border
        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x, this.y + this.HEIGHT);
        context.closePath();
        context.stroke();
        // Draw right border
        context.beginPath();
        context.moveTo(this.x + this.WIDTH, this.y);
        context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
        context.closePath();
        context.stroke();
        // Determine which border to remove
        if (this.blueTeam) {
            // Remove bottom border for blue team
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.WIDTH, this.y);
            context.closePath();
            context.stroke();
        }
        else {
            // Remove top border for red team
            context.beginPath();
            context.moveTo(this.x, this.y + this.HEIGHT);
            context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
            context.closePath();
            context.stroke();
        }
    }
}
