import { StateType } from "../../types/state-type.js";

export interface GameObject {
  load(): void;
  hasLoaded(): boolean;

  getState(): StateType;
  setState(state: StateType): void;

  isRemoved(): boolean;
  setRemoved(removed: boolean): void;

  getOpacity(): number;
  setOpacity(opacity: number): void;

  setDebug(debug: boolean): void;

  update(deltaTimeStamp: DOMHighResTimeStamp): void;
  render(context: CanvasRenderingContext2D): void;
}
