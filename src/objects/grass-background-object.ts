import { BaseGameObject } from "./base/base-game-object.js";
import { GameObject } from "./interfaces/game-object.js";

export class GrassBackground extends BaseGameObject implements GameObject {
  private readonly TEXTURE_PATH = "./textures/grass12.png";

  private image: HTMLImageElement;

  constructor() {
    super();
    this.image = new Image();
    this.loadImage();
  }

  public override load(): void {
    this.loadImage();
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    // No update logic required
  }

  public render(context: CanvasRenderingContext2D): void {
    const pattern = context.createPattern(this.image, "repeat");

    if (pattern) {
      context.fillStyle = pattern;
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
  }

  private loadImage(): void {
    this.image = new Image();
    this.image.onload = () => {
      super.load();
    };

    this.image.src = this.TEXTURE_PATH;
  }
}
