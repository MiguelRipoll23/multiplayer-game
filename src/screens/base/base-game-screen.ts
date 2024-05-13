import { GameObject } from "../../objects/interfaces/game-object.js";
import { GameLoopService } from "../../services/game-loop-service.js";
import { ScreenManagerService } from "../../services/screen-manager-service.js";
import { GameScreen } from "../interfaces/game-screen.js";

export class BaseGameScreen implements GameScreen {
  protected canvas: HTMLCanvasElement;
  protected screenManagerService: ScreenManagerService | null = null;

  protected opacity: number = 0;
  protected sceneObjects: GameObject[];
  protected uiObjects: GameObject[];

  private objectsLoadingPending: boolean = true;

  constructor(gameLoop: GameLoopService) {
    console.log(`${this.constructor.name} created`);

    this.canvas = gameLoop.getCanvas();
    this.sceneObjects = [];
    this.uiObjects = [];
  }

  public isActive(): boolean {
    return this.opacity > 0;
  }

  public setScreenManagerService(
    screenManagerService: ScreenManagerService,
  ): void {
    this.screenManagerService = screenManagerService;
  }

  public loadObjects(): void {
    this.sceneObjects.forEach((object) => object.load());
    this.uiObjects.forEach((object) => object.load());
    this.objectsLoadingPending = false;
  }

  public hasLoaded(): boolean {
    if (this.objectsLoadingPending) {
      return false;
    }

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

  public hasTransitionFinished(): void {
    console.log(`Transition to ${this.constructor.name} finished`);
  }

  private checkIfScreenHasLoaded(): void {
    if (this.objectsLoadingPending && this.hasLoaded()) {
      this.objectsLoadingPending = false;
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
