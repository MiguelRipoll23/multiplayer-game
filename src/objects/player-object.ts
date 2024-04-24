import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class PlayerObject extends BaseGameObject implements GameObject {
  protected name: string;

  constructor(name: string) {
    super();

    this.name = name;
  }

  public update(deltaTimeStamp: number): void {
    // TODO
  }

  public render(context: CanvasRenderingContext2D): void {
    // TODO
  }
}
