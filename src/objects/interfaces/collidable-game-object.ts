import { HitboxObject } from "../hitbox-object.js";
import { GameObject } from "./game-object.js";

export interface CollidableGameObject {
  getHitbox(): HitboxObject | null;
  setColliding(colliding: boolean): void;
  isColliding(): boolean;
  setCollidedObject(collidedObject: GameObject | null): void;
  getCollidedObject(): GameObject | null;
}
