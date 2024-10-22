import { BaseStaticCollidableGameObject } from "../base/base-static-collidable-game-object.js";
import { HitboxObject } from "../common/hitbox-object.js";
export class WorldBackgroundObject extends BaseStaticCollidableGameObject {
    canvas;
    BACKGROUND_COLOR = "#00a000";
    BOUNDARY_COOLOR = "#ffffff";
    fieldWidth = 0;
    fieldHeight = 0;
    fieldX = 0;
    fieldY = 0;
    centerX = 0;
    centerY = 0;
    radius = 50;
    collisionObjects;
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.collisionObjects = [];
        this.calculateFieldDimensions();
        this.calculateCenter();
    }
    load() {
        this.createHitboxObjects();
        super.load();
    }
    calculateFieldDimensions() {
        this.fieldWidth = this.canvas.width - 25;
        this.fieldHeight = this.canvas.height - 25;
        this.fieldX = (this.canvas.width - this.fieldWidth) / 2;
        this.fieldY = (this.canvas.height - this.fieldHeight) / 2;
    }
    calculateCenter() {
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }
    update(deltaTimeStamp) {
        // No update logic required
    }
    render(context) {
        // Set background color
        context.fillStyle = this.BACKGROUND_COLOR;
        context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw football field
        context.fillStyle = this.BACKGROUND_COLOR;
        context.fillRect(this.fieldX, this.fieldY, this.fieldWidth, this.fieldHeight);
        // Draw boundary lines
        context.strokeStyle = this.BOUNDARY_COOLOR;
        context.lineWidth = 2;
        context.strokeRect(this.fieldX, this.fieldY, this.fieldWidth, this.fieldHeight);
        // Draw midfield line
        context.beginPath();
        context.moveTo(this.fieldX, this.canvas.height / 2);
        context.lineTo(this.fieldX + this.fieldWidth, this.canvas.height / 2);
        context.stroke();
        // Draw center circle
        context.beginPath();
        context.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
        context.stroke();
        // Draw hitboxes
        super.render(context);
    }
    getCollisionHitboxes() {
        return this.collisionObjects;
    }
    createHitboxObjects() {
        this.setHitboxObjects([
            new HitboxObject(this.fieldX, this.fieldY, this.fieldWidth, 1),
            new HitboxObject(this.fieldX, this.canvas.height - this.fieldY, this.fieldWidth, 1),
            new HitboxObject(this.canvas.width - this.fieldX, this.fieldY, 1, this.fieldHeight),
            new HitboxObject(this.fieldX, this.fieldY, 1, this.fieldHeight),
        ]);
    }
}
