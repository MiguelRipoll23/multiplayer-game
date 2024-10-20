import { GameController } from "../../models/game-controller.js";
import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { TitleObject } from "../../objects/common/title-object.js";
import { TransitionService } from "../../services/transition-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { WorldScreen } from "../world-screen.js";

export class MatchmakingScreen extends BaseGameScreen {
  private transitionService: TransitionService;
  private progressBarObject: ProgressBarObject | null = null;

  constructor(private readonly gameController: GameController) {
    super(gameController);
    this.transitionService = gameController.getTransitionService();
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.progressBarObject?.setText("Loading world screen...");
    this.progressBarObject?.setProgress(0.5);

    const worldScreen = new WorldScreen(this.gameController);
    worldScreen.loadObjects();

    this.progressBarObject?.setProgress(1);
    this.transitionService.fadeOutAndIn(worldScreen, 1, 1);
  }

  private loadTitleObject(): void {
    const titleObject = new TitleObject(this.canvas);
    titleObject.setText("MATCHMAKING");
    this.uiObjects.push(titleObject);
  }

  private loadMessageObject(): void {
    this.progressBarObject = new ProgressBarObject(this.canvas);
    this.progressBarObject?.setText("Finding sesions...");
    this.uiObjects.push(this.progressBarObject);
  }
}
