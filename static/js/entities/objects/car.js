export class Car {
    topSpeed = 5;
    speed = 0;
    acceleration = 0.4;
    angle;
    handling = 6;
    x;
    y;
    canvas;
    vx = 0;
    vy = 0;
    friction = 0.1;
    bounceMultiplier = 0.5;
    width = 50;
    height = 50;
    carImage = null;
    imageLoaded = false;
    constructor(x, y, angle, canvas) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.canvas = canvas;
        this.loadCarImage();
    }
    update(deltaTimeStamp) {
        if (!this.imageLoaded)
            return;
        this.wrapAngle();
        this.applyFriction();
        this.calculateMovement();
    }
    render(context) {
        if (!this.imageLoaded)
            return;
        context.save();
        context.translate(this.x + this.width / 2, this.y + this.height / 2);
        context.rotate(this.angle * Math.PI / 180);
        context.drawImage(this.carImage, -this.width / 2, -this.height / 2, this.width, this.height);
        context.restore();
    }
    loadCarImage() {
        this.carImage = new Image();
        this.carImage.onload = () => {
            this.imageLoaded = true;
        };
        this.carImage.src = "./images/car-local.png";
    }
    wrapAngle() {
        this.angle = (this.angle + 360) % 360;
    }
    applyFriction() {
        this.speed += -this.friction * Math.sign(this.speed);
    }
    calculateMovement() {
        const angleInRadians = this.angle * Math.PI / 180;
        this.vx = Math.cos(angleInRadians) * this.speed;
        this.vy = Math.sin(angleInRadians) * this.speed;
        this.x -= this.vx;
        this.y -= this.vy;
        this.handleCanvasBounds();
    }
    handleCanvasBounds() {
        const canvasBoundsX = this.canvas.width - this.width;
        const canvasBoundsY = this.canvas.height - this.height;
        if (this.x <= 0 || this.x >= canvasBoundsX) {
            this.x = Math.max(0, Math.min(this.x, canvasBoundsX));
            this.speed = Math.abs(this.speed) > this.topSpeed
                ? Math.sign(this.speed) * this.topSpeed
                : this.speed;
            this.speed = -this.speed * this.bounceMultiplier;
        }
        if (this.y <= 0 || this.y >= canvasBoundsY) {
            this.y = Math.max(0, Math.min(this.y, canvasBoundsY));
            this.speed = Math.abs(this.speed) > this.topSpeed
                ? Math.sign(this.speed) * this.topSpeed
                : this.speed;
            this.speed = -this.speed * this.bounceMultiplier;
        }
    }
}
