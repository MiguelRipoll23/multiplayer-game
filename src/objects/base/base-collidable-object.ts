import { ObjectHitbox } from "../../models/object-hitbox.js";
import { GameObject } from "../interfaces/game-object.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseCollidableObject extends BaseGameObject {
  protected objectHitbox: ObjectHitbox | null = null;

  private colliding: boolean = false;
  private collidedObject: GameObject | null = null;

  constructor() {
    super();
  }

  public getHitbox(): ObjectHitbox | null {
    return this.objectHitbox;
  }

  public setHitbox(objectHitbox: ObjectHitbox): void {
    this.objectHitbox = objectHitbox;
  }

  public setColliding(colliding: boolean): void {
    this.colliding = colliding;
  }

  public isColliding(): boolean {
    return this.colliding;
  }

  public setCollidedObject(collidedObject: GameObject): void {
    this.collidedObject = collidedObject;
  }

  public getCollidedObject(): GameObject | null {
    return this.collidedObject;
  }
}
