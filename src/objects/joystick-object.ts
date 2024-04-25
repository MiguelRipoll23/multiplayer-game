import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";
import { TouchPoint } from "./interfaces/touch-point.js";

export class JoystickObject extends BaseGameObject implements GameObject {
  private readonly RADIUS: number = 40;
  private readonly MAX_DISTANCE: number = 30;

  private readonly canvas: HTMLCanvasElement;

  private active: boolean = false;
  private controlX: number = 0;
  private controlY: number = 0;

  private x: number = 0;
  private y: number = 0;

  private initialTouch: TouchPoint = { x: 0, y: 0 };
  private touchPoint: TouchPoint = { x: 0, y: 0 };
  private usingTouch: boolean = false;

  private pressedKeys: Set<string> = new Set();

  constructor(
    canvas: HTMLCanvasElement,
  ) {
    super();

    this.canvas = canvas;

    this.addTouchEventListeners();
    this.addKeyboardEventListeners();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp) {
    if (this.usingTouch) {
      this.updateJoystickPosition();
    }
  }

  public render(context: CanvasRenderingContext2D) {
    if (this.usingTouch) {
      this.drawJoystick(context);
    }
  }

  private updateJoystickPosition() {
    const distance = this.calculateDistance();

    if (distance <= this.MAX_DISTANCE) {
      this.x = this.touchPoint.x;
      this.y = this.touchPoint.y;
    } else {
      this.adjustPosition();
    }

    this.calculateControlValues();
  }

  private calculateDistance(): number {
    return Math.sqrt(
      Math.pow(this.touchPoint.x - this.initialTouch.x, 2) +
        Math.pow(this.touchPoint.y - this.initialTouch.y, 2),
    );
  }

  private adjustPosition() {
    const angle = Math.atan2(
      this.touchPoint.y - this.initialTouch.y,
      this.touchPoint.x - this.initialTouch.x,
    );
    const newX = this.initialTouch.x + this.MAX_DISTANCE * Math.cos(angle);
    const newY = this.initialTouch.y + this.MAX_DISTANCE * Math.sin(angle);
    this.x = newX;
    this.y = newY;
  }

  private calculateControlValues() {
    const relativeX = this.x - this.initialTouch.x;
    const relativeY = this.y - this.initialTouch.y;

    this.controlX = relativeX / this.MAX_DISTANCE;
    this.controlY = relativeY / this.MAX_DISTANCE;
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
      this.RADIUS,
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
    context.arc(this.x, this.y, this.RADIUS, 0, Math.PI * 2);
    const gradient = context.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.RADIUS,
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
      { passive: true },
    );

    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: true,
    });

    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this)),
      { passive: true };
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

  private addKeyboardEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent) {
    this.pressedKeys.add(event.key);

    this.updateControlValues();
  }

  private handleKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);

    this.updateControlValues();
  }

  private updateControlValues() {
    const isArrowUpPressed = this.pressedKeys.has("ArrowUp") ||
      this.pressedKeys.has("w");
    const isArrowDownPressed = this.pressedKeys.has("ArrowDown") ||
      this.pressedKeys.has("s");
    const isArrowLeftPressed = this.pressedKeys.has("ArrowLeft") ||
      this.pressedKeys.has("a");
    const isArrowRightPressed = this.pressedKeys.has("ArrowRight") ||
      this.pressedKeys.has("d");

    this.active = isArrowUpPressed || isArrowDownPressed;

    if (isArrowUpPressed && !isArrowDownPressed) {
      this.controlY = -1;
    } else if (!isArrowUpPressed && isArrowDownPressed) {
      this.controlY = 1;
    } else {
      this.controlY = 0;
    }

    if (isArrowLeftPressed && !isArrowRightPressed) {
      this.controlX = -1;
    } else if (!isArrowLeftPressed && isArrowRightPressed) {
      this.controlX = 1;
    } else {
      this.controlX = 0;
    }
  }

  private resetJoystick() {
    this.active = false;
    this.usingTouch = false;
    this.touchPoint = { x: 0, y: 0 };
    this.controlX = 0;
    this.controlY = 0;
  }
}
