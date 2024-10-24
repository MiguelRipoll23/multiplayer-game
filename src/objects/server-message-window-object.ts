import { CloseableWindowObject } from "./common/closeable-window-object.js";

export class ServerMessageWindowObject extends CloseableWindowObject {
  private index: number = 0;
  private next: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  public getIndex(): number {
    return this.index;
  }

  public getNext(): boolean {
    return this.next;
  }

  public openMessage(index: number, title: string, content: string): void {
    this.index = index;
    this.next = false;
    super.open(title, content);
  }

  public override close(): void {
    this.next = true;
  }

  public closeAll(): void {
    super.close();
  }
}
