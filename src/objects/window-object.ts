import { BaseGameObject } from "./base/base-game-object.js";

export class WindowObject extends BaseGameObject {
  private readonly TITLE_BAR_HEIGHT: number = 40;
  private readonly TEXT_LINE_HEIGHT: number = 20;

  private x: number = 0;
  private y: number = 0;

  private width: number = 600;
  private height: number = 350;

  private globalAlpha: number = 0;

  private titleBarTextX: number = 0;
  private titleBarTextY: number = 0;

  private newsTitleTextX: number = 0;
  private newsTitleTextY: number = 0;

  private contentTextX: number = 0;
  private contentTextY: number = 0;
  private contentTextMaxWidth: number = 0;

  private index: number = 0;
  private title: string = "Title";
  private content: string = "Content goes here";

  private hidden: boolean = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();

    this.width = this.canvas.width * 0.9;

    this.setCenterPosition();
    this.calculatePositions();
  }

  public setCenterPosition(): void {
    this.x = (this.canvas.width - this.width) / 2;
    this.y = (this.canvas.height - this.height) / 2;
  }

  public show(index: number, title: string, content: string): void {
    this.index = index;
    this.title = title;
    this.content = content;
    this.globalAlpha = 1;
    this.hidden = false;
    this.addEventListeners();
  }

  public getIndex(): number {
    return this.index;
  }

  public hide(): void {
    this.globalAlpha = 0;
    this.hidden = true;
    this.removeEventListeners();
  }

  public isHidden(): boolean {
    return this.hidden;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {}

  public render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.globalAlpha;

    // Background
    context.fillStyle = "rgba(0, 0, 0, 1)";
    context.fillRect(this.x, this.y, this.width, this.height);

    // Title Bar
    context.fillStyle = "#333333"; // Title bar background color
    context.fillRect(this.x, this.y, this.width, this.TITLE_BAR_HEIGHT);

    // Window Title
    context.fillStyle = "#FFFFFF";
    context.font = "20px system-ui";
    context.textAlign = "left";
    context.fillText("NEWS", this.titleBarTextX, this.titleBarTextY);

    // News Title
    context.fillStyle = "#FFFFFF";
    context.font = "20px system-ui";
    context.textAlign = "left";
    context.fillText(this.title, this.newsTitleTextX, this.newsTitleTextY);

    // News Content
    context.fillStyle = "#FFFFFF";
    context.font = "16px system-ui";
    context.textAlign = "left";

    // Text wrapping
    const lines = this.wrapText(
      context,
      this.content,
      this.contentTextMaxWidth,
    );

    for (let i = 0; i < lines.length; i++) {
      context.fillText(
        lines[i],
        this.contentTextX,
        this.contentTextY + (i * this.TEXT_LINE_HEIGHT),
      );
    }

    context.globalAlpha = 1; // Reset global alpha
  }

  private calculatePositions(): void {
    this.titleBarTextX = this.x + 15;
    this.titleBarTextY = this.y + 28;

    this.newsTitleTextX = this.x + 14;
    this.newsTitleTextY = this.y + 68;

    this.contentTextX = this.x + 14;
    this.contentTextY = this.y + this.TITLE_BAR_HEIGHT + 62;
    this.contentTextMaxWidth = this.width - 20;
  }

  private addEventListeners(): void {
    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  private removeEventListeners(): void {
    this.canvas.removeEventListener("click", this.handleClick.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (this.hidden) {
      return;
    }

    this.hide();
  }

  private wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    return lines;
  }
}
