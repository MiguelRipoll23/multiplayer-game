import { HitboxObject } from "./common/hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
import { CarObject } from "./car-object.js";
export class BallObject extends BaseDynamicCollidableGameObject {
    canvas;
    MASS = 1;
    RADIUS = 20;
    FRICTION = 0.01;
    radius = this.RADIUS;
    inactive = false;
    elapsedInactiveMilliseconds = 0;
    lastPlayerObject = null;
    constructor(x, y, canvas) {
        super();
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.mass = this.MASS;
    }
    load() {
        this.createHitbox();
        super.load();
    }
    reset() {
        this.vx = 0;
        this.vy = 0;
        this.radius = this.RADIUS;
        this.setCenterPosition();
        this.elapsedInactiveMilliseconds = 0;
        this.inactive = false;
    }
    setCenterPosition() {
        // Set position to the center of the canvas accounting for the radius
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
    }
    isInactive() {
        return this.inactive;
    }
    setInactive() {
        this.inactive = true;
        this.vx = -this.vx * 2;
        this.vy = -this.vy * 2;
    }
    getLastPlayerObject() {
        return this.lastPlayerObject;
    }
    update(deltaTimeStamp) {
        this.handleInactiveState(deltaTimeStamp);
        this.applyFriction();
        this.calculateMovement();
        this.updateHitbox();
        this.handlePlayerCollision();
    }
    render(context) {
        context.save(); // Save the current context state
        // Set up gradient
        const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Inner color (white)
        gradient.addColorStop(1, "rgba(200, 200, 200, 1)"); // Outer color (light gray)
        // Draw the football ball with gradient
        context.beginPath();
        context.fillStyle = gradient;
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        // Restore the context state
        context.restore();
        if (this.debug) {
            this.renderDebugInformation(context);
        }
        // Hitbox render
        super.render(context);
    }
    createHitbox() {
        const hitboxObject = new HitboxObject(this.x - this.RADIUS * 2, this.y - this.RADIUS * 2, this.RADIUS * 2, this.RADIUS * 2);
        this.setHitboxObjects([hitboxObject]);
    }
    handleInactiveState(deltaTimeStamp) {
        if (this.inactive) {
            this.radius += 1;
        }
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
    handlePlayerCollision() {
        this.getCollidingObjects().forEach((object) => {
            if (object instanceof CarObject) {
                this.lastPlayerObject = object.getPlayerObject();
            }
        });
    }
    renderDebugInformation(context) {
        this.renderLastPlayerTouched(context);
    }
    renderLastPlayerTouched(context) {
        const playerName = this.lastPlayerObject?.getName() ?? "none";
        context.fillStyle = "rgba(255, 255, 255, 0.6)";
        context.fillRect(24, 72, 120, 10);
        context.fillStyle = "blue";
        context.font = "8px system-ui";
        context.textAlign = "left";
        context.fillText(`Last Ball Player: ${playerName}`, 28, 80);
    }
}
