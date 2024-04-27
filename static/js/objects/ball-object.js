import { HitboxObject } from "./hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-dynamic-collidable-game-object.js";
export class BallObject extends BaseDynamicCollidableGameObject {
    MASS = 1;
    RADIUS = 20; // Define the radius
    BALL_COLOR_LIGHT = "#ffffff"; // Light color
    BALL_COLOR_DARK = "#cccccc"; // Dark color
    canvas;
    centerX;
    centerY;
    constructor(x, y, canvas) {
        super();
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.mass = this.MASS;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    load() {
        this.createHitbox();
        super.load();
    }
    update(deltaTimeStamp) {
        this.updateHitbox();
        this.calculateMovement();
    }
    render(context) {
        context.save(); // Save the current context state
        // Draw the football ball
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.RADIUS);
        gradient.addColorStop(0, this.BALL_COLOR_LIGHT); // Light color
        gradient.addColorStop(1, this.BALL_COLOR_DARK); // Dark color
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.x, this.y, this.RADIUS, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        // Restore the context state
        context.restore();
        // Hitbox render
        super.render(context);
    }
    setCenterPosition() {
        // Set position to the center of the canvas accounting for the radius
        this.x = this.centerX;
        this.y = this.centerY;
    }
    createHitbox() {
        const hitboxObject = new HitboxObject(this.x - this.RADIUS * 2, this.y - this.RADIUS * 2, this.RADIUS * 2, this.RADIUS * 2);
        this.setHitboxObjects([hitboxObject]);
    }
    updateHitbox() {
        this.getHitboxObjects().forEach((object) => {
            object.setX(this.x - this.RADIUS);
            object.setY(this.y - this.RADIUS);
        });
    }
    calculateMovement() {
        this.x -= this.vx;
        this.y -= this.vy;
    }
}
