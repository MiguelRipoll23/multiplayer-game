import { PressableWindowObject } from "./common/pressable-window-object.js";

export class ServerMessageWindowObject extends PressableWindowObject {
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

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.isPressed()) {
      this.close();
      console.log("Closed server message window with index:", this.index);
    }

    super.update(deltaTimeStamp);
  }
}
