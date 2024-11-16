import { ObjectState } from "../../models/object-state.js";
import { GameObject } from "../interfaces/game-object.js";

export class BaseGameObject implements GameObject {
  protected loaded: boolean = false;
  protected state: ObjectState = ObjectState.Active;
  protected removed: boolean = false;
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

  public getState(): ObjectState {
    return this.state;
  }

  public setState(state: ObjectState): void {
    this.state = state;

    if (this.state === ObjectState.Inactive) {
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

  public setDebug(debug: boolean): void {
    this.debug = debug;
  }

  public update(deltaTimeStamp: number): void {}

  public render(context: CanvasRenderingContext2D): void {}
}
