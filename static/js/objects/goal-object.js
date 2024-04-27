import { BLUE_TEAM_TRANSPARENCY_COLOR, ORANGE_TEAM_TRANSPARENCY_COLOR, } from "../constants/colors.js";
import { ObjectHitbox } from "../models/object-hitbox.js";
import { BaseCollidableGameObject } from "./base/base-collidable-game-object.js";
export class GoalObject extends BaseCollidableGameObject {
    LINE_BORDER_COLOR = "#fff";
    WIDTH = 100; // Width of the goal
    HEIGHT = 40; // Height of the goal (adjusted)
    BORDER_SIZE = 2; // Border size
    Y_OFFSET = 13;
    x = 0;
    y = 0;
    fillColor;
    borderColor;
    orangeTeam;
    constructor(orangeTeam, canvas) {
        super();
        this.orangeTeam = orangeTeam;
        this.borderColor = this.LINE_BORDER_COLOR;
        if (orangeTeam) {
            // Position goal at the top of the canvas
            this.y = this.Y_OFFSET;
            this.fillColor = ORANGE_TEAM_TRANSPARENCY_COLOR;
        }
        else {
            // Position goal at the bottom of the canvas
            this.y = canvas.height - this.HEIGHT - this.Y_OFFSET;
            this.fillColor = BLUE_TEAM_TRANSPARENCY_COLOR;
        }
        // Calculate x position to center the goal horizontally
        this.x = (canvas.width - this.WIDTH) / 2;
    }
    load() {
        this.createHitbox();
        super.load();
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
        if (this.orangeTeam) {
            // Remove top border for orange team
            context.beginPath();
            context.moveTo(this.x, this.y + this.HEIGHT);
            context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
            context.closePath();
            context.stroke();
        }
        else {
            // Remove bottom border for blue team
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.WIDTH, this.y);
            context.closePath();
            context.stroke();
        }
        // Hitbox
        this.getHitbox()?.setX(this.x);
        this.getHitbox()?.setY(this.y);
        super.render(context);
    }
    createHitbox() {
        this.setHitbox(new ObjectHitbox(this.x, this.y, this.WIDTH, this.HEIGHT / 2));
    }
}
