import { BLUE_TEAM_COLOR } from "../constants/colors-constants.js";
import { GameKeyboard } from "../models/game-keyboard.js";
import { GamePointer } from "../models/game-pointer.js";
import { ObjectType } from "../models/object-type.js";
import { CarObject } from "./car-object.js";
import { GearStickObject } from "./gear-stick-object.js";
import { JoystickObject } from "./joystick-object.js";

export class LocalCarObject extends CarObject {
  private readonly joystickObject: JoystickObject;
  private readonly gearStickObject: GearStickObject;

  constructor(
    x: number,
    y: number,
    angle: number,
    protected readonly canvas: HTMLCanvasElement,
    gamePointer: GamePointer,
    gameKeyboard: GameKeyboard
  ) {
    super(x, y, angle);
    this.setSyncableValues();
    this.joystickObject = new JoystickObject(canvas, gamePointer, gameKeyboard);
    this.gearStickObject = new GearStickObject(
      canvas,
      gamePointer,
      gameKeyboard
    );
  }

  public getJoystickObject(): JoystickObject {
    return this.joystickObject;
  }

  public getGearStickObject(): GearStickObject {
    return this.gearStickObject;
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.handleControls();

    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    this.renderPlayerName(context);

    // Debug
    this.renderDebugInformation(context);

    super.render(context);
  }

  private setSyncableValues() {
    this.setSyncableId(crypto.randomUUID());
    this.setObjectTypeId(ObjectType.RemoteCar);
  }

  private handleControls(): void {
    if (!this.joystickObject || !this.gearStickObject) return;

    if (this.gearStickObject.isActive()) {
      return;
    }

    const currentGear = this.gearStickObject.getCurrentGear();

    if (this.joystickObject.isActive()) {
      if (currentGear === "F" && this.speed < this.TOP_SPEED) {
        this.speed += this.ACCELERATION;
      } else if (currentGear === "R" && this.speed > -this.TOP_SPEED) {
        this.speed -= this.ACCELERATION;
      }
    }

    this.angle +=
      this.HANDLING *
      (this.speed / this.TOP_SPEED) *
      this.joystickObject.getControlX();
  }

  private renderPlayerName(context: CanvasRenderingContext2D): void {
    if (this.gamePlayer === null) {
      return;
    }

    context.font = "20px system-ui";
    context.fillStyle = BLUE_TEAM_COLOR;
    context.textAlign = "center";
    context.fillText(
      this.gamePlayer.getName(),
      this.x + this.WIDTH / 2,
      this.y - 10
    );

    context.restore();
  }

  private renderDebugInformation(context: CanvasRenderingContext2D) {
    if (this.debug === false) {
      return;
    }

    this.renderDebugPositionInformation(context);
    this.renderDebugAngleInformation(context);
    this.renderDebugScoreInformation(context);
  }

  private renderDebugPositionInformation(context: CanvasRenderingContext2D) {
    const displayX = Math.round(this.x);
    const displayY = Math.round(this.y);

    const text = `Position: X(${displayX}) Y(${displayY})`;

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 24, 160, 20);
    context.fillStyle = "#FFFF00";
    context.font = "12px system-ui";
    context.textAlign = "left";
    context.fillText(text, 30, 38);
  }

  private renderDebugAngleInformation(context: CanvasRenderingContext2D) {
    const displayAngle = Math.round(this.angle);

    const text = `Angle: ${displayAngle}°`;

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 48, 80, 20);
    context.fillStyle = "#FFFF00";
    context.font = "12px system-ui";
    context.textAlign = "left";
    context.fillText(text, 30, 62);
  }

  private renderDebugScoreInformation(context: CanvasRenderingContext2D) {
    const score = this.gamePlayer?.getScore() ?? "Unknown";

    context.fillStyle = "rgba(0, 0, 0, 0.6)";
    context.fillRect(24, 72, 80, 20);
    context.fillStyle = "#FFFF00";
    context.font = "12px system-ui";
    context.textAlign = "left";
    context.fillText(`Score: ${score}`, 30, 86);
  }
}
