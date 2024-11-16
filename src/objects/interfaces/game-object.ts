import { ObjectState } from "../../models/object-state.js";

export interface GameObject {
  load(): void;
  hasLoaded(): boolean;

  getState(): ObjectState;
  setState(state: ObjectState): void;

  isRemoved(): boolean;
  setRemoved(removed: boolean): void;

  setDebug(debug: boolean): void;

  update(deltaTimeStamp: DOMHighResTimeStamp): void;
  render(context: CanvasRenderingContext2D): void;
}
