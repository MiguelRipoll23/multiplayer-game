import { GameObject } from "../interfaces/game-object.js";
import { AnimationService } from "../../services/animation-service.js";

export class BaseGameObject implements GameObject {
  protected loaded: boolean = false;
  protected debug: boolean = false;
  protected animationService: AnimationService;

  constructor() {
    console.log(`${this.constructor.name} created`);
    this.animationService = new AnimationService();
  }

  public load() {
    console.log(`${this.constructor.name} loaded`);
    this.loaded = true;
  }

  public hasLoaded(): boolean {
    return this.loaded;
  }

  public setDebug(debug: boolean): void {
    this.debug = debug;
  }

  public update(deltaTimeStamp: number): void {
    this.animationService.update(deltaTimeStamp);
  }

  public render(context: CanvasRenderingContext2D): void {}
}
