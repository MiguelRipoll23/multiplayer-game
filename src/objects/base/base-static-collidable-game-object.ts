import { StaticCollidableMixin } from "../mixins/static-collidable-mixin.js";
import { BasePositionableGameObject } from "./base-positionable-game-object.js";

export class BaseStaticCollidableGameObject extends StaticCollidableMixin(BasePositionableGameObject) {
  constructor() {
    super();
  }
}
