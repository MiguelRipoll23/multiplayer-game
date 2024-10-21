import { PressableBaseGameObject } from "../base/pressable-game-object.js";

export class PressableWindowObject extends PressableBaseGameObject {
  private readonly TITLE_BAR_HEIGHT: number = 40;
  private readonly TEXT_LINE_HEIGHT: number = 20;

  private globalAlpha: number = 0;

  private titleBarTextX: number = 0;
  private titleBarTextY: number = 0;

  private titleTextX: number = 0;
  private titleTextY: number = 0;

  private contentTextX: number = 0;
  private contentTextY: number = 0;
  private contentTextMaxWidth: number = 0;

  protected title: string = "Title";
  protected content: string = "Content goes here";

  private hidden: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    this.setInitialState();
    this.setSize();
    this.setCenterPosition();
    this.calculatePositions();
  }

  public open(title: string, content: string): void {
    this.title = title;
    this.content = content;
    this.globalAlpha = 1;
    this.hidden = false;
    this.active = true;
  }

  public close(): void {
    this.hidden = true;
    this.globalAlpha = 0;
  }

  public isHidden(): boolean {
    return this.hidden;
  }

  public render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.globalAlpha;

    this.renderBackdrop(context);

    // Background
    context.fillStyle = "rgb(0, 0, 0, 1)";
    context.fillRect(this.x, this.y, this.width, this.height);

    // Title Bar
    context.fillStyle = "#333333"; // Title bar background color
    context.fillRect(this.x, this.y, this.width, this.TITLE_BAR_HEIGHT);

    // Window Title
    context.fillStyle = "#FFFFFF";
    context.font = "20px system-ui";
    context.textAlign = "left";
    context.fillText("SERVER MESSAGE", this.titleBarTextX, this.titleBarTextY);

    // Title
    context.fillStyle = "#FFFFFF";
    context.font = "20px system-ui";
    context.textAlign = "left";
    context.fillText(this.title, this.titleTextX, this.titleTextY);

    // Content
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

    super.render(context);
  }

  private setInitialState(): void {
    this.active = false;
  }

  private setSize(): void {
    this.width = this.canvas.width * 0.9;
    this.height = 300;
  }

  private setCenterPosition(): void {
    this.x = (this.canvas.width - this.width) / 2;
    this.y = (this.canvas.height - this.height) / 2;
  }

  private calculatePositions(): void {
    this.titleBarTextX = this.x + 15;
    this.titleBarTextY = this.y + 28;

    this.titleTextX = this.x + 14;
    this.titleTextY = this.y + 68;

    this.contentTextX = this.x + 14;
    this.contentTextY = this.y + this.TITLE_BAR_HEIGHT + 62;
    this.contentTextMaxWidth = this.width - 20;
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

  private renderBackdrop(context: CanvasRenderingContext2D): void {
    context.fillStyle = "rgba(0, 0, 0, 0.8)";
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
