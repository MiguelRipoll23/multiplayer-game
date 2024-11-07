export interface GameObject {
  load(): void;
  hasLoaded(): boolean;
  setDebug(debug: boolean): void;

  isSyncable(): boolean;
  isSyncableByHost(): boolean;

  update(deltaTimeStamp: DOMHighResTimeStamp): void;
  render(context: CanvasRenderingContext2D): void;
}
