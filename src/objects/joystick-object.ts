import { BaseGameObject } from "./base/base-game-object.js";
import { GamePointer } from "../models/game-pointer.js";

export class JoystickObject extends BaseGameObject {
  private readonly RADIUS: number = 40;
  private readonly MAX_DISTANCE: number = 30;

  private active: boolean = false;
  private controlX: number = 0;
  private controlY: number = 0;

  private x: number = 0;
  private y: number = 0;

  private pressedKeys: Set<string> = new Set();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly gamePointer: GamePointer
  ) {
    super();
    this.addKeyboardEventListeners();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp) {
    if (this.gamePointer.isTouch()) {
      this.handleGamePointerEvents();
      this.updateJoystickPosition();
    }
  }

  public render(context: CanvasRenderingContext2D) {
    if (this.gamePointer.isTouch() && this.gamePointer.isPressing()) {
      this.drawJoystick(context);
    }
  }

  private handleGamePointerEvents() {
    if (this.gamePointer.isPressing()) {
      this.active = true;
    } else {
      this.resetJoystick();
    }
  }

  private updateJoystickPosition() {
    const distance = this.calculateDistance();

    if (distance <= this.MAX_DISTANCE) {
      this.x = this.gamePointer.getX();
      this.y = this.gamePointer.getY();
    } else {
      this.adjustPosition();
    }

    this.calculateControlValues();
  }

  private calculateDistance(): number {
    return Math.sqrt(
      Math.pow(this.gamePointer.getX() - this.gamePointer.getInitialX(), 2) +
        Math.pow(this.gamePointer.getY() - this.gamePointer.getInitialY(), 2)
    );
  }

  private adjustPosition() {
    const angle = Math.atan2(
      this.gamePointer.getY() - this.gamePointer.getInitialY(),
      this.gamePointer.getX() - this.gamePointer.getInitialX()
    );
    const newX =
      this.gamePointer.getInitialX() + this.MAX_DISTANCE * Math.cos(angle);
    const newY =
      this.gamePointer.getInitialY() + this.MAX_DISTANCE * Math.sin(angle);
    this.x = newX;
    this.y = newY;
  }

  private calculateControlValues() {
    const relativeX = this.x - this.gamePointer.getInitialX();
    const relativeY = this.y - this.gamePointer.getInitialY();

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
      this.gamePointer.getInitialX(),
      this.gamePointer.getInitialY(),
      this.RADIUS,
      0,
      Math.PI * 2
    );
    context.strokeStyle = "rgba(0, 0, 0, 0.2)";
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
      this.RADIUS
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
    gradient.addColorStop(1, "rgba(50, 50, 50, 0.8)");
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
    const isArrowUpPressed =
      this.pressedKeys.has("ArrowUp") || this.pressedKeys.has("w");
    const isArrowDownPressed =
      this.pressedKeys.has("ArrowDown") || this.pressedKeys.has("s");
    const isArrowLeftPressed =
      this.pressedKeys.has("ArrowLeft") || this.pressedKeys.has("a");
    const isArrowRightPressed =
      this.pressedKeys.has("ArrowRight") || this.pressedKeys.has("d");

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
    this.controlX = 0;
    this.controlY = 0;
  }
}
