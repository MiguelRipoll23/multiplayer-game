export interface GameObject {
  load(): void;
  hasLoaded(): boolean;

  update(deltaTimeStamp: number): void;
  render(context: CanvasRenderingContext2D): void;
}
