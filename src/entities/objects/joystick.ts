import { GameObject } from "../../interfaces/game-object.js";
import { TouchPoint } from "../../interfaces/touch-point.js";

export class Joystick implements GameObject {
  private canvas: HTMLCanvasElement;

  private active: boolean = false;
  private controlX: number = 0;
  private controlY: number = 0;

  private x: number = 0;
  private y: number = 0;
  private radius: number;
  private maxDistance: number;
  private initialTouch: TouchPoint = { x: 0, y: 0 };
  private touchPoint: TouchPoint = { x: 0, y: 0 };
  private usingTouch: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    radius: number = 40,
    maxDistance: number = 25,
  ) {
    this.canvas = canvas;
    this.radius = radius;
    this.maxDistance = maxDistance;

    this.addTouchEventListeners();
  }

  public update(deltaTimeStamp: number) {
    if (this.usingTouch) {
      this.updateJoystickPosition();
    } else {
      this.resetJoystick();
    }
  }

  public render(context: CanvasRenderingContext2D) {
    if (this.usingTouch) {
      this.drawJoystick(context);
    }
  }

  private updateJoystickPosition() {
    const distance = this.calculateDistance();
    if (distance <= this.maxDistance) {
      this.x = this.touchPoint.x;
      this.y = this.touchPoint.y;
    } else {
      this.adjustPosition(distance);
    }

    this.calculateControlValues();
  }

  private calculateDistance(): number {
    return Math.sqrt(
      Math.pow(this.touchPoint.x - this.initialTouch.x, 2) +
        Math.pow(this.touchPoint.y - this.initialTouch.y, 2),
    );
  }

  private adjustPosition(distance: number) {
    const angle = Math.atan2(
      this.touchPoint.y - this.initialTouch.y,
      this.touchPoint.x - this.initialTouch.x,
    );
    const newX = this.initialTouch.x + this.maxDistance * Math.cos(angle);
    const newY = this.initialTouch.y + this.maxDistance * Math.sin(angle);
    this.x = newX;
    this.y = newY;
  }

  private calculateControlValues() {
    const relativeX = this.x - this.initialTouch.x;
    const relativeY = this.y - this.initialTouch.y;

    this.controlX = relativeX / this.maxDistance;
    this.controlY = relativeY / this.maxDistance;
  }

  public isActive() {
    return this.active;
  }

  public getControlX() {
    return this.controlX;
  }

  public getControlY() {
    return this.controlY;
  }

  private drawJoystick(context: CanvasRenderingContext2D) {
    this.drawInitialTouchCircleBorder(context);
    this.drawJoystickCircle(context);
  }

  private drawInitialTouchCircleBorder(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(
      this.initialTouch.x,
      this.initialTouch.y,
      this.radius,
      0,
      Math.PI * 2,
    );
    context.strokeStyle = "rgba(0, 0, 0, 0.1)";
    context.lineWidth = 2; // Adjust line width as needed
    context.stroke();
    context.closePath();
  }

  private drawJoystickCircle(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      this.radius,
      0,
      Math.PI * 2,
    );
    const gradient = context.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius,
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

  private addTouchEventListeners() {
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
    );

    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  private handleTouchStart(event: TouchEvent) {
    this.active = true;
    this.usingTouch = true;

    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.initialTouch = this.getTouchPoint(touch, rect);
    this.touchPoint = this.initialTouch;
  }

  private handleTouchMove(event: TouchEvent) {
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    this.touchPoint = this.getTouchPoint(touch, rect);
  }

  private handleTouchEnd(event: TouchEvent) {
    this.resetJoystick();
  }

  private getTouchPoint(touch: Touch, rect: DOMRect): TouchPoint {
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  private resetJoystick() {
    this.active = false;
    this.usingTouch = false;
    this.touchPoint = { x: 0, y: 0 };
    this.controlX = 0;
    this.controlY = 0;
  }
}
