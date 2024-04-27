import { BaseStaticCollidableGameObject as BaseStaticCollidableGameObject } from "../../objects/base/base-static-collidable-game-object.js";
import { BaseDynamicCollidableGameObject } from "../../objects/base/base-dynamic-collidable-game-object.js";
import { HitboxObject } from "../../objects/hitbox-object.js";
import { GameObject } from "../../objects/interfaces/game-object.js";
import { GoalObject } from "../../objects/goal-object.js";

export class BaseGameScreen {
  protected canvas: HTMLCanvasElement;

  protected opacity: number = 0;
  protected sceneObjects: GameObject[];
  protected uiObjects: GameObject[];

  private isScreenLoading: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    console.log(`${this.constructor.name} created`);

    this.canvas = canvas;
    this.sceneObjects = [];
    this.uiObjects = [];
  }

  public loadObjects(): void {
    this.sceneObjects.forEach((object) => object.load());
    this.uiObjects.forEach((object) => object.load());
  }

  public hasLoaded(): boolean {
    return [...this.sceneObjects, ...this.uiObjects].every((object) =>
      object.hasLoaded()
    );
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.checkIfScreenHasLoaded();

    this.updateObjects(this.sceneObjects, deltaTimeStamp);
    this.updateObjects(this.uiObjects, deltaTimeStamp);

    this.detectCollisions();
  }

  public detectCollisions(): void {
    const collidableGameObjects: BaseStaticCollidableGameObject[] =
      this.sceneObjects.filter(
        (sceneObject) =>
          sceneObject instanceof BaseStaticCollidableGameObject ||
          sceneObject instanceof BaseDynamicCollidableGameObject
      ) as unknown as BaseStaticCollidableGameObject[];

    collidableGameObjects.forEach((collidableGameObject) => {
      collidableGameObject.setColliding(false);

      let hasCollision = false;

      collidableGameObjects.forEach((otherCollidableGameObject) => {
        if (collidableGameObject === otherCollidableGameObject) {
          return;
        }

        if (
          this.detectCollision(collidableGameObject, otherCollidableGameObject)
        ) {
          hasCollision = true;
        }
      });

      if (hasCollision === false) {
        collidableGameObject.setAvoidingCollision(false);
      }
    });
  }

  public render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;

    this.renderObjects(this.sceneObjects, context);
    this.renderObjects(this.uiObjects, context);

    context.globalAlpha = 1;
  }

  public getOpacity(): number {
    return this.opacity;
  }

  public setOpacity(opacity: number): void {
    this.opacity = opacity;
  }

  private checkIfScreenHasLoaded(): void {
    if (this.isScreenLoading && this.hasLoaded()) {
      this.isScreenLoading = false;
      console.log(`${this.constructor.name} loaded`);
    }
  }

  private updateObjects(
    objects: GameObject[],
    deltaTimeStamp: DOMHighResTimeStamp
  ): void {
    objects.forEach((object) => {
      if (object.hasLoaded()) {
        object.update(deltaTimeStamp);
      }
    });
  }

  private detectCollision(
    sceneObject:
      | BaseStaticCollidableGameObject
      | BaseDynamicCollidableGameObject,
    otherSceneObject:
      | BaseStaticCollidableGameObject
      | BaseDynamicCollidableGameObject
  ): boolean {
    const hitboxes = sceneObject.getHitboxObjects();
    const otherHitboxes = otherSceneObject.getHitboxObjects();

    if (this.hitboxesIntersect(hitboxes, otherHitboxes)) {
      if (
        sceneObject instanceof BaseDynamicCollidableGameObject &&
        otherSceneObject instanceof BaseDynamicCollidableGameObject
      ) {
        this.simulateCollisionBetweenDynamicObjects(
          sceneObject,
          otherSceneObject
        );
      } else if (
        sceneObject instanceof BaseDynamicCollidableGameObject &&
        otherSceneObject instanceof BaseStaticCollidableGameObject
      ) {
        if (sceneObject.isAvoidingCollision()) {
          return true;
        }

        this.simulateCollisionBetweenDynamicAndStaticObjects(sceneObject);
      }

      return true;
    }

    return false;
  }

  private hitboxesIntersect(
    hitboxes: HitboxObject[],
    otherHitboxes: HitboxObject[]
  ) {
    let intersecting = false;

    hitboxes.forEach((hitbox) => {
      otherHitboxes.forEach((otherHitbox) => {
        if (
          hitbox.getX() < otherHitbox.getX() + otherHitbox.getWidth() &&
          hitbox.getX() + hitbox.getWidth() > otherHitbox.getX() &&
          hitbox.getY() < otherHitbox.getY() + otherHitbox.getHeight() &&
          hitbox.getY() + hitbox.getHeight() > otherHitbox.getY()
        ) {
          intersecting = true;
          hitbox.setColliding(true);
          otherHitbox.setColliding(true);
        }
      });
    });

    return intersecting;
  }
  private simulateCollisionBetweenDynamicAndStaticObjects(
    sceneObject: BaseDynamicCollidableGameObject
  ) {
    sceneObject.setAvoidingCollision(true);
    sceneObject.setVX(-sceneObject.getVX());
    sceneObject.setVY(-sceneObject.getVY());
  }

  private simulateCollisionBetweenDynamicObjects(
    sceneObject: BaseDynamicCollidableGameObject,
    otherSceneObject: BaseDynamicCollidableGameObject
  ) {
    // Calculate collision vector
    const vCollision = {
      x: otherSceneObject.getX() - sceneObject.getX(),
      y: otherSceneObject.getY() - sceneObject.getY(),
    };

    // Calculate distance between objects
    const distance = Math.sqrt(
      Math.pow(vCollision.x, 2) + Math.pow(vCollision.y, 2)
    );

    // Normalize collision vector
    const vCollisionNorm = {
      x: vCollision.x / distance,
      y: vCollision.y / distance,
    };

    // Calculate relative velocity
    const vRelativeVelocity = {
      x: otherSceneObject.getVX() - sceneObject.getVX(),
      y: otherSceneObject.getVY() - sceneObject.getVY(),
    };

    // Calculate speed along collision normal
    const speed =
      vRelativeVelocity.x * vCollisionNorm.x +
      vRelativeVelocity.y * vCollisionNorm.y;

    if (speed < 0) {
      // Collision has already been resolved
      return;
    }

    // Calculate impulse
    const impulse =
      (2 * speed) / (sceneObject.getMass() + otherSceneObject.getMass());

    // Update velocities for both movable objects
    const impulseX = impulse * otherSceneObject.getMass() * vCollisionNorm.x;
    const impulseY = impulse * otherSceneObject.getMass() * vCollisionNorm.y;

    sceneObject.setVX(sceneObject.getVX() + impulseX);
    sceneObject.setVY(sceneObject.getVY() + impulseY);

    otherSceneObject.setVX(otherSceneObject.getVX() - impulseX);
    otherSceneObject.setVY(otherSceneObject.getVY() - impulseY);
  }

  private renderObjects(
    objects: GameObject[],
    context: CanvasRenderingContext2D
  ): void {
    objects.forEach((object) => {
      if (object.hasLoaded()) {
        object.render(context);
      }
    });
  }
}
