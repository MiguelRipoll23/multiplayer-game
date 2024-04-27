import { BOUNDS_MARGIN } from "../constants/map.js";
import { ObjectHitbox } from "../models/object-hitbox.js";
import { BaseCollidableObject } from "./base/base-collidable-object.js";
export class CarObject extends BaseCollidableObject {
    TOP_SPEED = 5;
    ACCELERATION = 0.4;
    HANDLING = 6;
    canvas;
    angle;
    speed = 0;
    playerObject = null;
    IMAGE_PATH = "./images/car-local.png";
    WIDTH = 50;
    HEIGHT = 50;
    DISTANCE_CENTER = 220;
    FRICTION = 0.1;
    BOUNCE_MULTIPLIER = 0.7;
    x;
    y;
    vx = 0;
    vy = 0;
    orangeTeam = false;
    carImage = null;
    constructor(x, y, angle, orangeTeam, canvas) {
        super();
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.orangeTeam = orangeTeam;
        this.canvas = canvas;
    }
    load() {
        this.createHitbox();
        this.loadCarImage();
    }
    update(deltaTimeStamp) {
        this.wrapAngle();
        this.applyFriction();
        this.calculateMovement();
    }
    render(context) {
        context.save();
        context.translate(this.x + this.WIDTH / 2, this.y + this.HEIGHT / 2);
        context.rotate((this.angle * Math.PI) / 180);
        context.drawImage(this.carImage, -this.WIDTH / 2, -this.HEIGHT / 2, this.WIDTH, this.HEIGHT);
        context.restore();
    }
    setCenterPosition() {
        this.x = this.canvas.width / 2 - this.WIDTH / 2;
        this.y = this.canvas.height / 2 - this.HEIGHT / 2;
        if (this.orangeTeam) {
            this.y -= this.DISTANCE_CENTER;
        }
        else {
            this.y += this.DISTANCE_CENTER;
        }
    }
    setPlayerObject(playerObject) {
        this.playerObject = playerObject;
    }
    createHitbox() {
        this.setHitbox(new ObjectHitbox(this.x, this.y, this.WIDTH, this.HEIGHT));
    }
    loadCarImage() {
        this.carImage = new Image();
        this.carImage.onload = () => {
            super.load();
        };
        this.carImage.src = this.IMAGE_PATH;
    }
    wrapAngle() {
        this.angle = (this.angle + 360) % 360;
    }
    applyFriction() {
        this.speed += -this.FRICTION * Math.sign(this.speed);
    }
    calculateMovement() {
        const angleInRadians = (this.angle * Math.PI) / 180;
        this.vx = Math.cos(angleInRadians) * this.speed;
        this.vy = Math.sin(angleInRadians) * this.speed;
        this.x -= this.vx;
        this.y -= this.vy;
        this.handleCanvasBounds();
    }
    handleCanvasBounds() {
        const canvasBoundsX = this.canvas.width - this.WIDTH - BOUNDS_MARGIN;
        const canvasBoundsY = this.canvas.height - this.HEIGHT - BOUNDS_MARGIN;
        if (this.x <= BOUNDS_MARGIN || this.x >= canvasBoundsX) {
            this.x = Math.max(BOUNDS_MARGIN, Math.min(this.x, canvasBoundsX));
            this.speed = Math.abs(this.speed) > this.TOP_SPEED
                ? Math.sign(this.speed) * this.TOP_SPEED
                : this.speed;
            this.speed = -this.speed * this.BOUNCE_MULTIPLIER;
        }
        if (this.y <= BOUNDS_MARGIN || this.y >= canvasBoundsY) {
            this.y = Math.max(BOUNDS_MARGIN, Math.min(this.y, canvasBoundsY));
            this.speed = Math.abs(this.speed) > this.TOP_SPEED
                ? Math.sign(this.speed) * this.TOP_SPEED
                : this.speed;
            this.speed = -this.speed * this.BOUNCE_MULTIPLIER;
        }
    }
}
