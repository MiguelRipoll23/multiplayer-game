import { HitboxObject } from "../hitbox-object.js";
import { CollidableGameObject } from "../interfaces/collidable-game-object.js";
import { GameObject } from "../interfaces/game-object.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseCollidableGameObject extends BaseGameObject
  implements CollidableGameObject {
  protected objectHitbox: HitboxObject | null = null;

  private colliding: boolean = false;
  private collidedObject: GameObject | null = null;

  constructor() {
    super();
  }

  public getHitbox(): HitboxObject | null {
    return this.objectHitbox;
  }

  public setHitbox(objectHitbox: HitboxObject): void {
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

  public render(context: CanvasRenderingContext2D): void {
    if (this.objectHitbox) {
      this.objectHitbox.render(context);
    }
  }
}
