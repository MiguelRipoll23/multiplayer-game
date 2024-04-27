import { BaseGameObject } from "./base/base-game-object.js";

export class PlayerObject extends BaseGameObject {
  protected name: string;

  constructor(name: string) {
    super();

    this.name = name;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // TODO
  }

  public render(context: CanvasRenderingContext2D): void {
    // TODO
  }
}
