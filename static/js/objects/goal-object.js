import { HitboxObject } from "./common/hitbox-object.js";
import { BaseStaticCollidableGameObject } from "./base/base-static-collidable-game-object.js";
export class GoalObject extends BaseStaticCollidableGameObject {
    WIDTH = 100; // Width of the goal
    HEIGHT = 40; // Height of the goal (adjusted)
    BORDER_SIZE = 2; // Border size
    BORDER_COLOR = "#fff";
    Y_OFFSET = 13;
    fillColor = "rgba(255, 255, 255, 0.6)";
    constructor(canvas) {
        super();
        this.rigidBody = false;
        this.setPosition(canvas);
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
        context.strokeStyle = this.BORDER_COLOR;
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
        // Remove top border for orange team
        context.beginPath();
        context.moveTo(this.x, this.y + this.HEIGHT);
        context.lineTo(this.x + this.WIDTH, this.y + this.HEIGHT);
        context.closePath();
        context.stroke();
        // Hitbox
        super.render(context);
    }
    setPosition(canvas) {
        this.y = this.Y_OFFSET;
        // Calculate x position to center the goal horizontally
        this.x = (canvas.width - this.WIDTH) / 2;
    }
    createHitbox() {
        const y = this.y + 1;
        this.setHitboxObjects([
            new HitboxObject(this.x + 2, y, this.WIDTH - 4, this.HEIGHT / 2),
        ]);
    }
}
