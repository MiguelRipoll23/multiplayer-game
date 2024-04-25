export interface GameObject {
  load(): void;
  hasLoaded(): boolean;

  update(deltaTimeStamp: DOMHighResTimeStamp): void;
  render(context: CanvasRenderingContext2D): void;
}
