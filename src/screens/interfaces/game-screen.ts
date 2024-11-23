import { LayerType } from "../../types/layer-type.js";
import { GameObject } from "../../objects/interfaces/game-object.js";
import { ScreenManagerService } from "../../services/screen-manager-service.js";

export interface GameScreen {
  isActive(): boolean;

  setScreenManagerService(screenManagerService: ScreenManagerService): void;

  loadObjects(): void;
  hasLoaded(): boolean;

  getObjectLayer(object: GameObject): LayerType;
  addObjectToLayer(layerId: LayerType, object: GameObject): void;

  update(deltaTimeStamp: number): void;
  render(context: CanvasRenderingContext2D): void;

  getOpacity(): number;
  setOpacity(opacity: number): void;
  hasTransitionFinished(): void;
}
