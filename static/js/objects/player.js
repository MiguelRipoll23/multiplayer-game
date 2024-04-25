import { BaseGameObject } from "./base/base-game-object.js";
export class Player extends BaseGameObject {
  name;
  constructor(name) {
    super();
    this.name = name;
  }
  update(deltaFrameMilliseconds) {
    // TODO
  }
  render(context) {
    // TODO
  }
}
