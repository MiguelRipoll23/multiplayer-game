import { HitboxObject } from "../hitbox-object.js";
import { GameObject } from "../interfaces/game-object.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseStaticCollidableGameObject extends BaseGameObject {
  protected x: number = 0;
  protected y: number = 0;

  protected hitboxObjects: HitboxObject[];

  private colliding: boolean = false;

  private avodingCollision: boolean = false;
  private collisionDirection: number = 0;

  private collidedObject: GameObject | null = null;

  constructor() {
    super();
    this.hitboxObjects = [];
  }

  public getHitboxObjects(): HitboxObject[] {
    return this.hitboxObjects;
  }

  public setHitboxObjects(hitboxObjects: HitboxObject[]): void {
    this.hitboxObjects = hitboxObjects;
  }

  public setColliding(colliding: boolean): void {
    this.getHitboxObjects().forEach((hitboxObject) =>
      hitboxObject.setColliding(colliding)
    );
  }

  public isColliding(): boolean {
    return (
      this.getHitboxObjects().filter((hitboxObject) =>
        hitboxObject.isColliding()
      ).length > 0
    );
  }

  public setCollidedObject(collidedObject: GameObject): void {
    this.collidedObject = collidedObject;
  }

  public isAvoidingCollision(): boolean {
    return this.avodingCollision;
  }

  public setAvoidingCollision(avodingCollision: boolean): void {
    this.avodingCollision = avodingCollision;
  }

  public getCollisionDirection(): number {
    return this.collisionDirection;
  }

  public setCollisionDirection(collisionDirection: number): void {
    this.collisionDirection = collisionDirection;
  }

  public getCollidedObject(): GameObject | null {
    return this.collidedObject;
  }

  public setX(x: number): void {
    this.x = x;

    this.getHitboxObjects().forEach((hitboxObject) => {
      hitboxObject.setX(x);
    });
  }

  public getX(): number {
    return this.x;
  }

  public setY(y: number): void {
    this.y = y;

    this.getHitboxObjects().forEach((hitboxObject) => {
      hitboxObject.setY(y);
    });
  }

  public getY(): number {
    return this.y;
  }

  public render(context: CanvasRenderingContext2D): void {
    this.hitboxObjects.forEach((object) => object.render(context));
  }
}
