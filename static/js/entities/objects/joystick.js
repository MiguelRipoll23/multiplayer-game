export class Joystick {
  canvas;
  active = false;
  controlX = 0;
  controlY = 0;
  x = 0;
  y = 0;
  radius;
  maxDistance;
  initialTouch = { x: 0, y: 0 };
  touchPoint = { x: 0, y: 0 };
  usingTouch = false;
  constructor(canvas, radius = 40, maxDistance = 30) {
    this.canvas = canvas;
    this.radius = radius;
    this.maxDistance = maxDistance;
    this.addTouchEventListeners();
  }
  update(deltaFrameMilliseconds) {
    if (this.usingTouch) {
      this.updateJoystickPosition();
    } else {
      this.resetJoystick();
    }
  }
  render(context) {
    if (this.usingTouch) {
      this.drawJoystick(context);
    }
  }
  updateJoystickPosition() {
    const distance = this.calculateDistance();
    if (distance <= this.maxDistance) {
      this.x = this.touchPoint.x;
      this.y = this.touchPoint.y;
    } else {
      this.adjustPosition(distance);
    }
    this.calculateControlValues();
  }
  calculateDistance() {
    return Math.sqrt(
      Math.pow(this.touchPoint.x - this.initialTouch.x, 2) +
        Math.pow(this.touchPoint.y - this.initialTouch.y, 2)
    );
  }
  adjustPosition(distance) {
    const angle = Math.atan2(
      this.touchPoint.y - this.initialTouch.y,
      this.touchPoint.x - this.initialTouch.x
    );
    const newX = this.initialTouch.x + this.maxDistance * Math.cos(angle);
    const newY = this.initialTouch.y + this.maxDistance * Math.sin(angle);
    this.x = newX;
    this.y = newY;
  }
  calculateControlValues() {
    const relativeX = this.x - this.initialTouch.x;
    const relativeY = this.y - this.initialTouch.y;
    this.controlX = relativeX / this.maxDistance;
    this.controlY = relativeY / this.maxDistance;
  }
  isActive() {
    return this.active;
  }
  getControlX() {
    return this.controlX;
  }
  getControlY() {
    return this.controlY;
  }
  drawJoystick(context) {
    this.drawInitialTouchCircleBorder(context);
    this.drawJoystickCircle(context);
  }
  drawInitialTouchCircleBorder(context) {
    context.beginPath();
    context.arc(
      this.initialTouch.x,
      this.initialTouch.y,
      this.radius,
      0,
      Math.PI * 2
    );
    context.strokeStyle = "rgba(0, 0, 0, 0.1)";
    context.lineWidth = 2; // Adjust line width as needed
    context.stroke();
    context.closePath();
  }
  drawJoystickCircle(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const gradient = context.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(200, 200, 200, 0.8)");
    context.fillStyle = gradient;
    // Save the current state
    context.save();
    // Apply shadow settings only to the joystick
    context.shadowColor = "rgba(0, 0, 0, 0.3)";
    context.shadowBlur = 10;
    context.fill();
    // Restore the previous state
    context.restore();
    context.closePath();
  }
  addTouchEventListeners() {
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }
  handleTouchStart(event) {
    this.active = true;
    this.usingTouch = true;
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.initialTouch = this.getTouchPoint(touch, rect);
    this.touchPoint = this.initialTouch;
  }
  handleTouchMove(event) {
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
    this.active = false;
    this.usingTouch = false;
    this.touchPoint = { x: 0, y: 0 };
    this.controlX = 0;
    this.controlY = 0;
  }
}
