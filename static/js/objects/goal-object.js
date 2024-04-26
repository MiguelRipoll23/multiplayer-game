import { BaseGameObject } from "./base/base-game-object.js";
export class GoalObject extends BaseGameObject {
    ORANGE_FILL_COLOR = "rgba(254, 118, 99, 0.5)";
    ORANGE_BORDER_COLOR = "rgba(254, 118, 99, 1)";
    BLUE_FILL_COLOR = "rgba(133, 222, 255, 0.5)";
    BLUE_BORDER_COLOR = "rgba(133, 222, 255, 1)";
    WIDTH = 200; // Width of the goal
    HEIGHT = 200; // Height of the goal
    BORDER_SIZE = 5; // Border size
    x = 0;
    y = 0;
    fillColor;
    borderColor;
    isTop; // New property to save whether the goal is at the top
    constructor(top, canvas) {
        super();
        this.isTop = top; // Save the 'top' value to the 'isTop' property
        if (top) {
            // Position goal at the top of the canvas
            this.y = -5;
            this.fillColor = this.ORANGE_FILL_COLOR;
            this.borderColor = this.ORANGE_BORDER_COLOR;
        }
        else {
            // Position goal at the bottom of the canvas
            this.y = canvas.height - this.HEIGHT + 5;
            this.fillColor = this.BLUE_FILL_COLOR;
            this.borderColor = this.BLUE_BORDER_COLOR;
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
        if (this.isTop) {
            context.arc(this.x + this.WIDTH / 2, this.y, this.WIDTH / 2, Math.PI, 0, true);
        }
        else {
            context.arc(this.x + this.WIDTH / 2, this.y + this.HEIGHT, this.WIDTH / 2, 0, Math.PI, true);
        }
        context.closePath();
        context.fill();
        context.stroke();
    }
}
