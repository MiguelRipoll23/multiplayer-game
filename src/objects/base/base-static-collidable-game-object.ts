import { HitboxObject } from "../hitbox-object.js";
import { GameObject } from "../interfaces/game-object.js";
import { BaseGameObject } from "./base-game-object.js";

export class BaseStaticCollidableGameObject extends BaseGameObject {
  protected crossable: boolean = false;
  protected x: number = 0;
  protected y: number = 0;

  protected hitboxObjects: HitboxObject[];

  private collidingObjects: BaseStaticCollidableGameObject[];
  private avodingCollision: boolean = false;

  constructor() {
    super();
    this.hitboxObjects = [];
    this.collidingObjects = [];
  }

  public isCrossable(): boolean {
    return this.crossable;
  }

  public isColliding(): boolean {
    return this.collidingObjects.some((collidingObject) =>
      collidingObject.isCrossable() === false
    );
  }

  public getX(): number {
    return this.x;
  }

  public setX(x: number): void {
    this.x = x;
  }

  public getY(): number {
    return this.y;
  }

  public setY(y: number): void {
    this.y = y;
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
    collidingObject: BaseStaticCollidableGameObject,
  ): void {
    if (this.collidingObjects.includes(collidingObject) === false) {
      this.collidingObjects.push(collidingObject);
    }
  }

  public removeCollidingObject(
    collidingObject: BaseStaticCollidableGameObject,
  ): void {
    this.collidingObjects = this.collidingObjects.filter(
      (object) => object !== collidingObject,
    );
  }

  public isAvoidingCollision(): boolean {
    return this.avodingCollision;
  }

  public setAvoidingCollision(avodingCollision: boolean): void {
    this.avodingCollision = avodingCollision;
  }

  public render(context: CanvasRenderingContext2D): void {
    this.hitboxObjects.forEach((object) => object.render(context));
  }
}
