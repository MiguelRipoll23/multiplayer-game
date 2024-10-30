import { HitboxObject } from "./common/hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
export class CarObject extends BaseDynamicCollidableGameObject {
    canvas;
    TOP_SPEED = 4;
    ACCELERATION = 0.4;
    HANDLING = 6;
    speed = 0;
    playerObject = null;
    IMAGE_PATH = "./images/car-local.png";
    MASS = 500;
    WIDTH = 50;
    HEIGHT = 50;
    DISTANCE_CENTER = 220;
    FRICTION = 0.1;
    BOUNCE_MULTIPLIER = 0.7;
    orangeTeam = false;
    carImage = null;
    constructor(x, y, angle, orangeTeam, canvas) {
        super();
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.orangeTeam = orangeTeam;
        this.mass = this.MASS;
    }
    load() {
        this.createHitbox();
        this.loadCarImage();
    }
    update(deltaTimeStamp) {
        this.wrapAngle();
        this.applyFriction();
        this.calculateMovement();
        this.updateHitbox();
    }
    render(context) {
        context.save();
        context.translate(this.x + this.WIDTH / 2, this.y + this.HEIGHT / 2);
        context.rotate((this.angle * Math.PI) / 180);
        context.drawImage(this.carImage, -this.WIDTH / 2, -this.HEIGHT / 2, this.WIDTH, this.HEIGHT);
        context.restore();
        // Debug
        this.renderDebugInformation(context);
        // Hitbox debug
        super.render(context);
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
    getPlayerObject() {
        return this.playerObject;
    }
    setPlayerObject(playerObject) {
        this.playerObject = playerObject;
    }
    createHitbox() {
        this.setHitboxObjects([
            new HitboxObject(this.x, this.y, this.WIDTH, this.WIDTH),
        ]);
    }
    updateHitbox() {
        this.getHitboxObjects().forEach((object) => {
            object.setX(this.x);
            object.setY(this.y);
        });
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
        if (this.isColliding()) {
            // We don't want the car to stop if is colliding
            // otherwise it would became stuck
            return;
        }
        if (this.speed !== 0) {
            if (Math.abs(this.speed) <= this.FRICTION) {
                this.speed = 0; // If friction would stop the car, set speed to 0
            }
            else {
                this.speed += -Math.sign(this.speed) * this.FRICTION;
            }
        }
    }
    calculateMovement() {
        if (this.isColliding()) {
            this.speed *= -1;
        }
        const angleInRadians = (this.angle * Math.PI) / 180;
        this.vx = Math.cos(angleInRadians) * this.speed;
        this.vy = Math.sin(angleInRadians) * this.speed;
        this.x -= this.vx;
        this.y -= this.vy;
    }
    renderDebugInformation(context) {
        if (this.debug === false) {
            return;
        }
        this.renderDebugPositionInformation(context);
        this.renderDebugAngleInformation(context);
        this.renderDebugIsOutsideBounds(context);
    }
    renderDebugPositionInformation(context) {
        const displayX = Math.round(this.x);
        const displayY = Math.round(this.y);
        const text = `Position: X(${displayX}) Y(${displayY})`;
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(24, 24, 85, 10);
        context.fillStyle = "#FFFF00";
        context.font = "8px system-ui";
        context.textAlign = "left";
        context.fillText(text, 28, 32);
    }
    renderDebugAngleInformation(context) {
        const displayAngle = Math.round(this.angle);
        const text = `Angle: ${displayAngle}`;
        context.fillStyle = "rgba(0, 0, 0, 0.6)";
        context.fillRect(24, 36, 45, 10);
        context.fillStyle = "#FFFF00";
        context.font = "8px system-ui";
        context.textAlign = "left";
        context.fillText(text, 28, 44);
    }
    renderDebugIsOutsideBounds(context) {
        const outsideBounds = this.x < 0 ||
            this.x > this.canvas.width ||
            this.y < 0 ||
            this.y > this.canvas.height;
        context.fillStyle = "rgba(255, 255, 255, 0.6)";
        context.fillRect(24, 48, 85, 10);
        context.fillStyle = "purple";
        context.font = "8px system-ui";
        context.textAlign = "left";
        context.fillText("Outside Bounds: " + outsideBounds, 28, 56);
    }
}
