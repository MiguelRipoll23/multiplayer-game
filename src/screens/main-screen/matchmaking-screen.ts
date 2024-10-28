import { GameController } from "../../models/game-controller.js";
import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { ScreenTransitionService } from "../../services/screen-transition-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { WorldScreen } from "../world-screen.js";

export class MatchmakingScreen extends BaseGameScreen {
  private transitionService: ScreenTransitionService;
  private progressBarObject: ProgressBarObject | null = null;

  constructor(gameController: GameController) {
    super(gameController);
    this.transitionService = gameController.getTransitionService();
  }

  public override loadObjects(): void {
    this.loadProgressBarObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    const worldScreen = new WorldScreen(this.gameController);
    worldScreen.loadObjects();

    this.progressBarObject?.setProgress(1);
    this.transitionService.fadeOutAndIn(worldScreen, 1, 1);
  }

  private loadProgressBarObject(): void {
    this.progressBarObject = new ProgressBarObject(this.canvas);
    this.progressBarObject?.setText("Loading world screen....");
    this.uiObjects.push(this.progressBarObject);
  }
}
