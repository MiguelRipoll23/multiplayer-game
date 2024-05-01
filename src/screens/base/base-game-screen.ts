import { GameObject } from "../../objects/interfaces/game-object.js";
import { GameScreen } from "../interfaces/game-screen.js";

export class BaseGameScreen implements GameScreen {
  protected canvas: HTMLCanvasElement;

  protected opacity: number = 0;
  protected sceneObjects: GameObject[];
  protected uiObjects: GameObject[];

  private isScreenLoading: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    console.log(`${this.constructor.name} created`);

    this.canvas = canvas;
    this.sceneObjects = [];
    this.uiObjects = [];
  }

  public loadObjects(): void {
    this.sceneObjects.forEach((object) => object.load());
    this.uiObjects.forEach((object) => object.load());
  }

  public hasLoaded(): boolean {
    return [...this.sceneObjects, ...this.uiObjects].every((object) =>
      object.hasLoaded()
    );
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.checkIfScreenHasLoaded();

    this.updateObjects(this.sceneObjects, deltaTimeStamp);
    this.updateObjects(this.uiObjects, deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {
    this.renderObjects(this.sceneObjects, context);
    this.renderObjects(this.uiObjects, context);
  }

  public getOpacity(): number {
    return this.opacity;
  }

  public setOpacity(opacity: number): void {
    this.opacity = opacity;
  }

  private checkIfScreenHasLoaded(): void {
    if (this.isScreenLoading && this.hasLoaded()) {
      this.isScreenLoading = false;
      console.log(`${this.constructor.name} loaded`);
    }
  }

  private updateObjects(
    objects: GameObject[],
    deltaTimeStamp: DOMHighResTimeStamp,
  ): void {
    objects.forEach((object) => {
      if (object.hasLoaded()) {
        object.update(deltaTimeStamp);
      }
    });
  }

  private renderObjects(
    objects: GameObject[],
    context: CanvasRenderingContext2D,
  ): void {
    objects.forEach((object) => {
      if (object.hasLoaded()) {
        object.render(context);
      }
    });
  }
}
