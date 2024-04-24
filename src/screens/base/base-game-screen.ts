import { GameObject } from "../../objects/interfaces/game-object.js";

export class BaseGameScreen {
  protected opacity: number = 0;
  protected sceneObjects: GameObject[];
  protected uiObjects: GameObject[];

  private loadedMessagePending: boolean = true;

  constructor() {
    console.log(`Scene ${this.constructor.name} created`);

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

  public update(deltaTimeStamp: number): void {
    this.logScreenLoadedMessageIfPending();
    this.updateObjects(this.sceneObjects, deltaTimeStamp);
    this.updateObjects(this.uiObjects, deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;

    this.renderObjects(this.sceneObjects, context);
    this.renderObjects(this.uiObjects, context);

    context.globalAlpha = 1;
  }

  public getOpacity(): number {
    return this.opacity;
  }

  public setOpacity(opacity: number): void {
    this.opacity = opacity;
  }

  private logScreenLoadedMessageIfPending(): void {
    if (this.loadedMessagePending && this.hasLoaded()) {
      this.loadedMessagePending = false;
      console.log(`Scene ${this.constructor.name} loaded`);
    }
  }

  private updateObjects(objects: GameObject[], deltaTimeStamp: number): void {
    objects.forEach((object) => object.update(deltaTimeStamp));
  }

  private renderObjects(
    objects: GameObject[],
    context: CanvasRenderingContext2D
  ): void {
    objects.forEach((object) => object.render(context));
  }
}
