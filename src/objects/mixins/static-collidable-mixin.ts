import { HitboxObject } from "../common/hitbox-object.js";
import { BasePositionableGameObject } from "../base/base-positionable-game-object.js";

export function StaticCollidableMixin<TBase extends new (...args: any[]) => BasePositionableGameObject>(Base: TBase) {
  return class extends Base {
    protected crossable: boolean = false;
    protected hitboxObjects: HitboxObject[] = [];
    private collidingObjects: InstanceType<TBase>[] = [];
    private avodingCollision: boolean = false;

    public override load(): void {
      this.getHitboxObjects().forEach((object) => object.setDebug(this.debug));
      super.load();
    }

    public isCrossable(): boolean {
      return this.crossable;
    }

    public isColliding(): boolean {
      return this.collidingObjects.some((collidingObject) =>
        collidingObject.isCrossable() === false
      );
    }

    public getHitboxObjects(): HitboxObject[] {
      return this.hitboxObjects;
    }

    public setHitboxObjects(hitboxObjects: HitboxObject[]): void {
      this.hitboxObjects = hitboxObjects;
    }

    public getCollidingObjects(): InstanceType<TBase>[] {
      return this.collidingObjects;
    }

    public addCollidingObject(
      collidingObject: InstanceType<TBase>,
    ): void {
      if (this.collidingObjects.includes(collidingObject) === false) {
        this.collidingObjects.push(collidingObject);
      }
    }

    public removeCollidingObject(
      collidingObject: InstanceType<TBase>,
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
  };
}
