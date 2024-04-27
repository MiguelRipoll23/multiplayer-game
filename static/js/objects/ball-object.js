import { ObjectHitbox } from "../models/object-hitbox.js";
import { BaseCollidableObject } from "./base/base-collidable-object.js";
export class BallObject extends BaseCollidableObject {
    x;
    y;
    angle;
    canvas;
    RADIUS = 20; // Define the radius
    CENTER_X;
    CENTER_Y;
    BALL_COLOR_LIGHT = "#ffffff"; // Light color
    BALL_COLOR_DARK = "#cccccc"; // Dark color
    constructor(x, y, angle, canvas) {
        super();
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.canvas = canvas;
        this.CENTER_X = this.canvas.width / 2;
        this.CENTER_Y = this.canvas.height / 2;
    }
    load() {
        this.createHitbox();
        super.load();
    }
    update(deltaTimeStamp) {
        // TODO: Implement any update logic if needed
    }
    render(context) {
        context.save(); // Save the current context state
        // Translate context to ball position
        context.translate(this.x, this.y);
        // Rotate context by the angle
        context.rotate(this.angle);
        // Draw the football ball
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, this.RADIUS);
        gradient.addColorStop(0, this.BALL_COLOR_LIGHT); // Light color
        gradient.addColorStop(1, this.BALL_COLOR_DARK); // Dark color
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(0, 0, this.RADIUS, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        // Restore the context state
        context.restore();
    }
    setCenterPosition() {
        // Set position to the center of the canvas accounting for the radius
        this.x = this.CENTER_X;
        this.y = this.CENTER_Y;
    }
    createHitbox() {
        this.setHitbox(new ObjectHitbox(this.x, this.y, this.RADIUS * 2, this.RADIUS * 2));
    }
}
