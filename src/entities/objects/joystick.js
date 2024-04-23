export class Joystick {
    canvas;
    context;
    isPressed = false;
    controlX = 0;
    controlY = 0;
    x = 0;
    y = 0;
    radius;
    maxDistance;
    initialTouch = { x: 0, y: 0 };
    touchPoint = { x: 0, y: 0 };
    usingTouch = false;
    constructor(canvas, context, radius = 40, maxDistance = 60) {
        this.canvas = canvas;
        this.context = context;
        this.radius = radius;
        this.maxDistance = maxDistance;
        this.addTouchEventListeners();
    }
    update(deltaTimeStamp) {
        if (this.usingTouch) {
            const distance = Math.sqrt(Math.pow(this.touchPoint.x - this.initialTouch.x, 2) +
                Math.pow(this.touchPoint.y - this.initialTouch.y, 2));
            if (distance <= this.maxDistance) {
                this.x = this.touchPoint.x;
                this.y = this.touchPoint.y;
            }
            else {
                const angle = Math.atan2(this.touchPoint.y - this.initialTouch.y, this.touchPoint.x - this.initialTouch.x);
                const newX = this.initialTouch.x + this.maxDistance * Math.cos(angle);
                const newY = this.initialTouch.y + this.maxDistance * Math.sin(angle);
                this.x = newX;
                this.y = newY;
            }
            const relativeX = this.x - this.initialTouch.x;
            const relativeY = this.y - this.initialTouch.y;
            this.controlX = relativeX / this.maxDistance;
            this.controlY = relativeY / this.maxDistance;
        }
        else {
            this.resetJoystick();
        }
    }
    render() {
        if (this.usingTouch) {
            this.context.beginPath();
            this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            const gradient = this.context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
            gradient.addColorStop(1, "rgba(200, 200, 200, 0.8)");
            this.context.fillStyle = gradient;
            this.context.shadowColor = "rgba(0, 0, 0, 0.3)";
            this.context.shadowBlur = 10;
            this.context.fill();
            this.context.closePath();
        }
    }
    addTouchEventListeners() {
        this.canvas.addEventListener("touchstart", this.handleTouchStart.bind(this));
        this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
        this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));
    }
    handleTouchStart(event) {
        this.isPressed = true;
        this.usingTouch = true;
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.initialTouch = this.getTouchPoint(touch, rect);
        this.touchPoint = this.initialTouch;
    }
    handleTouchMove(event) {
        event.preventDefault();
        const touch = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.touchPoint = this.getTouchPoint(touch, rect);
    }
    handleTouchEnd(event) {
        this.resetJoystick();
    }
    getTouchPoint(touch, rect) {
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    }
    resetJoystick() {
        this.isPressed = false;
        this.usingTouch = false;
        this.touchPoint = { x: 0, y: 0 };
        this.controlX = 0;
        this.controlY = 0;
    }
}
