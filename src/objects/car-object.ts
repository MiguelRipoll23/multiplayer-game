import { HitboxObject } from "./common/hitbox-object.js";
import { PlayerObject } from "./player-object.js";
import { BaseDynamicCollidableGameObject } from "./base/base-collidable-dynamic-game-object.js";
import { Team } from "../models/game-teams.js";
import { WebRTCPeer } from "../services/interfaces/webrtc-peer.js";

export class CarObject extends BaseDynamicCollidableGameObject {
  protected readonly TOP_SPEED: number = 4;
  protected readonly ACCELERATION: number = 0.4;
  protected readonly HANDLING: number = 6;
  protected canvas: HTMLCanvasElement | null = null;
  protected speed: number = 0;
  protected playerObject: PlayerObject | null = null;

  private readonly IMAGE_BLUE_PATH = "./images/car-blue.png";
  private readonly IMAGE_RED_PATH = "./images/car-red.png";

  private readonly MASS: number = 500;
  private readonly WIDTH: number = 50;
  private readonly HEIGHT: number = 50;
  private readonly DISTANCE_CENTER: number = 220;
  private readonly FRICTION: number = 0.1;

  private carImage: HTMLImageElement | null = null;
  private imagePath = this.IMAGE_BLUE_PATH;

  constructor(x: number, y: number, angle: number, remote = false) {
    super();
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.mass = this.MASS;

    if (remote) {
      this.imagePath = this.IMAGE_RED_PATH;
    }
  }

  public override load(): void {
    this.createHitbox();
    this.loadCarImage();
  }

  public override reset(): void {
    this.angle = 90;
    this.speed = 0;
    this.setCenterPosition();
  }

  public override serialize(): ArrayBuffer {
    const buffer = new ArrayBuffer(10);
    const dataView = new DataView(buffer);

    dataView.setFloat32(0, this.x);
    dataView.setFloat32(2, this.y);
    dataView.setFloat32(4, this.angle);
    dataView.setFloat32(6, this.speed);

    return buffer;
  }

  public override sendSyncableData(
    webrtcPeer: WebRTCPeer,
    data: ArrayBuffer
  ): void {
    webrtcPeer.sendUnreliableOrderedMessage(data);
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    this.wrapAngle();
    this.applyFriction();
    this.calculateMovement();
    this.updateHitbox();

    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.save();

    context.translate(this.x + this.WIDTH / 2, this.y + this.HEIGHT / 2);
    context.rotate((this.angle * Math.PI) / 180);
    context.drawImage(
      this.carImage!,
      -this.WIDTH / 2,
      -this.HEIGHT / 2,
      this.WIDTH,
      this.HEIGHT
    );

    context.restore();

    // Hitbox debug
    super.render(context);
  }

  public getPlayerObject(): PlayerObject | null {
    return this.playerObject;
  }

  public setPlayerObject(playerObject: PlayerObject): void {
    this.playerObject = playerObject;
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  public setCenterPosition(): void {
    if (this.canvas === null) {
      throw new Error("Canvas is not set");
    }

    this.x = this.canvas.width / 2 - this.WIDTH / 2;
    this.y = this.canvas.height / 2 - this.HEIGHT / 2;

    if (this.playerObject?.getTeam() === Team.Orange) {
      this.y -= this.DISTANCE_CENTER;
    } else {
      this.y += this.DISTANCE_CENTER;
    }
  }

  private createHitbox(): void {
    this.setHitboxObjects([
      new HitboxObject(this.x, this.y, this.WIDTH, this.WIDTH),
    ]);
  }

  protected updateHitbox(): void {
    this.getHitboxObjects().forEach((object) => {
      object.setX(this.x);
      object.setY(this.y);
    });
  }

  private loadCarImage(): void {
    this.carImage = new Image();
    this.carImage.onload = () => {
      super.load();
    };

    this.carImage.src = this.imagePath;
  }

  private wrapAngle(): void {
    this.angle = (this.angle + 360) % 360;
  }

  private applyFriction(): void {
    if (this.isColliding()) {
      // We don't want the car to stop if is colliding
      // otherwise it would became stuck
      return;
    }

    if (this.speed !== 0) {
      if (Math.abs(this.speed) <= this.FRICTION) {
        this.speed = 0; // If friction would stop the car, set speed to 0
      } else {
        this.speed += -Math.sign(this.speed) * this.FRICTION;
      }
    }
  }

  private calculateMovement(): void {
    if (this.isColliding()) {
      this.speed *= -1;
    }

    const angleInRadians = (this.angle * Math.PI) / 180;
    this.vx = Math.cos(angleInRadians) * this.speed;
    this.vy = Math.sin(angleInRadians) * this.speed;

    this.x -= this.vx;
    this.y -= this.vy;
  }
}
