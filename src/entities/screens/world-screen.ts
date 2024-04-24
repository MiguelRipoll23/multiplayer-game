import { GameObject } from "../../interfaces/game-object.js";
import { GameScreen } from "../../interfaces/game-screen.js";
import { GearStick } from "../objects/gear-stick.js";
import { Joystick } from "../objects/joystick.js";
import { LocalCar } from "../objects/local-car.js";

export class WorldScreen implements GameScreen {
  private readonly SCREEN_ID: string = "WORLD_SCREEN";

  private canvas: HTMLCanvasElement;
  private opacity: number = 0;
  private sceneObjects: GameObject[];
  private uiObjects: GameObject[];

  private joystick: Joystick | null = null;
  private gearStick: GearStick | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.sceneObjects = [];
    this.uiObjects = [];
  }

  public getId(): string {
    return this.SCREEN_ID;
  }

  public update(deltaTimeStamp: number): void {
    this.updateObjects(this.sceneObjects, deltaTimeStamp);
    this.updateObjects(this.uiObjects, deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;

    this.renderObjects(this.sceneObjects, context);
    this.renderObjects(this.uiObjects, context);

    context.globalAlpha = 1;
  }

  public addObjects(): void {
    this.addControls();
    this.addLocalCar();
  }

  public getOpacity(): number {
    return this.opacity;
  }

  public setOpacity(opacity: number): void {
    this.opacity = opacity;
  }

  private updateObjects(objects: GameObject[], deltaTimeStamp: number): void {
    objects.forEach((object) => object.update(deltaTimeStamp));
  }

  private renderObjects(
    objects: GameObject[],
    context: CanvasRenderingContext2D,
  ): void {
    objects.forEach((object) => object.render(context));
  }

  private addControls(): void {
    this.gearStick = new GearStick(this.canvas);
    this.uiObjects.push(this.gearStick);

    this.joystick = new Joystick(this.canvas);
    this.uiObjects.push(this.joystick);
  }

  private addLocalCar(): void {
    const localCar = new LocalCar(
      this.canvas.width / 2 - 25,
      this.canvas.height / 2 - 25,
      90,
      this.canvas,
    );

    if (this.joystick && this.gearStick) {
      localCar.setControls(this.joystick, this.gearStick);
    }

    this.sceneObjects.push(localCar);
  }
}
