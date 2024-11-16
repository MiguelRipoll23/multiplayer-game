import { HitboxObject } from "./common/hitbox-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
export class CarObject extends BaseDynamicCollidableGameObject {
    TOP_SPEED = 4;
    ACCELERATION = 0.4;
    HANDLING = 6;
    canvas = null;
    speed = 0;
    playerObject = null;
    IMAGE_BLUE_PATH = "./images/car-blue.png";
    IMAGE_RED_PATH = "./images/car-red.png";
    MASS = 500;
    WIDTH = 50;
    HEIGHT = 50;
    DISTANCE_CENTER = 220;
    FRICTION = 0.1;
    carImage = null;
    imagePath = this.IMAGE_BLUE_PATH;
    constructor(x, y, angle, remote = false) {
        super();
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.mass = this.MASS;
        if (remote) {
            this.imagePath = this.IMAGE_RED_PATH;
        }
    }
    load() {
        this.createHitbox();
        this.loadCarImage();
    }
    reset() {
        this.angle = 90;
        this.speed = 0;
        this.setCenterPosition();
    }
    serialize() {
        const buffer = new ArrayBuffer(10);
        const dataView = new DataView(buffer);
        dataView.setFloat32(0, this.x);
        dataView.setFloat32(2, this.y);
        dataView.setFloat32(4, this.angle);
        dataView.setFloat32(6, this.speed);
        return buffer;
    }
    sendSyncableData(webrtcPeer, data) {
        webrtcPeer.sendUnreliableOrderedMessage(data);
    }
    update(deltaTimeStamp) {
        this.wrapAngle();
        this.applyFriction();
        this.calculateMovement();
        this.updateHitbox();
        super.update(deltaTimeStamp);
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
    getPlayerObject() {
        return this.playerObject;
    }
    setPlayerObject(playerObject) {
        this.playerObject = playerObject;
    }
    setCanvas(canvas) {
        this.canvas = canvas;
    }
    setCenterPosition() {
        if (this.canvas === null) {
            throw new Error("Canvas is not set");
        }
        this.x = this.canvas.width / 2 - this.WIDTH / 2;
        this.y = this.canvas.height / 2 - this.HEIGHT / 2;
        this.y += this.DISTANCE_CENTER;
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
        this.carImage.src = this.imagePath;
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
