import { ScreenManagerService } from "../../services/screen-manager-service.js";
import { ScreenManager } from "./screen-manager.js";

export interface GameScreen {
  isActive(): boolean;

  setScreenManagerService(screenManagerService: ScreenManagerService): void;

  loadObjects(): void;
  hasLoaded(): boolean;

  update(deltaTimeStamp: number): void;
  render(context: CanvasRenderingContext2D): void;

  getOpacity(): number;
  setOpacity(opacity: number): void;
  hasTransitionFinished(): void;
}
