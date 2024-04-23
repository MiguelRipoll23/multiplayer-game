export interface GameObject {
  update(deltaTimeStamp: number): void;
  render(context: CanvasRenderingContext2D): void;
}
