import { PressableWindowObject } from "./common/pressable-window-object.js";

export class NewsObject extends PressableWindowObject {
  private index: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  public getIndex(): number {
    return this.index;
  }

  public openPost(index: number, title: string, content: string): void {
    this.index = index;
    super.open(title, content);
  }
}
