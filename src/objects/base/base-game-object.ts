import { StateType } from "../../types/state-type.js";
import { GameObject } from "../interfaces/game-object.js";

export class BaseGameObject implements GameObject {
  protected loaded: boolean = false;
  protected state: StateType = StateType.Active;
  protected removed: boolean = false;
  protected opacity: number = 1;
  protected debug: boolean = false;

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

  public getState(): StateType {
    return this.state;
  }

  public setState(state: StateType): void {
    this.state = state;

    if (this.state === StateType.Inactive) {
      console.log(`${this.constructor.name} set to inactive`);
    }
  }

  public isRemoved(): boolean {
    return this.removed;
  }

  public setRemoved(removed: boolean): void {
    this.removed = removed;

    if (this.removed) {
      console.log(`${this.constructor.name} to be removed from screen`);
    }
  }

  public getOpacity(): number {
    return this.opacity;
  }

  public setOpacity(opacity: number): void {
    this.opacity = opacity;
  }

  public setDebug(debug: boolean): void {
    this.debug = debug;
  }

  public update(deltaTimeStamp: number): void {}

  public render(context: CanvasRenderingContext2D): void {}
}
