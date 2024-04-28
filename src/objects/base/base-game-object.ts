import { GameObject } from "../interfaces/game-object.js";

export class BaseGameObject implements GameObject {
  protected loaded: boolean = false;

  constructor() {
    console.log(`${this.constructor.name} created`);
  }

  public load() {
    console.log(`${this.constructor.name} loaded`);
    this.loaded = true;
  }

  public hasLoaded(): boolean {
    return this.loaded;
  }

  public update(deltaTimeStamp: number): void {}

  public render(context: CanvasRenderingContext2D): void {}
}
