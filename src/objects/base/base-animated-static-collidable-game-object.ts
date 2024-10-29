import { StaticCollidableMixin } from "../mixins/static-collidable-mixin.js";
import { BaseAnimatedGameObject } from "./base-animated-object.js";

export class BaseAnimatedStaticCollidableGameObject extends StaticCollidableMixin(BaseAnimatedGameObject) {
  constructor() {
    super();
  }
}
