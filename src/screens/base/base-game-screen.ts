import { BaseCollidableGameObject } from "../../objects/base/base-collidable-game-object.js";
import { HitboxObject } from "../../objects/hitbox-object.js";
import { GameObject } from "../../objects/interfaces/game-object.js";

export class BaseGameScreen {
  protected opacity: number = 0;
  protected sceneObjects: GameObject[];
  protected uiObjects: GameObject[];

  private isScreenloading: boolean = true;

  constructor() {
    console.log(`${this.constructor.name} created`);

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
    const collidableGameObjects: BaseCollidableGameObject[] = this.sceneObjects
      .filter(
        (sceneObject) => sceneObject instanceof BaseCollidableGameObject,
      ) as unknown as BaseCollidableGameObject[];

    collidableGameObjects.forEach((collidableGameObject) => {
      collidableGameObject.setColliding(false);
      collidableGameObject.getHitbox()?.setColliding(false);

      collidableGameObjects.forEach((otherCollidableGameObject) => {
        if (collidableGameObject === otherCollidableGameObject) {
          return;
        }

        this.detectCollision(
          collidableGameObject,
          otherCollidableGameObject,
        );
      });
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
    if (this.isScreenloading && this.hasLoaded()) {
      this.isScreenloading = false;
      console.log(`${this.constructor.name} loaded`);
    }
  }

  private updateObjects(
    objects: GameObject[],
    deltaTimeStamp: DOMHighResTimeStamp,
  ): void {
    objects.forEach((object) => {
      if (object.hasLoaded()) {
        object.update(deltaTimeStamp);
      }
    });
  }

  private detectCollision(
    sceneObject: BaseCollidableGameObject,
    otherSceneObject: BaseCollidableGameObject,
  ) {
    const hitbox = sceneObject.getHitbox();
    const otherHitbox = otherSceneObject.getHitbox();

    if (!hitbox || !otherHitbox) {
      return;
    }

    if (this.hitboxesIntersect(hitbox, otherHitbox)) {
      hitbox.setColliding(true);
      otherHitbox.setColliding(true);

      sceneObject.setColliding(true);
      sceneObject.setCollidedObject(otherSceneObject);
    }
  }

  private hitboxesIntersect(
    hitbox: HitboxObject,
    otherHitbox: HitboxObject,
  ): boolean {
    return (
      hitbox.getX() < otherHitbox.getX() + otherHitbox.getWidth() &&
      hitbox.getX() + hitbox.getWidth() > otherHitbox.getX() &&
      hitbox.getY() < otherHitbox.getY() + otherHitbox.getHeight() &&
      hitbox.getY() + hitbox.getHeight() > otherHitbox.getY()
    );
  }

  private renderObjects(
    objects: GameObject[],
    context: CanvasRenderingContext2D,
  ): void {
    objects.forEach((object) => {
      if (object.hasLoaded()) {
        object.render(context);
      }
    });
  }
}
