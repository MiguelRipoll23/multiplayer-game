import { HitboxObject } from "./common/hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
import { CarObject } from "./car-object.js";
import { ObjectType } from "../models/object-types.js";
export class BallObject extends BaseDynamicCollidableGameObject {
    canvas;
    MASS = 1;
    RADIUS = 20;
    FRICTION = 0.01;
    radius = this.RADIUS;
    inactive = false;
    lastPlayerObject = null;
    constructor(x, y, canvas) {
        super();
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.mass = this.MASS;
        this.setSyncableValues();
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
        this.applyFriction();
        this.calculateMovement();
        this.updateHitbox();
        this.handlePlayerCollision();
    }
    render(context) {
        context.save(); // Save the current context state
        // Draw the gradient ball
        this.drawBallWithGradient(context);
        // If the ball is inactive, apply glow effect
        if (this.inactive) {
            this.applyGlowEffect(context);
            this.drawBallWithGlow(context);
        }
        // Restore the context state
        context.restore();
        // Render debug information if enabled
        if (this.debug) {
            this.renderDebugInformation(context);
        }
        // Hitbox render (from superclass)
        super.render(context);
    }
    sendSyncableDataToPeer(webrtcPeer, data) {
        webrtcPeer.sendUnreliableOrderedMessage(data);
    }
    serialize() {
        const arrayBuffer = new ArrayBuffer(10);
        const dataView = new DataView(arrayBuffer);
        dataView.setFloat32(0, this.x);
        dataView.setFloat32(2, this.y);
        dataView.setFloat32(4, this.vx);
        dataView.setFloat32(6, this.vy);
        // inactive (1 byte)
        dataView.setUint8(8, this.inactive ? 1 : 0);
        return dataView.buffer;
    }
    synchronize(data) {
        const dataView = new DataView(data);
        this.x = dataView.getFloat32(0);
        this.y = dataView.getFloat32(2);
        this.vx = dataView.getFloat32(4);
        this.vy = dataView.getFloat32(6);
        this.inactive = dataView.getUint8(8) === 1;
        this.updateHitbox();
    }
    setSyncableValues() {
        this.setSyncableId("94c58aa0-41c3-4b22-825a-15a3834be240");
        this.setObjectTypeId(ObjectType.Ball);
        this.setSyncableByHost(true);
    }
    // Function to create and draw the gradient ball
    drawBallWithGradient(context) {
        const gradient = this.createGradient(context);
        context.beginPath();
        context.fillStyle = gradient;
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }
    // Function to create the radial gradient
    createGradient(context) {
        const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); // Inner color (white)
        gradient.addColorStop(1, "rgba(200, 200, 200, 1)"); // Outer color (light gray)
        return gradient;
    }
    // Function to apply the glow effect when the ball is inactive
    applyGlowEffect(context) {
        context.shadowColor = "rgba(255, 215, 0, 1)"; // Glow color (golden yellow)
        context.shadowBlur = 25; // Glow intensity
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
    }
    // Function to draw the ball with the glow effect
    drawBallWithGlow(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
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
        context.fillRect(24, 96, 160, 20);
        context.fillStyle = "blue";
        context.font = "12px system-ui";
        context.textAlign = "left";
        context.fillText(`Last Touch: ${playerName}`, 30, 110);
    }
}
