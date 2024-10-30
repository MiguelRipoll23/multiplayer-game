import { HitboxObject } from "../common/hitbox-object.js";
import { BasePositionableGameObject } from "./base-positionable-game-object.js";

export class BaseStaticCollidableGameObject extends BasePositionableGameObject {
  protected rigidBody: boolean = true;
  protected hitboxObjects: HitboxObject[];

  private collidingObjects: BaseStaticCollidableGameObject[];
  private avoidingCollision: boolean = false;

  constructor() {
    super();
    this.hitboxObjects = [];
    this.collidingObjects = [];
  }

  public override load(): void {
    this.getHitboxObjects().forEach((object) => object.setDebug(this.debug));
    super.load();
  }

  public hasRigidBody(): boolean {
    return this.rigidBody;
  }

  public isColliding(): boolean {
    return this.collidingObjects.some((collidingObject) =>
      collidingObject.hasRigidBody()
    );
  }

  public getHitboxObjects(): HitboxObject[] {
    return this.hitboxObjects;
  }

  public setHitboxObjects(hitboxObjects: HitboxObject[]): void {
    this.hitboxObjects = hitboxObjects;
  }

  public getCollidingObjects(): BaseStaticCollidableGameObject[] {
    return this.collidingObjects;
  }

  public addCollidingObject(
    collidingObject: BaseStaticCollidableGameObject
  ): void {
    if (this.collidingObjects.includes(collidingObject) === false) {
      this.collidingObjects.push(collidingObject);
    }
  }

  public removeCollidingObject(
    collidingObject: BaseStaticCollidableGameObject
  ): void {
    this.collidingObjects = this.collidingObjects.filter(
      (object) => object !== collidingObject
    );
  }

  public isAvoidingCollision(): boolean {
    return this.avoidingCollision;
  }

  public setAvoidingCollision(avoidingCollision: boolean): void {
    this.avoidingCollision = avoidingCollision;
  }

  public render(context: CanvasRenderingContext2D): void {
    this.hitboxObjects.forEach((object) => object.render(context));
  }
}
