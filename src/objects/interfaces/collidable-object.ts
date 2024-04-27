import { ObjectHitbox } from "../../models/object-hitbox.js";
import { GameObject } from "./game-object.js";

export interface CollidableGameObject {
  getHitbox(): ObjectHitbox;
  setColliding(colliding: boolean): void;
  isColliding(): boolean;
  setCollidedObject(collidedObject: GameObject): void;
  getCollidedObject(): GameObject | null;
}
