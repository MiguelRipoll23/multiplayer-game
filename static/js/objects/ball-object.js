import { HitboxObject } from "./hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-dynamic-collidable-game-object.js";
export class BallObject extends BaseDynamicCollidableGameObject {
    MASS = 1;
    RADIUS = 20; // Define the radius
    FRICTION = 0.01;
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
        this.applyFriction();
        this.calculateMovement();
        this.updateHitbox();
    }
    render(context) {
        context.save(); // Save the current context state
        // Set up gradient
        const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.RADIUS);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Inner color (white)
        gradient.addColorStop(1, "rgba(200, 200, 200, 1)"); // Outer color (light gray)
        // Draw the football ball with gradient
        context.beginPath();
        context.fillStyle = gradient;
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
    applyFriction() {
        this.vx *= 1 - this.FRICTION;
        this.vy *= 1 - this.FRICTION;
    }
    calculateMovement() {
        this.x -= this.vx;
        this.y -= this.vy;
    }
    updateHitbox() {
        this.getHitboxObjects().forEach((object) => {
            object.setX(this.x - this.RADIUS);
            object.setY(this.y - this.RADIUS);
        });
    }
}
