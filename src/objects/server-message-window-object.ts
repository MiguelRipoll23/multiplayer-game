import { CloseableWindowObject } from "./common/closeable-window-object.js";

export class ServerMessageWindowObject extends CloseableWindowObject {
  private index: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  public getIndex(): number {
    return this.index;
  }

  public openMessage(index: number, title: string, content: string): void {
    this.index = index;
    super.open(title, content);
  }
}
