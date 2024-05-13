import { ProgressBarObject } from "../../objects/progress-bar-object.js";
import { TitleObject } from "../../objects/title-object.js";
import { GameLoopService } from "../../services/game-loop-service.js";
import { TransitionService } from "../../services/transition-service.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { WorldScreen } from "../world-screen.js";

export class MatchmakingScreen extends BaseGameScreen {
  private transitionService: TransitionService;
  private progressBarObject: ProgressBarObject | null = null;

  constructor(private readonly gameLoop: GameLoopService) {
    super(gameLoop);
    this.transitionService = gameLoop.getTransitionService();
  }

  public override loadObjects(): void {
    this.loadTitleObject();
    this.loadMessageObject();

    super.loadObjects();
  }

  public hasTransitionFinished(): void {
    this.progressBarObject?.setText("Loading world screen...");

    const worldScreen = new WorldScreen(this.gameLoop);
    worldScreen.loadObjects();

    this.progressBarObject?.setProgress(1);
    this.transitionService.fadeOutAndIn(worldScreen, 1, 1);
  }

  private loadTitleObject(): void {
    const titleObject = new TitleObject(this.canvas);
    titleObject.setText("// MATCHMAKING");
    this.uiObjects.push(titleObject);
  }

  private loadMessageObject(): void {
    this.progressBarObject = new ProgressBarObject(this.canvas);
    this.progressBarObject?.setText("Finding sesions...");
    this.uiObjects.push(this.progressBarObject);
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    super.render(context);
  }
}
