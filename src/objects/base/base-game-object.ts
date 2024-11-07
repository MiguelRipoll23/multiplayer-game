import { GameObject } from "../interfaces/game-object.js";

export class BaseGameObject implements GameObject {
  protected loaded: boolean = false;
  protected debug: boolean = false;

  protected syncable: boolean = false;
  protected syncableByHost: boolean = false;

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

  public setDebug(debug: boolean): void {
    this.debug = debug;
  }

  public isSyncable(): boolean {
    return this.syncable;
  }

  public isSyncableByHost(): boolean {
    return this.syncableByHost;
  }

  public update(deltaTimeStamp: number): void {}

  public render(context: CanvasRenderingContext2D): void {}
}
