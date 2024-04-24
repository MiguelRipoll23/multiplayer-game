import { GameObject } from "./game-object.js";

export interface GameScreen {
  getId(): string;

  update(deltaTimeStamp: number): void;
  render(context: CanvasRenderingContext2D): void;
  addObjects(): void;

  getOpacity(): number;
  setOpacity(opacity: number): void;
}
