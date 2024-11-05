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
}
