export interface GameScreen {
  loadObjects(): void;
  hasLoaded(): boolean;

  update(deltaTimeStamp: number): void;
  render(context: CanvasRenderingContext2D): void;

  getOpacity(): number;
  setOpacity(opacity: number): void;
}
