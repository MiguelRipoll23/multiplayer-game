import { BaseGameObject } from "./base/base-game-object.js";
export class GoalObject extends BaseGameObject {
    RED_FILL_COLOR = "#EF5350";
    BLUE_FILL_COLOR = "#42A5F5";
    LNE_BORDER_COLOR = "#fff";
    WIDTH = 200; // Width of the goal
    HEIGHT = 0; // Height of the goal
    BORDER_SIZE = 2; // Border size
    Y_OFSSET = 12;
    x = 0;
    y = 0;
    fillColor;
    borderColor;
    blueTeam; // New property to save whether the goal is at the top
    constructor(blueTeam, canvas) {
        super();
        this.blueTeam = blueTeam;
        this.borderColor = this.LNE_BORDER_COLOR;
        if (blueTeam) {
            // Position goal at the bottom of the canvas
            this.y = canvas.height - this.HEIGHT - this.Y_OFSSET;
            this.fillColor = this.BLUE_FILL_COLOR;
        }
        else {
            // Position goal at the top of the canvas
            this.y = this.Y_OFSSET;
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
        if (this.blueTeam) {
            context.arc(this.x + this.WIDTH / 2, this.y + this.HEIGHT, this.WIDTH / 2, 0, Math.PI, true);
        }
        else {
            context.arc(this.x + this.WIDTH / 2, this.y, this.WIDTH / 2, Math.PI, 0, true);
        }
        context.closePath();
        context.fill();
        context.stroke();
    }
}
