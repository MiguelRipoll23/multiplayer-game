import { ObjectHitbox } from "../../models/object-hitbox.js";
import { GameObject } from "./game-object.js";

export interface CollidableGameObject {
  getHitbox(): ObjectHitbox | null;
  setColliding(colliding: boolean): void;
  isColliding(): boolean;
  setCollidedObject(collidedObject: GameObject | null): void;
  getCollidedObject(): GameObject | null;
}
