import { GameObject } from "../../interfaces/game-object.js";

interface TouchPoint {
  x: number;
  y: number;
}

export class Joystick implements GameObject {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  public isPressed: boolean = false;
  public controlX: number = 0;
  public controlY: number = 0;

  private x: number = 0;
  private y: number = 0;
  private radius: number;
  private maxDistance: number;
  private initialTouch: TouchPoint = { x: 0, y: 0 };
  private touchPoint: TouchPoint = { x: 0, y: 0 };
  private usingTouch: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    radius: number = 40,
    maxDistance: number = 60,
  ) {
    this.canvas = canvas;
    this.context = context;
    this.radius = radius;
    this.maxDistance = maxDistance;

    this.addTouchEventListeners();
  }

  public update(deltaTimeStamp: number) {
    if (this.usingTouch) {
      const distance = Math.sqrt(
        Math.pow(this.touchPoint.x - this.initialTouch.x, 2) +
          Math.pow(this.touchPoint.y - this.initialTouch.y, 2),
      );

      if (distance <= this.maxDistance) {
        this.x = this.touchPoint.x;
        this.y = this.touchPoint.y;
      } else {
        const angle = Math.atan2(
          this.touchPoint.y - this.initialTouch.y,
          this.touchPoint.x - this.initialTouch.x,
        );
        const newX = this.initialTouch.x + this.maxDistance * Math.cos(angle);
        const newY = this.initialTouch.y + this.maxDistance * Math.sin(angle);
        this.x = newX;
        this.y = newY;
      }

      const relativeX = this.x - this.initialTouch.x;
      const relativeY = this.y - this.initialTouch.y;

      this.controlX = relativeX / this.maxDistance;
      this.controlY = relativeY / this.maxDistance;
    } else {
      this.resetJoystick();
    }
  }

  public render() {
    if (this.usingTouch) {
      this.context.beginPath();
      this.context.arc(
        this.x,
        this.y,
        this.radius,
        0,
        Math.PI * 2,
      );
      const gradient = this.context.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        this.radius,
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
      gradient.addColorStop(1, "rgba(200, 200, 200, 0.8)");
      this.context.fillStyle = gradient;
      this.context.shadowColor = "rgba(0, 0, 0, 0.3)";
      this.context.shadowBlur = 10;
      this.context.fill();
      this.context.closePath();
    }
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
    this.isPressed = true;
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
    this.isPressed = false;
    this.usingTouch = false;
    this.touchPoint = { x: 0, y: 0 };
    this.controlX = 0;
    this.controlY = 0;
  }
}
